// Copyright 2024-2025, University of Colorado Boulder

/**
 * UnitRateQuestion is a question of the form 'Apples for $3.00?'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Axis from '../../common/model/Axis.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingQuestion from './ShoppingQuestion.js';

export default class ItemsForQuestion extends ShoppingQuestion {

  private readonly disposeItemsForQuestion: () => void;

  public constructor( denominator: number,
                      unitRate: number,
                      denominatorSingularUnitsStringProperty: TReadOnlyProperty<string>,
                      denominatorPluralUnitsStringProperty: TReadOnlyProperty<string>,
                      questionUnitsStringProperty: TReadOnlyProperty<string>,
                      numeratorAxis: Axis,
                      denominatorAxis: Axis ) {

    const numerator = denominator * unitRate;

    // 'Apples for $4.00?'
    const questionStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0items_1costStringProperty, questionUnitsStringProperty ],
      ( patternString, questionUnitsString ) => {
        const valueString = URUtils.numberToString( numerator, numeratorAxis.maxDecimals, numeratorAxis.trimZeros );
        return StringUtils.format( patternString, questionUnitsString, valueString );
      } );

    // answer
    const answer = Utils.toFixedNumber( denominator, denominatorAxis.maxDecimals );

    // '$4.00'
    const numeratorStringProperty = new DerivedStringProperty( [ UnitRatesStrings.pattern_0costStringProperty ],
      patternString => {
        const valueString = URUtils.numberToString( numerator, numeratorAxis.maxDecimals, numeratorAxis.trimZeros );
        return StringUtils.format( patternString, valueString );
      } );

    // 'Apples' or 'Apple'
    const denominatorUnitsStringProperty = ( denominator > 1 ) ? denominatorPluralUnitsStringProperty : denominatorSingularUnitsStringProperty;

    // '8 Apples'
    const denominatorStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0value_1unitsStringProperty, denominatorUnitsStringProperty ],
      ( patternString, unitsString ) => {
        const valueString = URUtils.numberToString( denominator, denominatorAxis.maxDecimals, denominatorAxis.trimZeros );
        return StringUtils.format( patternString, valueString, unitsString );
      } );

    super( questionStringProperty, answer, numerator, denominator, numeratorStringProperty,
      denominatorStringProperty, denominatorAxis );

    this.disposeItemsForQuestion = () => {
      questionStringProperty.dispose();
      numeratorStringProperty.dispose();
      denominatorStringProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeItemsForQuestion();
    super.dispose();
  }
}

unitRates.register( 'ItemsForQuestion', ItemsForQuestion );