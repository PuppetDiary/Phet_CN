// Copyright 2016-2023, University of Colorado Boulder

/**
 * Utility functions that are specific to this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import unitRates from '../unitRates.js';

const URUtils = {

  /**
   * Formats a number, using nearest-neighbor rounding.
   * @param format - the format, which must contain SunConstants.VALUE_NUMBERED_PLACEHOLDER for the value
   * @param value - the number
   * @param maxDecimals - the maximum number of decimal places
   * @param trimZeros - whether to trim trailing zeros from the decimal places (eg, 1.20 -> 1.2)
   */
  formatNumber( format: string, value: number, maxDecimals: number, trimZeros: boolean ): string {

    // stringTest indiscriminately replaces all strings, with no regard to formatting placeholders.
    if ( !phet.chipper.queryParameters.stringTest ) {
      assert && assert( format.includes( SunConstants.VALUE_NUMBERED_PLACEHOLDER ),
        `missing placeholder in format: ${format}` );
    }
    return StringUtils.format( format, URUtils.numberToString( value, maxDecimals, trimZeros ) );
  },

  /**
   * Converts a number to a string, using nearest-neighbor rounding.
   * @param value - the number
   * @param maxDecimals - the maximum number of decimal places
   * @param trimZeros - whether to trim trailing zeros from the decimal places (eg, 1.20 -> 1.2)
   */
  numberToString( value: number, maxDecimals: number, trimZeros: boolean ): string {
    if ( trimZeros ) {
      return Utils.toFixedNumber( value, maxDecimals ).toString();
    }
    else {
      return Utils.toFixed( value, maxDecimals );
    }
  },

  /**
   * Gets the number of decimal places in a number, or a number that has been converted to a string.
   */
  decimalPlaces( numberOrString: number | string ): number {

    // convert to string
    const str = ( `${numberOrString}` );
    assert && assert( str.length > 0, `invalid argument: ${str}` );

    // find the decimal point
    assert && assert( ( str.match( /\./g ) || [] ).length <= 1, `too many decimal points: ${str}` );
    const decimalIndex = str.indexOf( '.' );

    if ( decimalIndex === -1 ) {

      // no decimal places
      return 0;
    }
    else {

      // count digits to right of decimal point
      return str.substring( decimalIndex + 1, str.length ).length;
    }
  }
};

unitRates.register( 'URUtils', URUtils );

export default URUtils;