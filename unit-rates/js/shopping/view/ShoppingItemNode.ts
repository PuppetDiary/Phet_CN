// Copyright 2017-2025, University of Colorado Boulder

/**
 * View of a shopping item.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import Scale from '../model/Scale.js';
import Shelf from '../model/Shelf.js';
import ShoppingItem from '../model/ShoppingItem.js';
import ShoppingItemDragListener from './ShoppingItemDragListener.js';

export default class ShoppingItemNode extends Image {

  public constructor( item: ShoppingItem, shelf: Shelf, scale: Scale,
                      frontItemLayer: Node, backItemLayer: Node, dragLayer: Node ) {

    // This type does not propagate options to the supertype because the model determines position.
    super( item.image, {
      isDisposable: false,
      scale: URConstants.SHOPPING_ITEM_IMAGE_SCALE,
      cursor: 'pointer'
    } );

    // origin is at bottom center
    item.positionProperty.link( position => {
      this.centerX = position.x;
      this.bottom = position.y;
    } );

    item.visibleProperty.link( visible => {
      this.visible = visible;
      if ( visible ) {
        const parent = this.parent;
        parent && parent.removeChild( this );

        // put the Node in the proper layer
        if ( shelf.isItemInFrontRow( item ) || scale.isItemInFrontRow( item ) ) {
          frontItemLayer.addChild( this );
        }
        else {
          backItemLayer.addChild( this );
        }
      }
    } );

    const dragListener = new ShoppingItemDragListener( this, item, shelf, scale, frontItemLayer, backItemLayer, dragLayer );
    this.addInputListener( dragListener );
  }
}

unitRates.register( 'ShoppingItemNode', ShoppingItemNode );