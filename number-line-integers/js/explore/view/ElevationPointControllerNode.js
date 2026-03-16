// Copyright 2019-2025, University of Colorado Boulder

/**
 * a Scenery node that is used to control point positions in the "Elevation" scene of the Number Line Integers sim
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Shape from '../../../../kite/js/Shape.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import { PointControllerImageKey } from './ElevationSceneView.js';

// constants
const IMAGE_DILATION = 20;
const DISTANCE_TEXT_MAX_WIDTH = 250;

const amountAboveSeaLevelStringProperty = NumberLineIntegersStrings.amountAboveSeaLevelStringProperty;
const amountBelowSeaLevelStringProperty = NumberLineIntegersStrings.amountBelowSeaLevelStringProperty;
const seaLevelStringProperty = NumberLineIntegersStrings.seaLevelStringProperty;

class ElevationPointControllerNode extends PointControllerNode {

  /**
   * @param {ElevationPointController} pointController
   * @param {Map<PointControllerImageKey, Image>} imageMap - the set of images to use for this node, keyed to enable
   *                                                         switching between them based on position
   * @param {number} seaLevel - the y value in view coordinates of the sea level
   * @param {Map<PointControllerImageKey, Vector2>} textOffsets - the offsets for the centerLeft positions of the
   *                                                              absolute value texts relative to the image
   *                                                              rightCenter
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, imageMap, seaLevel, textOffsets, options ) {

    assert && assert( !options || !options.node, 'options should not include a node for this constructor' );

    // Dilate each image's touch area for easier interaction on touch screens.
    imageMap.forEach( image => { image.touchArea = image.localBounds.dilated( IMAGE_DILATION ); } );

    // Create a node with all the images that will be used to depict this elevatable item.
    const compositeImageNode = new Node( { children: Array.from( imageMap.values() ) } );

    options = merge( {

      // Pass in the parent node that includes all images as the node that will control the point.
      node: compositeImageNode,

      // {function} - A function that takes a position and a currently selected image key and returns the key for  the
      // image that should be visible.  This enables fairly complex appearance changes to the point controller node.
      imageSelectionFunction: ( position, currentlySelectedImageKey ) => {
        return currentlySelectedImageKey;
      }
    }, options );

    // Set the initial visibility of the images used for this node.
    let currentlySelectedImageKey = PointControllerImageKey.IN_THE_AIR;
    for ( const [ key, value ] of imageMap ) {
      value.visible = key === currentlySelectedImageKey;
    }

    // offset used for positioning text
    let textOffset = textOffsets.get( currentlySelectedImageKey );

    // Update the visibility of the images as the position changes.
    pointController.positionProperty.link( position => {

      const keyForImageToShow = options.imageSelectionFunction( position, currentlySelectedImageKey );

      if ( keyForImageToShow !== currentlySelectedImageKey ) {

        // Check that the needed information was provided at construction.
        assert && assert( imageMap.has( keyForImageToShow ), 'imageMap does not contain an entry for this key' );
        assert && assert( textOffsets.has( keyForImageToShow ), 'textOffsets does not contain an entry for this key' );

        // Update image visibility and offsets.
        imageMap.get( currentlySelectedImageKey ).visible = false;
        imageMap.get( keyForImageToShow ).visible = true;
        textOffset = textOffsets.get( keyForImageToShow );

        // Update the selected image for the next time through.
        currentlySelectedImageKey = keyForImageToShow;
      }
    } );

    super( pointController, options );

    const absoluteValueLine = new Path( null, { stroke: pointController.color, lineWidth: 2 } );

    // This assumes that numberLinePoints only has one active numberLinePoint at a time. When a point is removed the
    // property will have a value of null.
    const currentNumberLinePointValueProperty = new Property( null );

    // This DynamicProperty allows our pattern strings to track the value property of the active number line point.
    const pointValueProperty = new DynamicProperty( currentNumberLinePointValueProperty );

    pointController.numberLinePoints.addItemAddedListener( point => {
      assert && assert(
        pointController.numberLinePoints.length === 1,
        'ElevationPointControllerNode should only have one numberLinePoint'
      );
      currentNumberLinePointValueProperty.set( point.valueProperty );
    } );

    // Handle removal of the controlled point from the number line.
    pointController.numberLinePoints.addItemRemovedListener( () => {
      currentNumberLinePointValueProperty.set( null );
    } );

    const amountAboveTextVisibleProperty = new BooleanProperty( false );
    const amountAboveText = new Text(
      new PatternStringProperty( amountAboveSeaLevelStringProperty, { value: pointValueProperty } ),
      {
        font: new PhetFont( 18 ),
        fill: pointController.color,
        maxWidth: DISTANCE_TEXT_MAX_WIDTH,
        visibleProperty: amountAboveTextVisibleProperty
      }
    );

    const amountBelowTextVisibleProperty = new BooleanProperty( false );
    const amountBelowText = new Text(
      new PatternStringProperty( amountBelowSeaLevelStringProperty, { value: pointValueProperty }, {
        maps: {
          value: value => Math.abs( value )
        }
      } ),
      {
        font: new PhetFont( 18 ),
        fill: pointController.color,
        maxWidth: DISTANCE_TEXT_MAX_WIDTH,
        visibleProperty: amountBelowTextVisibleProperty
      }
    );

    const seaLevelTextVisibleProperty = new BooleanProperty( false );
    const seaLevelText = new Text(
      new PatternStringProperty( seaLevelStringProperty, { value: pointValueProperty } ),
      {
        font: new PhetFont( 18 ),
        fill: pointController.color,
        maxWidth: DISTANCE_TEXT_MAX_WIDTH,
        visibleProperty: seaLevelTextVisibleProperty
      }
    );
    const distanceTextWrapper = new Node( {
      children: [ amountAboveText, amountBelowText, seaLevelText ],
      excludeInvisibleChildrenFromBounds: true
    } );

    const distanceLabel = new BackgroundNode( distanceTextWrapper, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( absoluteValueLine );
    this.addChild( distanceLabel );
    absoluteValueLine.moveToBack();
    const numberLine = pointController.numberLines[ 0 ];

    // Update the absolute value representation and associated text. There is no need to unlink this since the elevation
    // point controllers don't come and go.
    Multilink.multilink(
      [ numberLine.showAbsoluteValuesProperty, pointController.positionProperty ],
      showAbsoluteValues => {
        if ( showAbsoluteValues
             && pointController.overElevationAreaProperty.value
             && pointController.isControllingNumberLinePoint() ) {

          // Update the line that goes between the image and sea level.
          absoluteValueLine.shape = new Shape()
            .moveTo( compositeImageNode.x, compositeImageNode.y )
            .lineTo( compositeImageNode.x, seaLevel );

          // Update the visibility of the labels that describe the absolute value in text.
          seaLevelTextVisibleProperty.value = pointValueProperty.value === 0;
          amountAboveTextVisibleProperty.value = pointValueProperty.value > 0;
          amountBelowTextVisibleProperty.value = pointValueProperty.value < 0;

          // Update parent label node's position and visibility.
          distanceLabel.visible = true;
          distanceLabel.leftCenter = compositeImageNode.rightCenter.plus( textOffset );
        }
        else {
          absoluteValueLine.shape = null;
          distanceLabel.visible = false;
        }
      }
    );
  }
}

numberLineIntegers.register( 'ElevationPointControllerNode', ElevationPointControllerNode );
export default ElevationPointControllerNode;