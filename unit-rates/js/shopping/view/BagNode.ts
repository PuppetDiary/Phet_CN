// Copyright 2017-2025, University of Colorado Boulder

/**
 * View of a shopping bag.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import Bag from '../model/Bag.js';
import Scale from '../model/Scale.js';
import Shelf from '../model/Shelf.js';
import BagDragListener from './BagDragListener.js';

export default class BagNode extends Image {

  public constructor( bag: Bag, shelf: Shelf, scale: Scale, bagLayer: Node, dragLayer: Node ) {

    // This type does not propagate options to the supertype because the model determines position.
    super( bag.image, {
      isDisposable: false,
      scale: URConstants.BAG_IMAGE_SCALE,
      cursor: 'pointer',
      visibleProperty: bag.visibleProperty
    } );

    // origin is at bottom center
    bag.positionProperty.link( position => {
      this.centerX = position.x;
      this.bottom = position.y;
    } );

    const dragListener = new BagDragListener( this, bag, shelf, scale, bagLayer, dragLayer );
    this.addInputListener( dragListener );
  }
}

unitRates.register( 'BagNode', BagNode );