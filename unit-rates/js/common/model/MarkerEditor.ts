// Copyright 2017-2025, University of Colorado Boulder

/**
 * Model for the marker editor.
 * The rate created by the marker editor is used as the basis for creating markers on the double number line.
 * Position of the marker editor is handled by the view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import unitRates from '../../unitRates.js';
import Axis from './Axis.js';

export default class MarkerEditor {

  public readonly unitRateProperty: TReadOnlyProperty<number>;
  public readonly numeratorAxis: Axis;
  public readonly denominatorAxis: Axis;
  public readonly numeratorProperty: Property<number | null>; // the numerator in the editor, null if no numerator
  public readonly denominatorProperty: Property<number | null>; // the denominator in the editor, null if no denominator

  public constructor( unitRateProperty: TReadOnlyProperty<number>,
                      numeratorAxis: Axis,
                      denominatorAxis: Axis ) {

    this.unitRateProperty = unitRateProperty;
    this.numeratorAxis = numeratorAxis;
    this.denominatorAxis = denominatorAxis;

    // Options shared by numeratorProperty and denominatorProperty.
    const propertyOptions: PropertyOptions<number | null> = {

      // Required by the implementation of DoubleNumberLineAccordionBox markerObserver.
      // See https://github.com/phetsims/unit-rates/issues/216
      reentrant: true,

      // Required by the implementation of DoubleNumberLineAccordionBox markerObserver.
      // See https://github.com/phetsims/unit-rates/issues/232.
      reentrantNotificationStrategy: 'stack'
    };

    this.numeratorProperty = new Property<number | null>( null, propertyOptions );

    this.denominatorProperty = new Property<number | null>( null, propertyOptions );

    // if a numerator is entered that can't be computed from the existing denominator, then clear the denominator
    this.numeratorProperty.link( numerator => { // no unlink required
      if ( numerator !== null && this.denominatorProperty.value !== null ) {
        const correctNumerator = Utils.toFixedNumber( this.denominatorProperty.value * unitRateProperty.value, numeratorAxis.maxDecimals );
        if ( numerator !== correctNumerator ) {
          this.denominatorProperty.value = null;
        }
      }
    } );

    // if a denominator is entered that can't be computed from the existing numerator, then clear the numerator
    this.denominatorProperty.link( denominator => { // no unlink required
      if ( denominator !== null && this.numeratorProperty.value !== null ) {
        const correctDenominator = Utils.toFixedNumber( this.numeratorProperty.value / unitRateProperty.value, denominatorAxis.maxDecimals );
        if ( denominator !== correctDenominator ) {
          this.numeratorProperty.value = null;
        }
      }
    } );

    // if the unit rate changes, reset the editor, which effectively cancels any edit that is in progress
    // unlink not needed, exists for sim lifetime
    unitRateProperty.lazyLink( () => {
      this.reset();
    } );
  }

  public reset(): void {
    this.numeratorProperty.reset();
    this.denominatorProperty.reset();
  }

  /**
   * The marker editor is 'empty' when both the numerator and denominator are null.
   */
  public isEmpty(): boolean {
    return ( this.numeratorProperty.value === null && this.denominatorProperty.value === null );
  }
}

unitRates.register( 'MarkerEditor', MarkerEditor );