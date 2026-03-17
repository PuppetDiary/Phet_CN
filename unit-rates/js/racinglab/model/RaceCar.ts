// Copyright 2017-2025, University of Colorado Boulder

/**
 * Model of a race car in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import Axis from '../../common/model/Axis.js';
import DoubleNumberLine from '../../common/model/DoubleNumberLine.js';
import Marker from '../../common/model/Marker.js';
import MarkerEditor from '../../common/model/MarkerEditor.js';
import Rate from '../../common/model/Rate.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import RaceTrack from './RaceTrack.js';

type SelfOptions = {
  color?: Color | string; // color used for things that are associated with the car (markers, spinners, ...)
  rate?: Rate; // initial rate, in miles per hour
  visible?: boolean; // is this car visible?
  trackLength?: number; // length of this car's track
  majorMarkerSpacing?: number; // spacing for major markers on this car's double number line
};

type RaceCarOptions = SelfOptions;

export default class RaceCar {

  public readonly image: HTMLImageElement;
  public readonly numeratorAxis: Axis;
  public readonly denominatorAxis: Axis;
  public readonly color: Color | string;
  public readonly rate: Rate;
  public readonly distanceProperty: NumberProperty; // the car's distance from the starting line, in miles
  public readonly timeProperty: NumberProperty; // time for this car, in hours
  public readonly visibleProperty: BooleanProperty; // is this car visible?
  public readonly track: RaceTrack;
  public readonly doubleNumberLine: DoubleNumberLine;
  public readonly markerEditor: MarkerEditor;

  public constructor( image: HTMLImageElement, providedOptions?: RaceCarOptions ) {

    const options = optionize<RaceCarOptions, SelfOptions>()( {

      // SelfOptions
      color: 'black',
      rate: new Rate( 50, 2 ),
      visible: true,
      trackLength: 200,
      majorMarkerSpacing: 25
    }, providedOptions );

    this.image = image;
    this.color = options.color;
    this.rate = options.rate;
    this.distanceProperty = new NumberProperty( 0 );
    this.timeProperty = new NumberProperty( 0 );
    this.visibleProperty = new BooleanProperty( options.visible );
    this.track = new RaceTrack( { length: options.trackLength } );

    // Specifies the interval for major markers
    const isMajorMarker = ( numerator: number, denominator: number ) => {
      return ( numerator % options.majorMarkerSpacing === 0 );
    };

    this.numeratorAxis = new Axis( {
      unitsStringProperty: UnitRatesStrings.milesStringProperty,
      maxDigits: 5,
      maxDecimals: 1,
      trimZeros: true
    } );

    this.denominatorAxis = new Axis( {
      unitsStringProperty: UnitRatesStrings.hoursStringProperty,
      maxDigits: 4,
      maxDecimals: 2,
      trimZeros: true
    } );

    this.doubleNumberLine = new DoubleNumberLine( this.rate.unitRateProperty, this.numeratorAxis, this.denominatorAxis, {

      // Numerator axis is fixed at 200 miles, so we will mutate the denominator (hours) when rate changes
      fixedAxis: 'numerator',
      fixedAxisRange: new Range( 0, 200 ),

      // Specifies the interval for major markers
      isMajorMarker: isMajorMarker
    } );

    this.markerEditor = new MarkerEditor( this.rate.unitRateProperty, this.numeratorAxis, this.denominatorAxis );

    // create a marker when the car reaches the finish line. unlink not needed
    let persistentMarker: Marker | null = null;
    this.distanceProperty.link( distance => {

      // make the current persistent marker erasable
      if ( persistentMarker ) {
        persistentMarker.erasable = true;
        persistentMarker = null;
      }

      // create a marker that is not erasable
      if ( distance === this.track.lengthProperty.value ) {
        persistentMarker = new Marker( 'race', distance, this.timeProperty.value, this.numeratorAxis, this.denominatorAxis, {
          isMajor: isMajorMarker( distance, this.timeProperty.value ),
          color: this.color,
          erasable: false
        } );
        this.doubleNumberLine.addMarker( persistentMarker );
      }
    } );
  }

  public reset(): void {
    this.rate.reset();
    this.distanceProperty.reset();
    this.visibleProperty.reset();
    this.timeProperty.reset();
    this.track.reset();
    this.doubleNumberLine.reset();
    this.markerEditor.reset();
  }

  /**
   * Moves the car to the starting line and resets the time.
   */
  public resetRace(): void {
    this.distanceProperty.reset();
    this.timeProperty.reset();
  }

  /**
   * Is the car at the finish line?
   */
  public isAtFinish(): boolean {
    return ( this.distanceProperty.value === this.track.lengthProperty.value );
  }

  /**
   * Updates the car and timer.
   * @param dt - elapsed time since previous call to step, in seconds
   */
  public step( dt: number ): void {
    if ( this.visibleProperty.value && ( this.distanceProperty.value < this.track.lengthProperty.value ) ) {

      // Map from sim time (seconds) to race time (hours).
      // see https://github.com/phetsims/unit-rates/issues/95
      const deltaRaceTime = Utils.linear( 0, 1, 0, URQueryParameters.raceTimeScale, dt );

      // distance traveled, in miles
      const deltaDistance = deltaRaceTime * this.rate.unitRateProperty.value;

      if ( this.distanceProperty.value + deltaDistance >= this.track.lengthProperty.value ) {

        // car has reached the finish line
        this.timeProperty.value = this.track.lengthProperty.value / this.rate.unitRateProperty.value;
        this.distanceProperty.value = this.track.lengthProperty.value;
      }
      else {

        // move incrementally
        this.timeProperty.value = this.timeProperty.value + deltaRaceTime;
        this.distanceProperty.value = this.distanceProperty.value + deltaDistance;
      }
    }
  }
}

unitRates.register( 'RaceCar', RaceCar );