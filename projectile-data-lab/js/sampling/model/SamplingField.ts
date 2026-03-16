// Copyright 2023-2024, University of Colorado Boulder

/**
 * The SamplingField is an extension of the Field class that adds fields for the Sampling model. Note in order to support
 * CODAP, the "sample" is a number stored within the Projectile (rather than adding arrays or data structures here).
 * This allows CODAP students to see projectiles from different samples, or to filter by sample.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import PhetioIDUtils from '../../../../tandem/js/PhetioIDUtils.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Field, { FieldOptions } from '../../common/model/Field.js';
import HistogramData from '../../common/model/HistogramData.js';
import Launcher from '../../common/model/Launcher.js';
import { MeanTone } from '../../common/model/MeanTone.js';
import Projectile from '../../common/model/Projectile.js';
import { SingleOrContinuous } from '../../common/model/SingleOrContinuous.js';
import PDLPreferences from '../../common/PDLPreferences.js';
import PDLQueryParameters from '../../common/PDLQueryParameters.js';
import PDLUtils from '../../common/PDLUtils.js';
import projectileDataLab from '../../projectileDataLab.js';
import { SamplingPhase, SamplingPhaseValues } from './SamplingPhase.js';

type SelfOptions = EmptySelfOptions;
export type SamplingFieldOptions = SelfOptions & StrictOmit<FieldOptions, 'isLauncherOrientationPhetioInstrumented' | 'isProjectileTypePhetioInstrumented' | 'isLaunchHeightPhetioInstrumented'>;

// This is the delay between the last projectile landing and the mean symbol appearing, in 'Single sample' mode.
const MEAN_DELAY_NORMAL = 0.5;
const MEAN_DELAY_FAST = 1.5;

// This is the duration of the sample and mean symbol being visible, in 'Continuous' mode.
const CONTINUOUS_MODE_PERIOD = 0.4;

export default class SamplingField extends Field {
  protected override identifier: string;

  // A sample is "started" when the first projectile is launched for that sample.
  public readonly numberOfStartedSamplesProperty: NumberProperty;

  // A sample is "completed" when the mean indicator is shown after a delay following the last projectile landing.
  public readonly numberOfCompletedSamplesProperty: NumberProperty;

  // This Property is used to set the visibility and position of the mean indicator.
  // If it is null, the current sample is not yet complete and the mean indicator is not visible.
  // Note: In 'Single sample' mode, there is a delay between the last projectile in a sample and the mean indicator appearing.
  public readonly sampleMeanProperty: Property<number | null>;

  public readonly projectileCreatedEmitter = new Emitter<[ Projectile ]>( {
    parameters: [ {
      name: 'projectile',
      valueType: Projectile
    } ]
  } );

  // Total elapsed time of running the model, so we can update the current phase and/or move to the next phase.
  private readonly timeProperty: NumberProperty;

  // Mark the time when a phase began, so we can track how long we have been in the phase.
  private readonly phaseStartTimeProperty: NumberProperty;

  // Total time to launch all projectiles in single mode.
  private readonly totalSampleTime: number;

  // Current phase, see documentation above
  public readonly phaseProperty: StringUnionProperty<SamplingPhase>;

  public readonly selectedSampleNumberProperty: NumberProperty;

  // The history buffer keeps track of the last 10 phases, so we can show the user what has happened.
  // This is only used when assertions are turned on.
  private historyBuffer: string[] = [];

  // When pressing the eraser button, if the isContinuousLaunchingProperty is true, the field will automatically restart
  // on the next time step. See https://github.com/phetsims/projectile-data-lab/issues/289
  private _shouldResumeAfterClear = false;

  public constructor( launcher: Launcher,
                      public readonly sampleSize: number,
                      private readonly launchModeProperty: Property<SingleOrContinuous>,
                      providedOptions: SamplingFieldOptions ) {
    const options = optionize<SamplingFieldOptions, SelfOptions, FieldOptions>()( {
      isLauncherOrientationPhetioInstrumented: false,
      isProjectileTypePhetioInstrumented: false,
      isLaunchHeightPhetioInstrumented: false
    }, providedOptions );

    super( [ launcher ],

      // The launcher never changes on this field, but we still need a Property<Launcher> in the parent type to power
      // the DynamicProperty instances.
      new Property( launcher, {
        validValues: [ launcher ]
      } ),

      PDLUtils.colorForSampleSize( sampleSize ),

      options );

    this.selectedSampleNumberProperty = new NumberProperty( 1, {
      tandem: options.tandem.createTandem( 'selectedSampleNumberProperty' ),
      range: new Range( 1, PDLQueryParameters.maxSamples ),
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberType: 'Integer',
      phetioFeatured: true,
      phetioDocumentation: 'The selected sample being shown on the field.'
    } );

    this.identifier = PhetioIDUtils.getComponentName( this.phetioID );

    // PhET-iO instrumentation not needed since these are computable from the Projectiles and the phase
    this.numberOfStartedSamplesProperty = new NumberProperty( 0 );
    this.numberOfCompletedSamplesProperty = new NumberProperty( 0, {
      phetioDocumentation: 'The number of samples that have been completed.',
      tandem: options.tandem.createTandem( 'numberOfCompletedSamplesProperty' ),
      range: new Range( 0, PDLQueryParameters.maxSamples ),
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberType: 'Integer',
      phetioReadOnly: true,
      phetioFeatured: true,

      // State is managed by the projectiles and updated in the stateSetEmitter below
      phetioState: false
    } );

    // Increase the total time as the sample size increases, so that larger samples take longer but not too long.
    this.totalSampleTime =
      this.sampleSize === 2 ? 0.75 :
      this.sampleSize === 5 ? 2 :
      this.sampleSize === 15 ? 5 :
      this.sampleSize === 40 ? 9 :
      0;

    assert && assert( this.totalSampleTime > 0, 'this.totalSampleTime should be greater than 0' );

    this.sampleMeanProperty = new Property<number | null>( null, {
      reentrant: true
    } );

    this.phaseProperty = new StringUnionProperty<SamplingPhase>( 'idle', {
      validValues: SamplingPhaseValues,
      tandem: options.tandem.createTandem( 'phaseProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The sampling screen is managed by a finite state machine. The possible states are called phases. For internal phet-io use only, for managing state save and load.'
    } );

    this.timeProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'timeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The total elapsed time of running the model, so we can update the current phase and/or move to the next phase. For PhET-iO internal use only for managing state save and load.',
      units: 's'
    } );

    this.phaseStartTimeProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'phaseStartTimeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'Mark the time when a phase began, so we can track how long we have been in the phase. For PhET-iO internal use only for managing state save and load.',
      units: 's'
    } );

    const phaseChanged = () => {

      // Update the history buffer with the new phase
     assert && this.updateHistoryBuffer( this.phaseProperty.value );

      this.phaseStartTimeProperty.value = this.timeProperty.value;
      this.updateComputedProperties();
    };

    this.phaseProperty.link( phaseChanged );

    this.selectedSampleNumberProperty.link( () => {
      this.updateComputedProperties();
    } );

    phetioStateSetEmitter.addListener( () => {
      this.updateComputedProperties();

      // If we are showing a complete sample with mean, the mean must be non-null to be used in the histogram and playing the meanTone.
      // When showingCompleteSampleWithoutMean, the sampleMeanProperty is null to delay the histogram from immediately updating.
      if ( this.phaseProperty.value === 'showingCompleteSampleWithMean' ) {
        assert && assert( this.sampleMeanProperty.value !== null, 'sampleMeanProperty should not be null in showingCompleteSampleWithMean phase. Projectiles in selected sample: ' + this.getProjectilesInSelectedSample().length + '. Sample size: ' + this.sampleSize + '. Phase history buffer: ' + this.historyBuffer.join( ' -> ' ) );
      }
    } );

    this.numberOfStartedSamplesProperty.link( numberOfStartedSamples => {
      if ( numberOfStartedSamples >= PDLQueryParameters.maxSamples ) {
        this.isContinuousLaunchingProperty.value = false;
      }
    } );
  }

  /**
   * In this simulation, some of the properties are computed from the state of the projectiles+phase, so we need to update
   * them accordingly.
   */
  public updateComputedProperties(): void {
    const totalProjectiles = this.getTotalProjectileCount();

    if ( this.phaseProperty.value === 'idle' ) {
      this.numberOfStartedSamplesProperty.value = 0;
      this.numberOfCompletedSamplesProperty.value = 0;
      this.sampleMeanProperty.value = null;
    }
    else {

      // If the selected sample is greater than the number of started samples, then we are about to start creating projectiles for a new sample
      this.numberOfStartedSamplesProperty.value = Math.max( Math.ceil( totalProjectiles / this.sampleSize ), this.selectedSampleNumberProperty.value );

      this.numberOfCompletedSamplesProperty.value =
        this.phaseProperty.value === 'showingCompleteSampleWithMean' ? this.numberOfStartedSamplesProperty.value :
        this.numberOfStartedSamplesProperty.value - 1;

      // Update the sample mean
      const projectilesInSelectedSample = this.getProjectilesInSelectedSample();

      // This multilink is called during transient intermediate phases, so we must guard and make sure we truly have a complete sample
      const isComplete = this.phaseProperty.value === 'showingCompleteSampleWithMean' && projectilesInSelectedSample.length === this.sampleSize;

      this.sampleMeanProperty.value = isComplete ? _.mean( projectilesInSelectedSample.map( projectile => projectile.x ) ) : null;
    }
  }

  public getProjectilesInSelectedSample(): Projectile[] {
    return this.getProjectilesInSample( this.selectedSampleNumberProperty.value );
  }

  public getProjectilesInSample( sampleNumber: number ): Projectile[] {
    return this.getAllProjectiles().filter( projectile => projectile.sampleNumber === sampleNumber );
  }

  public getLandedProjectilesInSelectedSample(): Projectile[] {
    return this.landedProjectiles.filter( projectile => projectile.sampleNumber === this.selectedSampleNumberProperty.value );
  }

  /**
   * Return an array of samples which have their means currently showing. Each sample is an object with a single property, x,
   * which is the mean distance of projectiles in that sample. This is used for the histogram.
   */
  public getHistogramData(): HistogramData[] {

    // Map to accumulate projectiles by their sample number
    const sampleAccumulator = new Map<number, Projectile[]>();

    // Iterate through landed projectiles once, grouping them by sample number
    this.landedProjectiles.forEach( projectile => {
      if ( !sampleAccumulator.has( projectile.sampleNumber ) ) {
        sampleAccumulator.set( projectile.sampleNumber, [] );
      }
      sampleAccumulator.get( projectile.sampleNumber )!.push( projectile );
    } );

    // Array to hold the final histogram data
    const samples: HistogramData[] = [];

    // Iterate through the accumulated sample data to compute means
    sampleAccumulator.forEach( ( projectiles, sampleNumber ) => {
      if ( projectiles.length === this.sampleSize && sampleNumber <= this.numberOfCompletedSamplesProperty.value ) {
        const mean = _.mean( projectiles.map( projectile => projectile.x ) );
        assert && assert( !isNaN( mean ), 'mean should not be NaN' );
        samples.push( { x: mean } );
      }
    } );

    return samples;
  }

  private createLandedProjectile( sampleNumber: number ): void {
    const projectile = this.createProjectile( sampleNumber, false );
    this.projectileCreatedEmitter.emit( projectile );

    // Add the projectile to the airborne array, so that the Field moves it to the
    // landed array when the projectileLandedEmitter is fired.
    this.airborneProjectiles.push( projectile );
    projectile.setLanded();
    this.projectileLandedEmitter.emit( projectile );

    this.projectilesChangedEmitter.emit();
  }

  // If the user fires a new sample while a prior sample was in progress, finish up the prior sample.
  // Most important for 'Single' mode
  public finishCurrentSample(): void {
    this.finishSample( this.selectedSampleNumberProperty.value );
  }

  private finishSample( sampleNumber: number ): void {

    // Create remaining projectiles for the sample
    let changed = false;
    let n = this.getProjectilesInSample( sampleNumber ).length;
    while ( n < this.sampleSize ) {
      changed = true;
      this.createLandedProjectile( sampleNumber );
      n++;
    }

    // Anything in the air should end up on the ground.
    this.getProjectilesInSample( sampleNumber ).forEach( projectile => {
      if ( this.airborneProjectiles.includes( projectile ) ) {
        projectile.setLanded();
        this.projectileLandedEmitter.emit( projectile );
        changed = true;
      }
    } );

    if ( changed ) {

      if ( !PDLPreferences.autoGenerateDataProperty.value ) {
        this.updateComputedProperties();
        this.projectilesChangedEmitter.emit();
      }
    }
  }

  private updateHistoryBuffer( phase: string ): void {
    // Add the new phase to the end of the buffer
    this.historyBuffer.push( phase );

    // If the buffer exceeds 10 elements, remove the oldest one
    if ( this.historyBuffer.length > 10 ) {
      this.historyBuffer.shift();
    }
  }

  public step( dt: number, timeSpeed: TimeSpeed ): void {

    this.stepAirborneProjectiles( dt );

    this.timeProperty.value += dt;
    const timeInMode = this.timeProperty.value - this.phaseStartTimeProperty.value;

    if ( this.phaseProperty.value === 'idle' ) {

      // At the time the clear button was pressed, was the system in continuous mode and running?
      if ( this._shouldResumeAfterClear ) {

        // Is the system *still* in a mode where we want to resume generating data after clear?
        if ( this.isContinuousLaunchingProperty.value && this.launchModeProperty.value === 'continuous' ) {

          // NOTE: Duplication alert. This is similar to the code in showingCompleteSampleWithMean
          this.finishCurrentSample();
          this.phaseProperty.value = 'showingCompleteSampleWithMean';
          this.updateComputedProperties();
          this.phaseStartTimeProperty.value = this.timeProperty.value;
          this.projectilesChangedEmitter.emit();

          assert && assert( typeof this.sampleMeanProperty.value === 'number', 'sampleMeanProperty should be a number in showingCompleteSampleWithMean phase. Projectiles in selected sample: ' + this.getProjectilesInSelectedSample().length + '. Sample size: ' + this.sampleSize );
          MeanTone.playMean( this.sampleMeanProperty.value! );
        }

        this._shouldResumeAfterClear = false;
      }
    }
    else if ( this.phaseProperty.value === 'showingAirborneProjectiles' ) { // Only for single mode

      // The continuous amount we have progressed through the current sample
      const portionOfSample = Math.min( timeInMode / this.totalSampleTime, 1 );

      // Compute the number of projectile that should be showing at this time
      const numberProjectilesToShow = Math.ceil( portionOfSample * this.sampleSize );

      let changed = false;
      while ( this.getProjectilesInSelectedSample().length < numberProjectilesToShow ) {
        const projectile = this.createProjectile( this.selectedSampleNumberProperty.value, true );
        this.airborneProjectiles.push( projectile );
        this.projectileCreatedEmitter.emit( projectile );
        changed = true;
      }

      if ( changed ) {
        this.projectilesChangedEmitter.emit();
        this.updateComputedProperties();
      }

      // Allow extra time to show focus on the final projectile before showing the sample mean
      if ( this.getLandedProjectilesInSelectedSample().length === this.sampleSize ) {

        this.phaseProperty.value = 'showingCompleteSampleWithoutMean';
      }
    }
    else if ( this.phaseProperty.value === 'showingCompleteSampleWithoutMean' ) { // Only for single mode

      const delayForShowingMean = timeSpeed === TimeSpeed.FAST ? MEAN_DELAY_FAST : MEAN_DELAY_NORMAL;

      if ( timeInMode > delayForShowingMean ) {
        this.phaseProperty.value = 'showingCompleteSampleWithMean';

        if ( this.sampleMeanProperty.value !== null ) {
          MeanTone.playMean( this.sampleMeanProperty.value );
        }
      }
    }
    else if ( this.phaseProperty.value === 'showingCompleteSampleWithMean' ) {
      if (
        this.launchModeProperty.value === 'continuous' &&
        this.isContinuousLaunchingProperty.value &&
        timeInMode >= CONTINUOUS_MODE_PERIOD &&
        this.numberOfCompletedSamplesProperty.value < PDLQueryParameters.maxSamples ) {

        // Create all projectiles for this sample immediately and go to next one
        this.selectedSampleNumberProperty.value++;

        this.finishCurrentSample();

        // updateComputedProperties in finishCurrentSample is shut off during auto-generated data, so we need to call it here
        if ( PDLPreferences.autoGenerateDataProperty.value ) {
          this.updateComputedProperties();
        }

        // Manually restart the phase timer, since the phase will not change when showing sequential continuous samples
        this.phaseStartTimeProperty.value = this.timeProperty.value;

        this.projectilesChangedEmitter.emit();

        assert && assert( typeof this.sampleMeanProperty.value === 'number', 'sampleMeanProperty should be a number in showingCompleteSampleWithMean phase. Projectiles in selected sample: ' + this.getProjectilesInSelectedSample().length + '. Sample size: ' + this.sampleSize );
        MeanTone.playMean( this.sampleMeanProperty.value! );
      }
    }
  }

  // When the eraser button is pressed, clear the selected Field's projectiles.
  public override clearProjectiles(): void {
    super.clearProjectiles();

    this._shouldResumeAfterClear = this.phaseProperty.value === 'showingCompleteSampleWithMean' &&
                                   this.isContinuousLaunchingProperty.value &&
                                   this.launchModeProperty.value === 'continuous';

    this.phaseProperty.reset();
    this.timeProperty.reset();
    this.phaseStartTimeProperty.reset();
    this.selectedSampleNumberProperty.reset();

    if ( !this._shouldResumeAfterClear ) {
      this.isContinuousLaunchingProperty.reset();
    }

    this.updateComputedProperties();
  }

  public override reset(): void {
    super.reset();
    this.launchModeProperty.reset();

    this._shouldResumeAfterClear = false;
  }
}

projectileDataLab.register( 'SamplingField', SamplingField );