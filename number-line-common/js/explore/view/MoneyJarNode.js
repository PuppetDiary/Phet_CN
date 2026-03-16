// Copyright 2020-2025, University of Colorado Boulder

/**
 * a node that represents a piggy bank
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import moneyBoxNoDecoration_png from '../../../images/moneyBoxNoDecoration_png.js';
import moneyBoxWithFlowers_png from '../../../images/moneyBoxWithFlowers_png.js';
import moneyBoxWithLightning_png from '../../../images/moneyBoxWithLightning_png.js';
import numberLineCommon from '../../numberLineCommon.js';
import FillableBackgroundNode from '../../view/FillableBackgroundNode.js';
import MoneyJarDecoration from '../model/MoneyJarDecoration.js';
import MoneyJarShapes from './MoneyJarShapes.js';

// constants
const MAP_DECORATION_TYPE_TO_IMAGE_INFO = new Map();
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( MoneyJarDecoration.NONE, moneyBoxNoDecoration_png );
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( MoneyJarDecoration.FLOWERS, moneyBoxWithFlowers_png );
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( MoneyJarDecoration.LIGHTNING, moneyBoxWithLightning_png );

class MoneyJarNode extends FillableBackgroundNode {

  /**
   * @param {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( {
      fill: 'rgba( 0, 0, 0, 0 )', // initially transparent so that it is invisible but has size
      lineWidth: 0,
      decorationType: MoneyJarDecoration.FLOWERS
    }, options );

    const moneyJarOutlineNode = new Path( MoneyJarShapes.MEDIUM_MONEY_JAR_SHAPE, {
      fill: options.fill,
      lineWidth: 0.5,
      stroke: Color.BLACK,
      center: Vector2.ZERO
    } );
    const overlayImage = new Image(
      MAP_DECORATION_TYPE_TO_IMAGE_INFO.get( options.decorationType ),
      { opacity: 0.9 }
    );
    overlayImage.setScaleMagnitude( moneyJarOutlineNode.width / overlayImage.width );
    overlayImage.center = Vector2.ZERO;
    options.children = [ moneyJarOutlineNode, overlayImage ];
    super( moneyJarOutlineNode, options );
  }
}

numberLineCommon.register( 'MoneyJarNode', MoneyJarNode );
export default MoneyJarNode;