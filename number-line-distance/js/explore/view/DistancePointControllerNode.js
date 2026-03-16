// Copyright 2021-2025, University of Colorado Boulder

/**
 * A point controller node that is meant for use in the distance scene.
 *
 * @author Saurabh Totey
 */

import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import numberLineDistance from '../../numberLineDistance.js';

// constants
const IMAGE_DILATION = 20;

class DistancePointControllerNode extends PointControllerNode {

  /**
   * @param {PointController} pointController
   * @param {Image} image
   * @public
   */
  constructor( pointController, image ) {

    // The origin is at the center of the image.
    //
    // The house image is static, so this will only be executed once.
    //
    // The person image is dynamic, and changes when Region and Culture is changed. Putting the origin at the center
    // of the image keeps the person centered in the toolbox. But the compromise is that the location of the person's
    // feet (the bottom of the person image) will shift up and down on the sidewalk depending on the height of the
    // image. We verified by inspection that all person images are on the sidewalk, and we doubt that anyone will
    // notice the feet moving, especially since the Preferences dialog tends to cover the number line while switching
    // Region and Culture. For more about this, see https://github.com/phetsims/joist/issues/958#issuecomment-2019082300.
    image.localBoundsProperty.link( () => {
      image.centerX = 0;
      image.centerY = 0;
      image.touchArea = image.localBounds.dilated( IMAGE_DILATION / image.getScaleVector().x );
    } );

    super( pointController, {
      connectorLine: false,
      node: new Node( { children: [ image ] } )
    } );
  }

}

numberLineDistance.register( 'DistancePointControllerNode', DistancePointControllerNode );
export default DistancePointControllerNode;