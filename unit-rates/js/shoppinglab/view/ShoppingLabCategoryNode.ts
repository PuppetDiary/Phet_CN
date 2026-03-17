// Copyright 2017-2025, University of Colorado Boulder

/**
 * View components that are specific to a category in the 'Shopping Lab' screen.
 * Since the Shopping Lab only has 1 scene per category, this is simply a parent node that controls visibility of that scene.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import ShoppingCategory from '../../shopping/model/ShoppingCategory.js';
import ShoppingViewProperties from '../../shopping/view/ShoppingViewProperties.js';
import unitRates from '../../unitRates.js';
import ShoppingLabSceneNode from './ShoppingLabSceneNode.js';

export default class ShoppingLabCategoryNode extends Node {

  public constructor( category: ShoppingCategory, categoryProperty: Property<ShoppingCategory>, layoutBounds: Bounds2,
                      keypadLayer: KeypadLayer, viewProperties: ShoppingViewProperties ) {

    super();

    // parent for stuff that's specific to a scene, to maintain rendering order
    assert && assert( category.shoppingScenes.length === 1, 'Shopping Lab screen supports 1 scene per category' );
    const shoppingSceneNode = new ShoppingLabSceneNode( category.shoppingScenes[ 0 ], layoutBounds, keypadLayer, viewProperties );
    this.addChild( shoppingSceneNode );

    // Show this category when it's selected.
    categoryProperty.link( newCategory => {
      this.visible = ( newCategory === category );
    } );
  }
}

unitRates.register( 'ShoppingLabCategoryNode', ShoppingLabCategoryNode );