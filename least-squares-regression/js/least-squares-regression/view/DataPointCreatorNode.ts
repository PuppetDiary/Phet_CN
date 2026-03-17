// Copyright 2014-2025, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create new DataPoints in the model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPoint from '../model/DataPoint.js';
import DynamicDataPointNode from './DynamicDataPointNode.js';

export default class DataPointCreatorNode extends Node {

  /**
   * @param addDataPoint - A function for adding the created DataPoint to the model.
   * @param modelViewTransform - The ModelViewTransform2 instance for coordinate transformations.
   * @param providedOptions - Optional customization options.
   */
  public constructor(
    addDataPoint: ( dataPoint: DataPoint ) => DynamicDataPointNode,
    modelViewTransform: ModelViewTransform2,
    providedOptions?: NodeOptions
  ) {
    super( { cursor: 'pointer' } );

    // Create the node that the user will click upon to add a model element to the view.
    const representation = new Circle( LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_LINE_WIDTH
    } );

    this.addChild( representation );

    // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 15 );
    this.mouseArea = this.localBounds.dilated( 5 );

    // Add the listener that will allow the user to click on this and create a new dataPoint, then position it in the model.
    this.addInputListener( DragListener.createForwardingListener( event => {

      // Determine the initial position (set to be one circle radius above the pointer point)
      const viewPosition = this.globalToParentPoint( event.pointer.point );

      // Create and add the new model element.
      const modelPosition = modelViewTransform.viewToModelPosition( viewPosition );

      const dataPoint = new DataPoint( modelPosition );
      dataPoint.userControlledProperty.set( true );
      const dynamicDataPointNode = addDataPoint( dataPoint );

      dynamicDataPointNode.dragListener.press( event, dynamicDataPointNode );
    } ) );

    // Pass options through to parent.
    this.mutate( providedOptions );
  }
}

leastSquaresRegression.register( 'DataPointCreatorNode', DataPointCreatorNode );