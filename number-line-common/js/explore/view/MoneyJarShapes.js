// Copyright 2020-2025, University of Colorado Boulder

/**
 * singleton that provides the shape of a money jar, suitable for providing to a Scenery Path node
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const NLI_LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;

// SVG string from money-jar-outline.svg (bank-artwork.ai). If compared directly, one of vector points was duplicated
// in the original string, and removed below to make the shape valid. There was no visible change to the shape in the sim.
const MONEY_JAR_SVG_STRING =
  'M213.6,75.7c-3.4-20.2-25.6-27.8-31.5-29.9c0,0-1.2-1.7-0.5-3.1c0.6-1.2,1.8-1.8,2.1-2.8\n' +
  '\tc0.1-0.3,0.1-0.6,0.1-0.9v-5.3c0-1.1-0.6-2.2-1.7-3.3V15.9c0-8.3-33.1-15-73.9-15s-73.9,6.7-73.9,15V30c-1.5,1.2-2.3,2.5-2.3,3.8\n' +
  '\tv5.3c0,0.4,0.1,0.8,0.2,1.1c0.3,0.8,1.3,1.3,1.7,2.3c0.7,1.6,0.4,3.6,0.4,3.7C27.7,48.4,5.8,56.1,2.4,75.7\n' +
  '\tC-0.9,95,1.2,170.4,2.1,198.5c0.3,8.2,2.8,16.2,7.4,23c5.1,7.4,13.1,16.5,24.8,22.9v3.7c0,4.8,11,9,28.1,11.8\n' +
  '\tc12.6,2,28.5,3.2,45.8,3.2c17.3,0,33.2-1.2,45.8-3.2c17.1-2.8,28.1-7,28.1-11.8v-3.9c11.5-6.4,19.4-15.3,24.3-22.6\n' +
  '\tc4.7-6.8,7.2-14.8,7.4-23C214.8,170.4,216.9,95,213.6,75.7z';

// unscaled version of the money jar shape
const MONEY_JAR_SHAPE = new Shape( MONEY_JAR_SVG_STRING );

class MoneyJarShapes {

  /**
   * @public
   */
  constructor() {

    // Scale the shape to be reasonably sized.
    const mediumVersionScale = ( NLI_LAYOUT_BOUNDS.width / 8 ) / MONEY_JAR_SHAPE.bounds.width;
    const mediumScaleTransform = Matrix3.scale( mediumVersionScale, mediumVersionScale );
    this.MEDIUM_MONEY_JAR_SHAPE = MONEY_JAR_SHAPE.transformed( mediumScaleTransform );
  }
}

const moneyJarShapes = new MoneyJarShapes();
numberLineCommon.register( 'moneyJarShapes', moneyJarShapes );
export default moneyJarShapes;