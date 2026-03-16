// Copyright 2024-2025, University of Colorado Boulder

/**
 * The HistogramSonifier class is used to manage the sounds for the histogram in the Projectile Data Lab.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import audioManager from '../../../../joist/js/audioManager.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import histogramTone_mp3 from '../../../sounds/histogramTone_mp3.js';
import projectileDataLab from '../../projectileDataLab.js';
import HistogramData from './HistogramData.js';

const binSoundClip = new SoundClip( histogramTone_mp3, { initialOutputLevel: 0.7 } );
soundManager.addSoundGenerator( binSoundClip );

// The histogram sonifier phase is used to keep track of the current state of the sonification, which can be
// 'idlePhase', 'highlightingBinPhase', or 'highlightingMeanPhase'. In the 'highlightingBinPhase', we keep track of the bin
// that is currently being sonified. In the 'highlightingMeanPhase', we keep track of whether the mean is currently being highlighted.
export type HistogramSonifierPhase =
  { phaseName: 'idlePhase' } |
  { phaseName: 'highlightingBinPhase'; highlightedBin: number } |
  { phaseName: 'highlightingMeanPhase'; isMeanHighlighted: boolean };

// In the Measures screen, when the mean is displayed, wait this many seconds before playing the mean tone
const MEAN_HIGHLIGHT_DELAY = 0.3;
const MEAN_HIGHLIGHT_DURATION = 0.4;

export default class HistogramSonifier {

  public readonly histogramSonifierPhaseProperty = new Property<HistogramSonifierPhase>( { phaseName: 'idlePhase' } );

  // The sorted data from the left to the rightmost bin
  private binnedData = new Map<number, HistogramData[]>();

  // An array of the map keys for binnedData in ascending order
  private sortedBins: number[] = [];

  // The index of the current bin being sonified
  private currentBinIndex = 0;

  // The time remaining for sonifying the current bin
  private timeRemainingInCurrentBin = 0;

  public constructor(
    private readonly shouldPlayMeanTone: () => boolean, // See the method declaration in PDLModel.ts
    private readonly playMeanTone: () => void, // See the method declaration in PDLModel.ts
    private binWidthProperty: TReadOnlyProperty<number>
  ) {

    // When the bin width changes, stop playing the sound
    binWidthProperty.link( () => {
      this.histogramSonifierPhaseProperty.value = { phaseName: 'idlePhase' };
    } );

    // This plays a tone for each bin, with the pitch corresponding to the number of projectiles in the bin
    this.histogramSonifierPhaseProperty.link( histogramSonifierPhase => {
      if ( histogramSonifierPhase.phaseName === 'highlightingBinPhase' ) {
        const sonifiedBinData = this.binnedData.get( histogramSonifierPhase.highlightedBin )!;
        const binHeight = sonifiedBinData.length;

        binSoundClip.setPlaybackRate( this.playbackRateForBinHeight( binHeight ) );
        binSoundClip.play();
      }
    } );

    // If the audio is disabled, stop the histogram sonification
    audioManager.audioEnabledProperty.lazyLink( audioEnabled => {
      if ( !audioEnabled ) {
        this.stopSonification();
      }
    } );
  }

  // Set the histogram data, which is used to determine the sonification
  public setHistogramData( data: HistogramData[], cancelSonification: boolean ): void {

    const binnedData = new Map<number, HistogramData[]>();
    const binWidth = this.binWidthProperty.value;

    for ( let i = 0; i < data.length; i++ ) {
      const projectile = data[ i ];

      // Calculate the bin for this value by its lower bound
      const bin = Math.floor( projectile.x / binWidth ) * binWidth;

      // Make sure there is an array object in this column, otherwise create one
      if ( !binnedData.has( bin ) ) {
        binnedData.set( bin, [] );
      }

      // Get the array for that column
      const column = binnedData.get( bin )!;
      column.push( projectile );
    }

    this.binnedData = binnedData;
    this.sortedBins = Array.from( this.binnedData.keys() ).sort( ( a, b ) => a - b );

    // If the data changes, stop playing the sound
    if ( cancelSonification ) {
      this.stopSonification();
    }
  }

  public toggleSonification(): void {
    if ( this.histogramSonifierPhaseProperty.value.phaseName === 'idlePhase' ) {
      this.startHistogramSoundSequence();
    }
    else {
      this.stopSonification();
    }
  }

  private stopSonification(): void {
    this.histogramSonifierPhaseProperty.value = { phaseName: 'idlePhase' };
  }

  // Initiate the sequence of sounds for the histogram bins
  private startHistogramSoundSequence(): void {

    // If binned data is empty, don't play anything
    if ( this.binnedData.size === 0 ) {
      return;
    }

    this.currentBinIndex = 0;

    this.timeRemainingInCurrentBin = this.getSoundDelayForCurrentBin();

    // Start the sonification with the first bin. NOTE: This line is duplicated with a line below that traverses to the next bin.
    this.histogramSonifierPhaseProperty.value = { phaseName: 'highlightingBinPhase', highlightedBin: this.sortedBins[ this.currentBinIndex ] };
  }

  public step( dt: number ): void {

    if ( this.histogramSonifierPhaseProperty.value.phaseName !== 'idlePhase' ) {

      this.timeRemainingInCurrentBin -= dt;

      if ( this.timeRemainingInCurrentBin <= 0 ) {

        if ( this.histogramSonifierPhaseProperty.value.phaseName === 'highlightingMeanPhase' ) {

          if ( this.histogramSonifierPhaseProperty.value.isMeanHighlighted ) {
            this.histogramSonifierPhaseProperty.value = { phaseName: 'idlePhase' };
          }
          else {
            this.playMeanTone();
            this.timeRemainingInCurrentBin = MEAN_HIGHLIGHT_DURATION;
            this.histogramSonifierPhaseProperty.value = { phaseName: 'highlightingMeanPhase', isMeanHighlighted: true };
          }
        }
        else {
          this.currentBinIndex++;

          this.timeRemainingInCurrentBin = this.getSoundDelayForCurrentBin();

          // If we went past the edge of the bins, stop playing
          if ( this.currentBinIndex >= this.binnedData.size ) {

            if ( this.shouldPlayMeanTone() ) {

              this.timeRemainingInCurrentBin = MEAN_HIGHLIGHT_DELAY;
              this.histogramSonifierPhaseProperty.value = { phaseName: 'highlightingMeanPhase', isMeanHighlighted: false };
            }
            else {
              this.histogramSonifierPhaseProperty.value = { phaseName: 'idlePhase' };
            }
          }
          else {

            // Continue sonification with the newly selected bin. NOTE: This line is duplicated with a line above that starts the sonification.
            this.histogramSonifierPhaseProperty.value = { phaseName: 'highlightingBinPhase', highlightedBin: this.sortedBins[ this.currentBinIndex ] };
          }
        }
      }
    }
  }

  // Maps the height of the bin to the playback rate of the sound
  private playbackRateForBinHeight = ( binHeight: number ): number => {

    // This power function passes through (1, 0.44) and (500, 3.1) with a decreasing slope
    return 1.6 * Math.pow( ( binHeight + 5.5 ), 0.18 ) - 1.8;
  };

  // Determines the delay of the sound between the current bin and the next bin.
  // This will add gaps between the sounds for bins that have empty bins between them.
  private getSoundDelayForCurrentBin = (): number => {

    // Get the difference in the horizontal position of the current bin and the next bin
    const currentBin: number | undefined = this.sortedBins[ this.currentBinIndex ];
    const nextBin: number | undefined = this.sortedBins[ this.currentBinIndex + 1 ];
    const binDifference = typeof currentBin === 'number' && typeof nextBin === 'number' ? nextBin - currentBin : this.binWidthProperty.value;

    // The delay for the sound is a function of the bin width
    const binWidthDelay = Utils.linear( 0.5, 10, 0.075, 0.4, this.binWidthProperty.value );

    // The maximum delay for the sound is 0.6 seconds or 3 times the bin width delay, whichever is smaller
    const maxSoundDelay = Math.min( 0.6, 3 * binWidthDelay );

    const numBinsToSonify = binDifference / this.binWidthProperty.value;

    return Math.min( maxSoundDelay, binWidthDelay * numBinsToSonify );
  };
}

projectileDataLab.register( 'HistogramSonifier', HistogramSonifier );