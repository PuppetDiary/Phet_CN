// Copyright 2019-2025, University of Colorado Boulder

/**
 * Class for the 'Total' accordion box, which is the panel in the top center of the sim that displays a numerical
 * representation of the current number.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import { TextOptions } from '../../../../scenery/js/nodes/Text.js';
import ArrowButton, { ArrowButtonOptions } from '../../../../sun/js/buttons/ArrowButton.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import CountingArea from '../model/CountingArea.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import NumberSuiteCommonAccordionBox, { NumberSuiteCommonAccordionBoxOptions } from './NumberSuiteCommonAccordionBox.js';

// types
type SelfOptions = {
  arrowButtonOptions: ArrowButtonOptions;
  arrowButtonSpacing: number;
} & PickRequired<TextOptions, 'font'>;
export type TotalAccordionBoxOptions =
  SelfOptions
  & StrictOmit<NumberSuiteCommonAccordionBoxOptions, 'titleStringProperty'>;

const MAX_SUM = CountingCommonConstants.MAX_IMAGES_PER_COUNTING_OBJECT;

class TotalAccordionBox extends NumberSuiteCommonAccordionBox {

  public constructor( countingArea: CountingArea, height: number, providedOptions: TotalAccordionBoxOptions ) {

    const options = optionize<TotalAccordionBoxOptions, SelfOptions, NumberSuiteCommonAccordionBoxOptions>()( {
      titleStringProperty: NumberSuiteCommonStrings.totalStringProperty,
      titleTextOptions: {
        maxWidth: 142
      }
    }, providedOptions );

    super( NumberSuiteCommonConstants.TOTAL_ACCORDION_BOX_WIDTH, new Property<number>( height ), options );

    // create the NumberDisplay, which is a numerical representation of the current number. always format for numbers
    // up to twenty so the display looks consistent across screens.
    const numberDisplay = new NumberDisplay( countingArea.sumProperty, new Range( 0, MAX_SUM ), {
      decimalPlaces: 0,
      align: 'right',
      noValueAlign: 'left',
      textOptions: {
        font: options.font
      },
      backgroundFill: null,
      backgroundStroke: null
    } );

    // create the arrow buttons, which add or remove countingObjects
    const upArrowButton = new ArrowButton( 'up', () => {
      countingArea.createCountingObjectFromCreatorNode();
    }, options.arrowButtonOptions );
    const downArrowButton = new ArrowButton( 'down', () => {
      countingArea.returnCountingObjectToCreatorNode();
    }, options.arrowButtonOptions );
    const arrowButtons = new VBox( {
      children: [ upArrowButton, downArrowButton ],
      spacing: options.arrowButtonSpacing
    } );

    // disable the arrow buttons when the currentNumberProperty value is at its min or max range
    const currentNumberPropertyObserver = ( currentNumber: number ) => {
      assert && assert( countingArea.sumProperty.range, 'Range is required for sumProperty in countingAreas' );
      upArrowButton.enabled = currentNumber !== countingArea.sumProperty.range.max;
      downArrowButton.enabled = currentNumber !== countingArea.sumProperty.range.min;
    };
    countingArea.sumProperty.link( currentNumberPropertyObserver );

    // arrange and add the number display and arrow buttons
    const numberControl = new HBox( { children: [ numberDisplay, arrowButtons ] } );
    numberControl.center = this.contentBoundsProperty.value.center;
    this.contentNode.addChild( numberControl );
  }
}

numberSuiteCommon.register( 'TotalAccordionBox', TotalAccordionBox );
export default TotalAccordionBox;