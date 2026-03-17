// Copyright 2016-2024, University of Colorado Boulder

/**
 * View components that are specific to a scene in the 'Shopping Lab' screen.
 * Adds a Rate accordion box to the base type.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import RateAccordionBox from '../../common/view/RateAccordionBox.js';
import ShoppingScene from '../../shopping/model/ShoppingScene.js';
import BaseShoppingSceneNode from '../../shopping/view/BaseShoppingSceneNode.js';
import ShoppingViewProperties from '../../shopping/view/ShoppingViewProperties.js';
import unitRates from '../../unitRates.js';

export default class ShoppingLabSceneNode extends BaseShoppingSceneNode {

  public constructor( shoppingScene: ShoppingScene, layoutBounds: Bounds2, keypadLayer: KeypadLayer,
                      viewProperties: ShoppingViewProperties ) {

    super( shoppingScene, layoutBounds, keypadLayer, viewProperties, {
      extraCostDecimalVisible: true // {boolean} add an extra decimal place to cost on the scale
    } );

    // Rate accordion box, dispose required
    const rateAccordionBox = new RateAccordionBox( shoppingScene.rate, {
      numeratorRange: URConstants.COST_RANGE,
      denominatorRange: URConstants.QUANTITY_RANGE,
      numeratorUnitsStringProperty: shoppingScene.numeratorAxis.unitsStringProperty,
      denominatorUnitsStringProperty: shoppingScene.denominatorAxis.unitsStringProperty,
      denominatorPickerColor: shoppingScene.itemData.pickerColor,
      expandedProperty: viewProperties.rateExpandedProperty,
      left: layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: layoutBounds.bottom - 100
    } );
    this.addChild( rateAccordionBox );
    rateAccordionBox.moveToBack();
  }
}

unitRates.register( 'ShoppingLabSceneNode', ShoppingLabSceneNode );