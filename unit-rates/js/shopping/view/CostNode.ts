// Copyright 2017-2025, University of Colorado Boulder

/**
 * Displays cost with an optional 3rd decimal place.
 * The specifications from https://github.com/phetsims/unit-rates/issues/44 are:
 *
 * - Third decimal is gray
 * - If cost has fewer than 3 decimals, then 3rd decimal is not displayed
 * - If 3rd decimal is not displayed, it still takes up space, so that cost value doesn't shift around
 * - Cost is truncated (not rounded) to 3 decimals (e.g. $1.2349 becomes $1.234)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';

type SelfOptions = {
  extraDecimalVisible?: boolean; // is the extra decimal place visible?
  font?: PhetFont; // font for all parts of the value
  extraDecimalColor?: Color | string; // color of the extra decimal place
};

type CostNodeOptions = SelfOptions;

export default class CostNode extends Node {

  public constructor( costProperty: TReadOnlyProperty<number>, providedOptions?: CostNodeOptions ) {

    const options = optionize<CostNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      extraDecimalVisible: false,
      font: new PhetFont( 20 ),
      extraDecimalColor: 'gray',

      // NodeOptions
      isDisposable: false,
      maxWidth: 90 // i18n, determined empirically
    }, providedOptions );

    super();

    // dollar sign (or other currency symbol)
    // always to the left of the value on the scale, see https://github.com/phetsims/unit-rates/issues/176
    const dollarSignNode = new Text( UnitRatesStrings.dollarSignStringProperty, {
      font: options.font
    } );
    this.addChild( dollarSignNode );

    // the primary part of the value, without the extra decimal place
    const primaryNode = new Text( '', {
      font: options.font
    } );
    this.addChild( primaryNode );

    // the extra decimal place
    const extraDecimalNode = new Text( '', {
      font: options.font,
      fill: options.extraDecimalColor
    } );
    if ( options.extraDecimalVisible ) {
      this.addChild( extraDecimalNode );
    }

    // When cost changes, update the displayed value
    const costObserver = ( cost: number ) => {

      assert && assert( cost >= 0, `negative cost not supported: ${cost}` );

      const visibleDecimalPlaces = 3;

      // First round to a large number of decimal places, in an attempt to identify floating point error.
      // For example, Javascript computes 3 * 0.4 as 1.2000000000000002.
      // This determines whether the cost has relevant non-zero decimal places,
      // and therefore whether the extra decimal place should be visible.
      // See https://github.com/phetsims/unit-rates/issues/202
      const costRounded = Utils.toFixedNumber( cost, 10 );
      extraDecimalNode.visible = ( URUtils.decimalPlaces( costRounded ) >= visibleDecimalPlaces );

      if ( options.extraDecimalVisible && extraDecimalNode.visible ) {

        // Truncate to the number of decimal places that we're interested in.
        // This determines the cost value that is displayed.
        const powerOfTen = Math.pow( 10, visibleDecimalPlaces );
        const costTruncated = Math.floor( cost * powerOfTen ) / powerOfTen;

        // convert to string, then pick it apart
        const costString = URUtils.numberToString( costTruncated, visibleDecimalPlaces, false /* trimZeros */ );
        primaryNode.string = costString.substring( 0, costString.length - 1 );
        extraDecimalNode.string = costString.substring( costString.length - 1, costString.length );
      }
      else {
        primaryNode.string = URUtils.numberToString( cost, 2, false /* trimZeros */ );
        extraDecimalNode.string = '0'; // will be invisible, but needs a valid digit for layout purposes
      }
    };
    costProperty.link( costObserver );

    // Adjust layout when any of the subcomponents change.
    Multilink.multilink( [ dollarSignNode.localBoundsProperty, primaryNode.localBoundsProperty, extraDecimalNode.localBoundsProperty ],
      () => {
        primaryNode.left = dollarSignNode.right + 1;
        primaryNode.y = dollarSignNode.y;
        extraDecimalNode.left = primaryNode.right + 1;
        extraDecimalNode.y = primaryNode.y;
      } );

    this.mutate( options );
  }
}

unitRates.register( 'CostNode', CostNode );