// Copyright 2017-2025, University of Colorado Boulder

/**
 * Control for setting the rate of the race car.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import URConstants from '../../common/URConstants.js';
import RateAccordionBox, { RateAccordionBoxOptions } from '../../common/view/RateAccordionBox.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import RaceCar from '../model/RaceCar.js';

type SelfOptions = EmptySelfOptions;

type RaceCarRateAccordionBoxOptions = SelfOptions & NodeTranslationOptions &
  PickRequired<RateAccordionBoxOptions, 'titleStringProperty' | 'expandedProperty'>;

export default class RaceCarRateAccordionBox extends RateAccordionBox {

  public constructor( car: RaceCar, providedOptions: RaceCarRateAccordionBoxOptions ) {

    const options = optionize<RaceCarRateAccordionBoxOptions, SelfOptions, RateAccordionBoxOptions>()( {

      // RaceCarRateAccordionBoxOptions
      numeratorUnitsStringProperty: UnitRatesStrings.milesStringProperty,
      denominatorUnitsStringProperty: UnitRatesStrings.hoursStringProperty,
      numeratorRange: URConstants.MILES_RANGE,
      denominatorRange: URConstants.HOURS_RANGE,
      numeratorPickerColor: car.color,
      denominatorPickerColor: car.color,
      numeratorPickerIncrementFunction: ( miles: number ) => ( miles + URConstants.MILES_DELTA ),
      numeratorPickerDecrementFunction: ( miles: number ) => ( miles - URConstants.MILES_DELTA ),
      denominatorPickerIncrementFunction: ( hours: number ) => ( hours + URConstants.HOURS_DELTA ),
      denominatorPickerDecrementFunction: ( hours: number ) => ( hours - URConstants.HOURS_DELTA ),
      denominatorDecimals: URConstants.HOURS_DECIMALS,
      pickerFont: new PhetFont( 20 )
    }, providedOptions );

    super( car.rate, options );
  }
}

unitRates.register( 'RaceCarRateAccordionBox', RaceCarRateAccordionBox );