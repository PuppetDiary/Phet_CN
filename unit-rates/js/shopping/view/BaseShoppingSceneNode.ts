// Copyright 2016-2025, University of Colorado Boulder

/**
 * View components that are specific to a scene in both the 'Shopping' and 'Shopping Lab' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetButton from '../../../../scenery-phet/js/buttons/ResetButton.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import DoubleNumberLineAccordionBox from '../../common/view/DoubleNumberLineAccordionBox.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import ShoppingScene from '../model/ShoppingScene.js';
import BagNode from './BagNode.js';
import RowOfMovablesNode from './RowOfMovablesNode.js';
import ScaleNode from './ScaleNode.js';
import ShelfNode from './ShelfNode.js';
import ShoppingItemNode from './ShoppingItemNode.js';
import ShoppingViewProperties from './ShoppingViewProperties.js';

const BAG_ROW_STROKE = 'green';
const ITEM_ROW_STROKE = 'blue';

type SelfOptions = {
  extraCostDecimalVisible?: boolean; // Does the scale show an extra decimal place for cost?
};

type BaseShoppingSceneNodeOptions = SelfOptions;

export default class BaseShoppingSceneNode extends Node {

  private readonly dragLayer: Node;
  protected readonly doubleNumberLineAccordionBox: Node; // for layout in subtypes

  public constructor( shoppingScene: ShoppingScene, layoutBounds: Bounds2, keypadLayer: KeypadLayer,
                      viewProperties: ShoppingViewProperties, providedOptions?: BaseShoppingSceneNodeOptions ) {

    const options = optionize<BaseShoppingSceneNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      isDisposable: false,
      extraCostDecimalVisible: false
    }, providedOptions );

    // Double number line, dispose required
    const doubleNumberLineAccordionBox = new DoubleNumberLineAccordionBox( shoppingScene.doubleNumberLine, shoppingScene.markerEditor, keypadLayer, {
      axisViewLength: URConstants.SHOPPING_AXIS_LENGTH,
      expandedProperty: viewProperties.doubleNumberLineExpandedProperty,
      left: layoutBounds.minX + URConstants.SCREEN_X_MARGIN,
      top: layoutBounds.minY + URConstants.SCREEN_Y_MARGIN
    } );

    // shelf, dispose required
    const shelfNode = new ShelfNode( shoppingScene.shelf );

    // scale, dispose required
    const scaleNode = new ScaleNode( shoppingScene.scale, {
      costExpandedProperty: viewProperties.scaleCostExpandedProperty,
      extraCostDecimalVisible: options.extraCostDecimalVisible,
      quantityIsDisplayed: shoppingScene.scaleQuantityIsDisplayed
    } );

    // layers for bags and items
    const dragLayer = new Node(); // all Nodes are in this layer while being dragged
    const bagLayer = new Node();  // the row of bags
    const frontItemLayer = new Node(); // the front row of items
    const backItemLayer = new Node(); // the back row of items

    // button that resets the shelf to its initial state
    const resetShelfButton = new ResetButton( {
      listener: () => {
        dragLayer.interruptSubtreeInput();
        shoppingScene.resetShelfAndScale();
      },
      baseColor: URColors.resetShelfButtonColorProperty,
      scale: 0.65,
      touchAreaDilation: 5,
      right: scaleNode.left,
      top: scaleNode.bottom + 20
    } );

    // Disable the button when all bags are on the shelf
    shoppingScene.shelf.numberOfBagsProperty.link( numberOfBags => {
      resetShelfButton.enabled = ( numberOfBags !== shoppingScene.numberOfBags );
    } );

    // bags and items, dispose required
    const itemNodes: ShoppingItemNode[] = [];
    let bagsOpen = false;
    shoppingScene.bags.forEach( bag => {

      // create the bag's Node, put it in the bag layer
      const bagNode = new BagNode( bag, shoppingScene.shelf, shoppingScene.scale, bagLayer, dragLayer );
      bagLayer.addChild( bagNode );

      // optional items in the bag
      if ( bag.items ) {
        bagsOpen = true;
        bag.items.forEach( item => {

          // Create the item's Node. Adds itself to the proper layer, so there is no addChild here.
          const itemNode = new ShoppingItemNode( item, shoppingScene.shelf, shoppingScene.scale,
            frontItemLayer, backItemLayer, dragLayer );
          itemNodes.push( itemNode );
        } );
      }
    } );

    options.children = [
      doubleNumberLineAccordionBox, scaleNode, shelfNode, resetShelfButton,
      bagLayer, backItemLayer, frontItemLayer, dragLayer
    ];

    super( options );

    // Debug: show the cells that bags and items can occupy on the shelf and scale
    if ( URQueryParameters.showCells ) {

      // cells for bags
      this.addChild( new RowOfMovablesNode( shoppingScene.shelf.bagRow, BAG_ROW_STROKE ) );
      this.addChild( new RowOfMovablesNode( shoppingScene.scale.bagRow, BAG_ROW_STROKE ) );

      // cells for items
      if ( bagsOpen ) {
        this.addChild( new RowOfMovablesNode( shoppingScene.shelf.backItemRow, ITEM_ROW_STROKE ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.shelf.frontItemRow, ITEM_ROW_STROKE ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.scale.backItemRow, ITEM_ROW_STROKE ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.scale.frontItemRow, ITEM_ROW_STROKE ) );
      }
    }

    this.dragLayer = dragLayer;
    this.doubleNumberLineAccordionBox = doubleNumberLineAccordionBox;
  }
}

unitRates.register( 'BaseShoppingSceneNode', BaseShoppingSceneNode );