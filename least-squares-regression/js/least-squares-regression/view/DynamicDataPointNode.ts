// Copyright 2014-2025, University of Colorado Boulder

/**
 * Type that represents a movable dataPoint in the view.
 *
 * @author Martin Veillette (Berea College)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPoint from '../model/DataPoint.js';
import DataPointNode from './DataPointNode.js';

export default class DynamicDataPointNode extends DataPointNode {
  public readonly dragListener: DragListener;

  public constructor(

    public readonly dataPoint: DataPoint, modelViewTransform: ModelViewTransform2 ) {

    // Create the visual representation of the DynamicDataPoint
    const representation = new Circle( LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_LINE_WIDTH
    } );

    super( dataPoint, representation, modelViewTransform );

    // Expand the touch area
    this.touchArea = this.localBounds.dilatedXY( 15, 15 );

    // Add the listener that will allow the user to drag the dataPoint around.
    this.dragListener = new DragListener( {
      transform: modelViewTransform,
      positionProperty: dataPoint.positionProperty,

      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the dataPoint in model space.
      start: () => {
        dataPoint.userControlledProperty.set( true );
      },
      end: () => {
        dataPoint.userControlledProperty.set( false );
      }
    } );
    this.addInputListener( this.dragListener );
  }
}

leastSquaresRegression.register( 'DynamicDataPointNode', DynamicDataPointNode );