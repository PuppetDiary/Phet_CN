// Copyright 2016-2025, University of Colorado Boulder

/**
 * Model for the double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';
import Axis from './Axis.js';
import Marker from './Marker.js';

// Which of the axes has a fix (immutable) range

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FixedAxisValues = [ 'numerator', 'denominator' ] as const;
export type FixedAxis = ( typeof FixedAxisValues )[number];

type SelfOptions = {
  fixedAxis?: FixedAxis; // which of the axes has a fixed (immutable) range
  fixedAxisRange?: Range; // range of the fixed axis
  isMajorMarker?: ( numerator: number, denominator: number ) => boolean; // determines whether a marker is major
};

type DoubleNumberLineOptions = SelfOptions;

export default class DoubleNumberLine {

  public readonly unitRateProperty: TReadOnlyProperty<number>;
  public readonly numeratorAxis: Axis; // axis for the numerator (top) number line
  public readonly denominatorAxis: Axis; // axis for the denominator (bottom) number line
  public readonly fixedAxis: FixedAxis; // which of the axes has a fixed range, see FIXED_AXIS_VALUES
  public readonly isMajorMarker: ( numerator: number, denominator: number ) => boolean; // determines whether a marker is major
  private readonly numeratorRangeProperty: TReadOnlyProperty<Range>;
  private readonly denominatorRangeProperty: TReadOnlyProperty<Range>;

  // NOTE: markers must be added/removed via addMarker/removeMarker
  public readonly markers: ObservableArray<Marker>;

  // Marker that can be removed by pressing the undo button. A single level of undo is supported.
  public readonly undoMarkerProperty: Property<Marker | null>;

  public constructor( unitRateProperty: TReadOnlyProperty<number>,
                      numeratorAxis: Axis,
                      denominatorAxis: Axis,
                      providedOptions?: DoubleNumberLineOptions ) {

    const options = optionize<DoubleNumberLineOptions, SelfOptions>()( {

      // SelfOptions
      fixedAxis: 'denominator',
      fixedAxisRange: new Range( 0, 10 ),
      isMajorMarker: ( numerator: number, denominator: number ) => true
    }, providedOptions );

    this.unitRateProperty = unitRateProperty;
    this.numeratorAxis = numeratorAxis;
    this.denominatorAxis = denominatorAxis;
    this.fixedAxis = options.fixedAxis;
    this.isMajorMarker = options.isMajorMarker;

    this.markers = createObservableArray();
    this.undoMarkerProperty = new Property<Marker | null>( null );

    if ( options.fixedAxis === 'numerator' ) {

      // numerator range is immutable
      this.numeratorRangeProperty = new Property( options.fixedAxisRange );
      this.numeratorRangeProperty.lazyLink( range => {  // unlink not needed, exists for sim lifetime
        throw new Error( 'numeratorRangeProperty should not change' );
      } );

      // denominator range is mutable, dispose not needed, exists for sim lifetime
      this.denominatorRangeProperty = new DerivedProperty( [ this.numeratorRangeProperty, unitRateProperty ],
        ( numeratorRange, unitRate ) => {
          return new Range( numeratorRange.min / unitRate, numeratorRange.max / unitRate );
        } );

      // when the denominator range changes, adjust the denominator of all markers,
      // unlink not needed, exists for sim lifetime
      this.denominatorRangeProperty.link( denominatorRange => {
        this.markers.forEach( marker => {
          marker.denominatorProperty.value = marker.numeratorProperty.value / unitRateProperty.value;
        } );
      } );
    }
    else {

      // denominator range is immutable
      this.denominatorRangeProperty = new Property( options.fixedAxisRange );
      this.denominatorRangeProperty.lazyLink( range => { // unlink not needed, exists for sim lifetime
        throw new Error( 'denominatorRangeProperty should not change' );
      } );

      // numerator range is mutable, dispose not needed, exists for sim lifetime
      this.numeratorRangeProperty = new DerivedProperty( [ this.denominatorRangeProperty, unitRateProperty ],
        ( denominatorRange, unitRate ) => {
          return new Range( denominatorRange.min * unitRate, denominatorRange.max * unitRate );
        } );

      // when the numerator range changes, adjust the numerator of all markers
      // unlink not needed, exists for sim lifetime
      this.numeratorRangeProperty.link( numeratorRange => {
        this.markers.forEach( marker => {
          marker.numeratorProperty.value = marker.denominatorProperty.value * unitRateProperty.value;
        } );
      } );
    }
  }

  public reset(): void {
    this.markers.reset();
    this.undoMarkerProperty.reset();
  }

  /**
   * Maps a rate's numerator from model to view coordinate frame.
   * @param numerator - numerator in model coordinate frame
   * @param viewMax - numerator's maximum in view coordinate frame
   */
  public modelToViewNumerator( numerator: number, viewMax: number ): number {
    return Utils.linear(
      this.numeratorRangeProperty.value.min, this.numeratorRangeProperty.value.max,
      0, viewMax,
      numerator );
  }

  /**
   * Maps a rate's denominator from model to view coordinate frame.
   * @param denominator - denominator in model coordinate frame
   * @param viewMax - denominator's maximum in view coordinate frame
   */
  public modelToViewDenominator( denominator: number, viewMax: number ): number {
    return Utils.linear(
      this.denominatorRangeProperty.value.min, this.denominatorRangeProperty.value.max,
      0, viewMax,
      denominator );
  }

  /**
   * Gets the maximum value that fits on the numerator (top) axis.
   */
  public getMaxNumerator(): number {
    return this.numeratorRangeProperty.value.max;
  }

  /**
   * Gets the maximum value that fits on the denominator (bottom) axis.
   */
  public getMaxDenominator(): number {
    return this.denominatorRangeProperty.value.max;
  }

  /**
   * This is a request to add a marker, subject to rules about uniqueness and marker precedence.
   * The rules are complicated to describe, so please consult the implementation.
   * Calling this function may result in a lower precedence marker being deleted as a side effect.
   * @param marker
   * @returns true if the marker was added, false if the request was ignored
   */
  public addMarker( marker: Marker ): boolean {

    assert && assert( !this.markers.includes( marker ), `attempt to add marker again: ${marker}` );

    let wasAdded = false; //{boolean} state to determine whether the marker was added or not

    // look for a marker that conflicts with this one (has same numerator or denominator)
    const conflictingMarker = this.getConflictingMarker( marker );

    if ( !conflictingMarker ) {

      // if there is no marker that conflicts with this one, then simply add the marker
      this.markers.add( marker );
      wasAdded = true;
    }
    else if ( conflictingMarker.precedenceOf( marker ) >= 0 ) {

      // Replace with higher or same precedence marker.
      // Need to replace same precedence marker so that undo marker is properly set.
      this.removeMarker( conflictingMarker );
      if ( this.undoMarkerProperty.value === conflictingMarker ) {
        this.undoMarkerProperty.value = null;
      }
      this.markers.add( marker );
      wasAdded = true;
    }
    else {

      // ignore lower precedence marker
      phet.log && phet.log( `ignoring lower precedence marker: ${marker.toString()}` );
    }

    return wasAdded;
  }

  /**
   * Removes a marker.
   */
  public removeMarker( marker: Marker ): void {
    assert && assert( this.markers.includes( marker ), `attempt to remove an unknown marker: ${marker}` );
    this.markers.remove( marker );
  }

  /**
   * Gets a marker that conflicts with the specified marker.
   * Two markers conflict if they have the same numerator or denominator, which is possible due to rounding errors.
   * @param marker
   * @returns null if there is no conflicting
   */
  private getConflictingMarker( marker: Marker ): Marker | null {
    let conflictingMarker = null;
    for ( let i = 0; i < this.markers.length && !conflictingMarker; i++ ) {
      if ( marker.conflictsWith( this.markers[ i ] ) ) {
        conflictingMarker = this.markers[ i ];
      }
    }
    return conflictingMarker;
  }

  /**
   * Does this marker fall within the range of the axes?
   */
  public markerIsInRange( marker: Marker ): boolean {
    return ( this.numeratorRangeProperty.value.contains( marker.numeratorProperty.value ) &&
             this.denominatorRangeProperty.value.contains( marker.denominatorProperty.value ) );
  }

  /**
   * Undoes (removes) the undo marker. If there is no undo marker, this is a no-op.
   */
  public undo(): void {
    const undoMarker = this.undoMarkerProperty.value;
    if ( undoMarker ) {
      assert && assert( this.markers.includes( undoMarker ), `unexpected undoMarker: ${undoMarker}` );
      this.undoMarkerProperty.value = null;
      this.removeMarker( undoMarker );
    }
  }

  /**
   * Erases all markers that are erasable.
   */
  public erase(): void {

    this.undoMarkerProperty.reset();

    // Remove all markers that are erasable. Since this modified the array, iterator on a copy.
    this.markers.slice().forEach( marker => {
      if ( marker.erasable ) {
        this.removeMarker( marker );
      }
    } );
  }
}

unitRates.register( 'DoubleNumberLine', DoubleNumberLine );