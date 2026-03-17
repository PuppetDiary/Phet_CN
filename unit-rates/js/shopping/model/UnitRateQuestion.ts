// Copyright 2024-2025, University of Colorado Boulder

/**
 * UnitRateQuestion is a question of the form 'Unit Rate?'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Axis from '../../common/model/Axis.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingQuestion from './ShoppingQuestion.js';

export default class UnitRateQuestion extends ShoppingQuestion {

  private readonly disposeUnitRateQuestion: () => void;

  public constructor( unitRate: number, denominatorUnitsStringProperty: TReadOnlyProperty<string>,
                      numeratorAxis: Axis, denominatorAxis: Axis ) {

    // '$0.50'
    const numerator = unitRate;
    const numeratorStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0costStringProperty ],
      patternString => {
        const valueString = URUtils.numberToString( numerator, numeratorAxis.maxDecimals, numeratorAxis.trimZeros );
        return StringUtils.format( patternString, valueString );
      } );

    // '1 Apple'
    const denominator = 1;
    const denominatorStringProperty = new DerivedStringProperty(
      [ UnitRatesStrings.pattern_0value_1unitsStringProperty, denominatorUnitsStringProperty ],
      ( patternString, unitsString ) => {
        const valueString = URUtils.numberToString( denominator, denominatorAxis.maxDecimals, denominatorAxis.trimZeros );
        return StringUtils.format( patternString, valueString, unitsString );
      } );

    super( UnitRatesStrings.unitRateQuestionStringProperty, unitRate, numerator, denominator,
      numeratorStringProperty, denominatorStringProperty, numeratorAxis );

    this.disposeUnitRateQuestion = () => {
      numeratorStringProperty.dispose();
      denominatorStringProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeUnitRateQuestion();
    super.dispose();
  }
}

unitRates.register( 'UnitRateQuestion', UnitRateQuestion );