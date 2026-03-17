// Copyright 2016-2024, University of Colorado Boulder

/**
 * The candy scene in the Shopping screen.
 * Candy differs significantly from other item types, as described by the ShoppingScene constructor options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingScene, { ShoppingSceneOptions } from './ShoppingScene.js';

type SelfOptions = EmptySelfOptions;
type CandySceneOptions = SelfOptions & PickOptional<ShoppingSceneOptions, 'rate'>;

export default class CandyScene extends ShoppingScene {

  public constructor( itemData: ShoppingItemData, providedOptions?: CandySceneOptions ) {

    const options = optionize<CandySceneOptions, SelfOptions, ShoppingSceneOptions>()( {

      // ShoppingSceneOptions
      // range of denominator, in pounds
      fixedAxisRange: new Range( 0, 1.6 ),

      // Candy quantity is in pounds
      quantitySingularUnitsStringProperty: UnitRatesStrings.poundStringProperty,
      quantityPluralUnitsStringProperty: UnitRatesStrings.poundsStringProperty,

      // Candy questions require capitalization of 'Pounds', e.g. 'Pounds for $10.50?'
      // This hack was required by https://github.com/phetsims/unit-rates/issues/20
      amountOfQuestionUnitsStringProperty: UnitRatesStrings.poundsCapitalizedStringProperty,

      denominatorAxisOptions: {
        unitsStringProperty: UnitRatesStrings.poundsStringProperty
      },

      // Scale displays quantity in 'lbs' for Candy
      scaleQuantityIsDisplayed: true,
      scaleQuantityUnitsStringProperty: UnitRatesStrings.lbsStringProperty,

      // Major markers have 1 decimal place in the denominator
      isMajorMarker: ( numerator: number, denominator: number ) => ( URUtils.decimalPlaces( denominator ) <= 1 )

    }, providedOptions );

    super( itemData, options );
  }
}

unitRates.register( 'CandyScene', CandyScene );