// Copyright 2023-2025, University of Colorado Boulder

/**
 * Axis is a data structure that describes one axis (one number line) of a double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import unitRates from '../../unitRates.js';

const defaultValueFormatStringProperty = new StringProperty( SunConstants.VALUE_NUMBERED_PLACEHOLDER );

type SelfOptions = {
  unitsStringProperty: TReadOnlyProperty<string>; // units for the axis, used to label the axis
  maxDigits?: number; // maximum number of digits on the keypad, integer > 0
  maxDecimals?: number; // maximum number of decimal places, integer >= 0
  valueFormatStringProperty?: TReadOnlyProperty<string>; // pattern used to display value for the axis
  trimZeros?: boolean; // whether to trim trailing zeros from decimal places
};

export type AxisOptions = SelfOptions;

export default class Axis {

  // See SelfOptions for documentation
  public readonly unitsStringProperty: TReadOnlyProperty<string>;
  public readonly maxDigits: number;
  public readonly maxDecimals: number;
  public readonly valueFormatStringProperty: TReadOnlyProperty<string>;
  public readonly trimZeros: boolean;

  public constructor( providedOptions?: AxisOptions ) {

    const options = optionize<AxisOptions, SelfOptions>()( {

      // SelfOptions
      maxDigits: 4,
      maxDecimals: 2,
      trimZeros: false,
      valueFormatStringProperty: defaultValueFormatStringProperty
    }, providedOptions );

    assert && assert( Number.isInteger( options.maxDigits ) && options.maxDigits > 0 );
    assert && assert( Number.isInteger( options.maxDecimals ) && options.maxDecimals >= 0 );

    this.unitsStringProperty = options.unitsStringProperty;
    this.maxDigits = options.maxDigits;
    this.maxDecimals = options.maxDecimals;
    this.valueFormatStringProperty = options.valueFormatStringProperty;
    this.trimZeros = options.trimZeros;
  }
}

unitRates.register( 'Axis', Axis );