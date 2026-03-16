// Copyright 2020-2025, University of Colorado Boulder

/**
 * InitialNetWorthAccordionBox displays the initial net worth value, which is provided as a Property, in an accordion
 * box.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

class InitialNetWorthAccordionBox extends AccordionBox {

  /**
   * @param {NumberProperty} initialNetWorthProperty
   * @param {Property.<Range>} netWorthRangeProperty
   * @param {Object} [options]
   */
  constructor( initialNetWorthProperty, netWorthRangeProperty, options ) {

    options = merge( {
      titleNode: new Text( NumberLineOperationsStrings.initialNetWorthStringProperty, {
        font: new PhetFont( 18 ),
        maxWidth: 200
      } )
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options );

    const label = new RichText( NumberLineOperationsStrings.initialNetWorthWithBreakStringProperty, {
      align: 'center',
      font: new PhetFont( 24 ),
      maxWidth: 150,
      maxHeight: 90
    } );

    const currencyUnits = new Text( NumberLineOperationsStrings.currencyUnitsStringProperty, {
      font: new PhetFont( 24 ),
      maxWidth: 100
    } );

    const changingInitialNetWorthEmitter = new TinyEmitter();
    const initialNetWorthPicker = new NumberPicker(
      initialNetWorthProperty,
      netWorthRangeProperty,
      {
        incrementFunction: value => {
          changingInitialNetWorthEmitter.emit();
          return value + 100;
        },
        decrementFunction: value => {
          changingInitialNetWorthEmitter.emit();
          return value - 100;
        },
        yMargin: 10,
        arrowHeight: 10,
        color: NLOConstants.DARK_BLUE_POINT_COLOR,
        font: new PhetFont( 26 )
      }
    );

    const content = new HBox( {
      children: [ label, new Text( '=', { font: new PhetFont( 24 ) } ), currencyUnits, initialNetWorthPicker ],
      spacing: 15
    } );

    super( content, options );

    this.changingInitialNetWorthEmitter = changingInitialNetWorthEmitter;
  }
}

numberLineOperations.register( 'InitialNetWorthAccordionBox', InitialNetWorthAccordionBox );
export default InitialNetWorthAccordionBox;