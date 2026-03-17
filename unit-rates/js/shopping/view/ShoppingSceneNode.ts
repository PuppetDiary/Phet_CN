// Copyright 2016-2024, University of Colorado Boulder

/**
 * View components that are specific to a scene in the 'Shopping' screen.
 * Adds a Questions accordion box to the base type.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import ShoppingScene from '../model/ShoppingScene.js';
import BaseShoppingSceneNode from './BaseShoppingSceneNode.js';
import ShoppingQuestionsAccordionBox from './ShoppingQuestionsAccordionBox.js';
import ShoppingViewProperties from './ShoppingViewProperties.js';

export default class ShoppingSceneNode extends BaseShoppingSceneNode {

  public constructor( shoppingScene: ShoppingScene, layoutBounds: Bounds2, keypadLayer: KeypadLayer,
                      viewProperties: ShoppingViewProperties ) {

    super( shoppingScene, layoutBounds, keypadLayer, viewProperties );

    // Questions, dispose required
    const questionsAccordionBox = new ShoppingQuestionsAccordionBox( shoppingScene, keypadLayer, {
      expandedProperty: viewProperties.questionsExpandedProperty
    } );
    this.addChild( questionsAccordionBox );
    questionsAccordionBox.moveToBack();
    questionsAccordionBox.boundsProperty.link( () => {
      questionsAccordionBox.right = layoutBounds.right - URConstants.SCREEN_X_MARGIN;
      questionsAccordionBox.top = this.doubleNumberLineAccordionBox.bottom + 10;
    } );
  }
}

unitRates.register( 'ShoppingSceneNode', ShoppingSceneNode );