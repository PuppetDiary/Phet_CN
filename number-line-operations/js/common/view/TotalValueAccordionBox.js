// Copyright 2020-2025, University of Colorado Boulder

/**
 * TotalValueAccordionBox is an accordion box that displays the value of a provided Property and allows customization of
 * the title and label through the options.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import isLeftToRightProperty from '../../../../joist/js/i18n/isLeftToRightProperty.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BidirectionalControlChars from '../../../../scenery-phet/js/BidirectionalControlChars.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';
import removeEmbeddingMarks from './removeEmbeddingMarks.js';

// constants
const DEFAULT_WIDTH = 350; // empirically determined to look decent

class TotalValueAccordionBox extends AccordionBox {

  /**
   * @param {NumberProperty} totalValueProperty
   * @param options
   */
  constructor( totalValueProperty, options ) {

    options = merge( {
      titleText: NumberLineOperationsStrings.totalStringProperty,
      labelText: NumberLineOperationsStrings.totalStringProperty,
      showTotalAsCurrency: false,
      minWidth: DEFAULT_WIDTH,
      maxWidth: DEFAULT_WIDTH
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options );

    const signProperty = new DerivedProperty(
      [ totalValueProperty ],
      totalValue => totalValue < 0 ? MathSymbols.MINUS : ''
    );

    const readoutStringProperty = new DerivedStringProperty(
      [
        NumberLineOperationsStrings.totalCurrencyPatternStringProperty,
        NumberLineOperationsStrings.totalValuePatternStringProperty,
        NumberLineOperationsStrings.currencyUnitsStringProperty,
        options.labelText,
        totalValueProperty,
        signProperty
      ],
      ( totalCurrencyPattern, totalValuePattern, currencyUnits, label, totalValue, sign ) => {
        let readoutString;
        if ( options.showTotalAsCurrency ) {
          readoutString = StringUtils.fillIn( totalCurrencyPattern, {
            totalString: label,
            sign: sign,
            currencyUnits: currencyUnits,
            totalValue: Math.abs( totalValue )
          } );
        }
        else {
          readoutString = StringUtils.fillIn( totalValuePattern, {
            totalString: label,
            totalValue: `${sign}${Math.abs( totalValue )}`
          } );
        }
        if ( !isLeftToRightProperty.value ) {

          // The values being displayed in the readout string for RTL languages were being messed up by our default
          // embedding for the pattern strings, so the code below was put into place to make the readout strings
          // look better in RTL languages.  It's quite fragile, and may need to be updated if the strings change
          // significantly.  See https://github.com/phetsims/phetcommon/issues/68 for more background if needed.

          // Remove all embedding control characters.
          readoutString = removeEmbeddingMarks( readoutString );

          // If the string contains an equals sign, embed the portion of the string after the equals sign as
          // left-to-right.
          const indexOfEquals = readoutString.indexOf( '=' );
          if ( indexOfEquals !== -1 ) {

            readoutString = insertChar( readoutString, BidirectionalControlChars.LRE, indexOfEquals + 2 );
          }

          // Embed the string as a whole as right-to-left.
          readoutString = BidirectionalControlChars.RLE + readoutString + BidirectionalControlChars.PDF;
        }

        return readoutString;
      }
    );

    const totalReadoutText = new Text( readoutStringProperty, {
      font: new PhetFont( 26 ),
      maxWidth: DEFAULT_WIDTH * 0.9
    } );

    // accordion box title node
    const titleNode = new Text( options.titleText, { font: new PhetFont( 18 ) } );

    super( totalReadoutText, merge( options, { titleNode: titleNode } ) );
  }
}

function insertChar( str, char, index ) {
  return str.slice( 0, index ) + char + str.slice( index );
}

numberLineOperations.register( 'TotalValueAccordionBox', TotalValueAccordionBox );
export default TotalValueAccordionBox;