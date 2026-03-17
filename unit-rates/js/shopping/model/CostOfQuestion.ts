// Copyright 2024-2025, University of Colorado Boulder

/**
 * UnitRateQuestion is a question of the form of the form 'Cost of 10 Apples?' or 'Cost of 2.2 pounds?'
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

export default class CostOfQuestion extends ShoppingQuestion {

  private readonly disposeCostOfQuestion: () => void;

  public constructor( denominator: number,
                      unitRate: number,
                      denominatorSingularUnitsStringProperty: TReadOnlyProperty<string>,
                      denominatorPluralUnitsStringProperty: TReadOnlyProperty<string>,
                      numeratorAxis: Axis,
                      denominatorAxis: Axis ) {

    // 'Apples' or 'Apple'
    const unitsStringProperty = ( denominator > 1 ) ? denominatorPluralUnitsStringProperty : denominatorSingularUnitsStringProperty;

    // 'Cost of 10 Apples?'
    const questionStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_costOf_0quantity_1unitsStringProperty, unitsStringProperty ],
      ( patternString, unitsString ) => {
        const valueString = URUtils.numberToString( denominator, denominatorAxis.maxDecimals, denominatorAxis.trimZeros );
        return StringUtils.format( patternString, valueString, unitsString );
      } );

    // answer
    const numerator = denominator * unitRate;
    const answer = Utils.toFixedNumber( numerator, numeratorAxis.maxDecimals );

    // '$3.00'
    const numeratorStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0costStringProperty ],
      patternString => {
        const valueString = URUtils.numberToString( numerator, numeratorAxis.maxDecimals, numeratorAxis.trimZeros );
        return StringUtils.format( patternString, valueString );
      } );

    // '10 Apples'
    const denominatorStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0value_1unitsStringProperty, unitsStringProperty ],
      ( patternString, unitsString ) => {
        const valueString = URUtils.numberToString( denominator, denominatorAxis.maxDecimals, denominatorAxis.trimZeros );
        return StringUtils.format( patternString, valueString, unitsString );
      } );

    super( questionStringProperty, answer, numerator, denominator, numeratorStringProperty,
      denominatorStringProperty, numeratorAxis );

    this.disposeCostOfQuestion = () => {
      questionStringProperty.dispose();
      numeratorStringProperty.dispose();
      denominatorStringProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeCostOfQuestion();
    super.dispose();
  }
}

unitRates.register( 'CostOfQuestion', CostOfQuestion );