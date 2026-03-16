// Copyright 2020-2025, University of Colorado Boulder

/**
 * BalanceSheetItemNode is the view representation of a ValueItem, which is the general term being used in this
 * sim for assets and debts.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isLeftToRightProperty from '../../../../joist/js/i18n/isLeftToRightProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import asset100_png from '../../../images/asset100_png.js';
import asset100Value_png from '../../../images/asset100Value_png.js';
import asset200_png from '../../../images/asset200_png.js';
import asset200Value_png from '../../../images/asset200Value_png.js';
import asset300_png from '../../../images/asset300_png.js';
import asset300Value_png from '../../../images/asset300Value_png.js';
import asset400_png from '../../../images/asset400_png.js';
import asset400Value_png from '../../../images/asset400Value_png.js';
import debt100_png from '../../../images/debt100_png.js';
import debt100Value_png from '../../../images/debt100Value_png.js';
import debt200_png from '../../../images/debt200_png.js';
import debt200Value_png from '../../../images/debt200Value_png.js';
import debt300_png from '../../../images/debt300_png.js';
import debt300Value_png from '../../../images/debt300Value_png.js';
import debt400_png from '../../../images/debt400_png.js';
import debt400Value_png from '../../../images/debt400Value_png.js';
import removeEmbeddingMarks from '../../common/view/removeEmbeddingMarks.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// Dimensions of the icons used for the in-bag representations.  The images will be fit to this size.  This is done so
// that the in-bag items align well in the bags.
const IN_BAG_ICON_DIMENSIONS = new Dimension2( 50, 37 );

// Create a map of asset/debt values to the images, sizes, and other information necessary to create the node for a
// particular value.  Note that the width is the only size provided, and the aspect ratio of the image ends up defining
// the height in the view.
const MAP_OF_VALUES_TO_IMAGE_INFO = new Map( [
  [
    100,
    {
      outOfBagImage: asset100Value_png,
      outOfBagWidth: 80,
      inBagImage: asset100_png
    }
  ],
  [
    200,
    {
      outOfBagImage: asset200Value_png,
      outOfBagWidth: 85,
      outOfBagLabelOffset: new Vector2( 0, -3 ),
      inBagImage: asset200_png
    }
  ],
  [
    300,
    {
      outOfBagImage: asset300Value_png,
      outOfBagWidth: 100,
      outOfBagLabelOffset: new Vector2( 0, 5 ),
      inBagImage: asset300_png
    }
  ],
  [
    400,
    {
      outOfBagImage: asset400Value_png,
      outOfBagWidth: 50,
      outOfBagLabelOffset: new Vector2( 0, 7 ),
      inBagImage: asset400_png
    }
  ],
  [
    -100,
    {
      outOfBagImage: debt100Value_png,
      outOfBagWidth: 65,
      outOfBagLabelOffset: new Vector2( 0, 2 ),
      inBagImage: debt100_png
    }
  ],
  [
    -200,
    {
      outOfBagImage: debt200Value_png,
      outOfBagWidth: 70,
      outOfBagLabelOffset: new Vector2( 8, -2 ),
      inBagImage: debt200_png
    }
  ],
  [
    -300,
    {
      outOfBagImage: debt300Value_png,
      outOfBagWidth: 65,
      inBagImage: debt300_png
    }
  ],
  [
    -400,
    {
      outOfBagImage: debt400Value_png,
      outOfBagWidth: 70,
      outOfBagLabelOffset: new Vector2( 8, -2 ),
      inBagImage: debt400_png
    }
  ]
] );

class BalanceSheetItemNode extends Node {

  /**
   * @param {ValueItem} balanceSheetItem
   */
  constructor( balanceSheetItem ) {

    // Get the imageInfo that is associated with this balance sheet item's value.
    const imageInfo = MAP_OF_VALUES_TO_IMAGE_INFO.get( balanceSheetItem.value );
    assert && assert( imageInfo, `no imageInfo found for value ${balanceSheetItem.value}` );

    // out-of-bag image - shown when the balance sheet item is not in a balance sheet item bag
    const outOfBagImageNode = new Image( imageInfo.outOfBagImage, {
      cursor: 'pointer',
      maxWidth: imageInfo.outOfBagWidth,
      center: Vector2.ZERO
    } );

    // in-bag image - shown when the balance sheet item is in a balance sheet item bag
    const inBagImageNode = new Image( imageInfo.inBagImage, {
      cursor: 'pointer',
      maxWidth: IN_BAG_ICON_DIMENSIONS.width,
      maxHeight: IN_BAG_ICON_DIMENSIONS.height,
      centerX: IN_BAG_ICON_DIMENSIONS.width / 2,
      centerY: IN_BAG_ICON_DIMENSIONS.height / 2
    } );

    // background for the in-bag icon, this keeps the icons the same size in the layout
    const inBagIconBackground = Rectangle.dimension( IN_BAG_ICON_DIMENSIONS, {
      fill: Color.TRANSPARENT,
      children: [ inBagImageNode ]
    } );

    const currencyString = new PatternStringProperty( NumberLineOperationsStrings.currencyValuePatternStringProperty, {
      sign: '', // don't show minus sign for debts, since that would be a sort of double negative
      currencyUnits: NumberLineOperationsStrings.currencyUnitsStringProperty,
      value: Math.abs( balanceSheetItem.value )
    } );

    // Remove embedding marks from the currency string if the text direction is right-to-left.  This is necessary
    // because the code above assembles the sign, currency units, and value into a single string, and our default
    // embedding messes up the way this looks.  See https://github.com/phetsims/phetcommon/issues/68.
    const adjustedCurrencyString = new DerivedProperty( [ currencyString ], stringProperty =>
      isLeftToRightProperty.value ? stringProperty : removeEmbeddingMarks( stringProperty )
    );

    const outOfBagLabelNode = new Text( adjustedCurrencyString, {
      font: new PhetFont( 18 ),
      maxWidth: outOfBagImageNode.width * 0.74 // empirically determined such that the label fits on all artwork
    } );

    // Custom bounds are needed for the AlignBox in order to center the label properly according to the required offset
    // for the image, as well as to not allow the alignBounds to expand out and effect mouse and touch areas.
    const offsetVector = imageInfo.outOfBagLabelOffset || Vector2.ZERO;
    const availableWidth = outOfBagImageNode.width - Math.abs( offsetVector.x );
    const availableHeight = outOfBagImageNode.height - Math.abs( offsetVector.y );
    const boundsMinX = outOfBagImageNode.bounds.minX + Math.max( offsetVector.x * 2, 0 );
    const boundsMinY = outOfBagImageNode.bounds.minY + Math.max( offsetVector.y * 2, 0 );

    const offsetAlignBounds = new Bounds2(
      boundsMinX,
      boundsMinY,
      boundsMinX + availableWidth - offsetVector.x,
      boundsMinY + availableHeight - offsetVector.y
    );
    const outOfBagAlignBox = new AlignBox( outOfBagLabelNode, {
      alignBounds: offsetAlignBounds,
      xAlign: 'center'
    } );
    const outOfBagRepresentationNode = new Node( { children: [ outOfBagImageNode, outOfBagAlignBox ] } );

    const inBagLabelNode = new Text( currencyString, {
      font: new PhetFont( 20 ),
      maxWidth: 60
    } );

    const inBagRepresentationNode = new HBox( {
      children: [ inBagIconBackground, inBagLabelNode ],
      spacing: 10,
      center: outOfBagImageNode.center
    } );

    // Special Case: There are two values that are loans, and the word "loan" appeared on the original artwork.  We
    // realized fairly late in the game that this word should be translatable, so the following code handles that case.
    // It's specific to the loan images, and is thus fairly fragile, but it was the most expedient way to handle the
    // situation.  If other labels are ever needed, this should be generalized instead of continuing to follow this
    // approach.
    if ( balanceSheetItem.value === -100 || balanceSheetItem.value === -300 ) {

      // out-of-bag representation
      const outOfBagTextLabelNode = new Text( NumberLineOperationsStrings.loanStringProperty, {
        font: new PhetFont( { size: 11, family: 'serif', style: 'italic' } ),
        maxWidth: outOfBagImageNode.width * 0.65
      } );

      const outOfBagTextLabelAlignBox = new AlignBox( outOfBagTextLabelNode, {
        alignBounds: outOfBagImageNode.bounds,
        xAlign: 'center',
        yAlign: 'bottom',
        yMargin: 8.5
      } );
      outOfBagRepresentationNode.addChild( outOfBagTextLabelAlignBox );

      // in-bag representation
      const inBagTextLabelNode = new Text( NumberLineOperationsStrings.loanStringProperty, {
        font: new PhetFont( { size: 8, family: 'serif', style: 'italic' } ),
        maxWidth: inBagImageNode.width * 0.65
      } );
      const inBagTextLabelAlignBox = new AlignBox( inBagTextLabelNode, {
        alignBounds: inBagImageNode.bounds,
        xAlign: 'center',
        yAlign: 'bottom',
        yMargin: 3.5
      } );
      inBagIconBackground.addChild( inBagTextLabelAlignBox );
    }

    super( {
      children: [ outOfBagRepresentationNode, inBagRepresentationNode ],
      cursor: 'pointer'
    } );

    // Prevent from being grabbed when animating, unlink not needed.
    balanceSheetItem.inProgressAnimationProperty.link( inProgressAnimation => {
      this.pickable = inProgressAnimation === null;
    } );

    // Update the visibility of the representations based on whether this item is in a balance sheet item bag.  No
    // unlink is needed.
    balanceSheetItem.inBagProperty.link( inBag => {

      // adjust node visibility
      outOfBagRepresentationNode.visible = !inBag;
      inBagRepresentationNode.visible = inBag;

      // adjust touch and mouse areas, dilation amounts empirically determined, check for overlap if changed
      if ( inBag ) {
        this.touchArea = inBagRepresentationNode.bounds.dilatedXY( 10, 4 );
        this.mouseArea = inBagRepresentationNode.bounds;
      }
      else {
        this.touchArea = outOfBagRepresentationNode.bounds.dilatedXY( 10, 6 );
        this.mouseArea = outOfBagRepresentationNode.bounds;
      }
    } );

    // drag handler
    let dragOffset = Vector2.ZERO;
    this.addInputListener( new DragListener( {

      dragBoundsProperty: new Property( this.layoutBounds ),

      start: event => {
        balanceSheetItem.isDraggingProperty.value = true;
        const dragStartPoint = this.globalToParentPoint( event.pointer.point ); // point in parent frame
        dragOffset = balanceSheetItem.positionProperty.value.minus( dragStartPoint );
        this.moveToFront(); // move to the front of the z-order in whatever layer this node is in
      },

      drag: event => {
        const dragPoint = this.globalToParentPoint( event.pointer.point );
        balanceSheetItem.teleportTo( dragPoint.plus( dragOffset ) );
      },

      end: () => {
        balanceSheetItem.isDraggingProperty.value = false;
      }
    } ) );

    // Position this node based on the model element position.  Note that there is no model-view transform, since we are
    // using the same coordinate system in both the model and view.  No unlink is needed.
    balanceSheetItem.positionProperty.link( position => {
      this.center = position;
    } );
  }
}

numberLineOperations.register( 'BalanceSheetItemNode', BalanceSheetItemNode );
export default BalanceSheetItemNode;