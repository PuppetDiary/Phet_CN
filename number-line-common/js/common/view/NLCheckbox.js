// Copyright 2020-2025, University of Colorado Boulder

/**
 * NLCheckbox is a text-only checkbox that is used throughout the number-line suite of sims for consistency.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const BOX_WIDTH = 17;
const POINTER_AREA_DILATION = 5;

class NLCheckbox extends Checkbox {

  /**
   * @param {BooleanProperty} property - Property that will be controlled by the checkbox
   * @param {LocalizedStringProperty} contentStringProperty - the string that will be used as the label for the checkbox
   * @param {Object} [options]
   */
  constructor( property, contentStringProperty, options ) {

    options = merge( {
      boxWidth: BOX_WIDTH,

      // passed through to the text label
      textOptions: {
        font: new PhetFont( 16 ),
        maxWidth: 200
      },
      isDisposable: false,
      touchAreaXDilation: POINTER_AREA_DILATION,
      touchAreaYDilation: POINTER_AREA_DILATION,
      mouseAreaXDilation: POINTER_AREA_DILATION,
      mouseAreaYDilation: POINTER_AREA_DILATION
    }, options );

    const content = new Text( contentStringProperty, options.textOptions );

    super( property, content, options );
  }
}

numberLineCommon.register( 'NLCheckbox', NLCheckbox );
export default NLCheckbox;