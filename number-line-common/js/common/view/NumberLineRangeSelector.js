// Copyright 2020-2025, University of Colorado Boulder

/**
 * NumberLineRangeSelector is a ComboBox specialization that can be used to select from a set of ranges that are then
 * used to control the range of values displayed on a number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NumberLineCommonStrings from '../../../../number-line-common/js/NumberLineCommonStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const FONT = new PhetFont( 16 );

class NumberLineRangeSelector extends ComboBox {

  /**
   * @param {Property.<Range>} selectedRangeProperty
   * @param {Range[]} ranges
   * @param {Node} listBoxParentNode
   * @param {Object} [options]
   * @public
   */
  constructor( selectedRangeProperty, ranges, listBoxParentNode, options ) {

    options = merge( {
      listPosition: 'above',
      xMargin: 13,
      yMargin: 6,
      cornerRadius: 4,
      buttonTouchAreaXDilation: 7,
      buttonTouchAreaYDilation: 7,
      align: 'right'
    }, options );

    // Create the selection items for the range selection combo box.
    const rangeSelectionComboBoxItems = []; // {ComboBoxItem[]}
    ranges.forEach( range => {
      rangeSelectionComboBoxItems.push( {
        value: range,
        createNode: () => new Text(
          new PatternStringProperty( NumberLineCommonStrings.rangePatternStringProperty, {
            lowValue: range.min,
            highValue: range.max
          } ),
          { font: FONT, maxWidth: 150 }
        )
      } );
    } );

    super( selectedRangeProperty, rangeSelectionComboBoxItems, listBoxParentNode, options );
  }
}

numberLineCommon.register( 'NumberLineRangeSelector', NumberLineRangeSelector );
export default NumberLineRangeSelector;