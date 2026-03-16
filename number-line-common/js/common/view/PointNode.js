// Copyright 2020-2025, University of Colorado Boulder

/**
 * PointNode is a Scenery node that portrays number line points in the view.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import numberLineCommon from '../../numberLineCommon.js';
import ColorizedReadoutNode from './ColorizedReadoutNode.js';

// constants
const DEFAULT_POINT_NODE_RADIUS = 4.5; // in screen coordinates

class PointNode extends Node {

  /**
   * @param {NumberLinePoint} numberLinePoint
   * @param {NumberLine} numberLine
   * @param {Object} [options] - specific to this class, not propagated to super
   * @public
   */
  constructor( numberLinePoint, numberLine, options ) {

    options = merge( {

      radius: DEFAULT_POINT_NODE_RADIUS,

      // {boolean} - if true, the label text will match the color of the point, if false the label text will be black
      usePointColorForLabelText: true,

      // {boolean} - if true, the label background will be based on the point color, if false the background will have
      // a black stroke and white interior
      colorizeLabelBackground: false,

      // {string} - template to be used when displaying the label
      labelTemplate: new StringProperty( '{{value}}' ),

      // {Font}
      labelFont: new PhetFont( 18 ),

      // {number} - opacity value for the label, 0 to 1
      labelOpacity: 1,

      // true if this point is the opposite of another number line point
      isDoppelganger: false
    }, options );

    super();

    // Add the small circle that will represent the point.
    const circle = new Circle( options.radius, {
      fill: numberLinePoint.colorProperty,
      stroke: options.isDoppelganger ? 'gray' : numberLinePoint.colorProperty
    } );
    this.addChild( circle );

    const labelPatternStringProperty = new PatternStringProperty( options.labelTemplate, {
      value: numberLinePoint.valueProperty
    }, {
      maps: {
        value: value => options.isDoppelganger ? -value : value
      }
    } );

    // Create a background and add the label text to it.
    const pointLabelNode = new ColorizedReadoutNode( labelPatternStringProperty, numberLinePoint.colorProperty, {
      colorizeBackground: options.colorizeLabelBackground,
      colorizeText: options.usePointColorForLabelText,
      opacity: options.labelOpacity,
      yMargin: 1,
      textOptions: {
        font: options.labelFont,
        maxWidth: 60 // empirically determined to work in all currently needed cases
      }
    } );

    // Add the label and link a listener for visibility.
    this.addChild( pointLabelNode );
    const labelVisibilityListener = visible => {pointLabelNode.visible = visible;};
    numberLine.showPointLabelsProperty.link( labelVisibilityListener );

    // Move in front of other points when being dragged or when the point value is being changed by other means.
    const moveToFrontMultilink = Multilink.multilink(
      [ numberLinePoint.isDraggingProperty, numberLinePoint.valueProperty ],
      () => { this.moveToFront(); }
    );

    // Update the point representation as it moves.
    const updatePointRepresentationMultilink = Multilink.multilink(
      [
        numberLinePoint.valueProperty,
        numberLine.showOppositesProperty,
        numberLine.displayedRangeProperty,
        numberLine.centerPositionProperty,
        numberLine.orientationProperty,
        pointLabelNode.boundsProperty
      ],
      ( value, oppositesVisible, displayedRange ) => {

        if ( displayedRange.contains( value ) ) {
          this.visible = true;
          if ( options.isDoppelganger ) {
            value = -value;
            this.visible = oppositesVisible;
          }
          circle.center = numberLine.valueToModelPosition( value );

          // Update the point position.
          if ( numberLine.isHorizontal ) {
            pointLabelNode.centerX = circle.centerX;
            pointLabelNode.bottom = circle.y - 20;
          }
          else {
            pointLabelNode.right = circle.x - 20;
            pointLabelNode.centerY = circle.centerY;
          }
        }
        else {

          // Don't show points that are on the number line but out of the displayed range.
          this.visible = false;
        }

      }
    );

    /**
     * @private
     */
    this.disposePointNode = () => {
      numberLine.showPointLabelsProperty.unlink( labelVisibilityListener );
      updatePointRepresentationMultilink.dispose();
      moveToFrontMultilink.dispose();
      pointLabelNode.dispose();
      labelPatternStringProperty.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposePointNode();
    super.dispose();
  }
}

numberLineCommon.register( 'PointNode', PointNode );
export default PointNode;