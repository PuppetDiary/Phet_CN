// Copyright 2014-2025, University of Colorado Boulder

/**
 * Type that represents a static dataPoint in the view.
 *
 * @author Martin Veillette (Berea College)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPoint from '../model/DataPoint.js';
import DataPointNode from './DataPointNode.js';

export default class StaticDataPointNode extends DataPointNode {

  public constructor( dataPoint: DataPoint, modelViewTransform: ModelViewTransform2 ) {

    // Create and add  visual representation of the dataPoint
    const representation = new Circle( LeastSquaresRegressionConstants.STATIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.STATIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.STATIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.STATIC_DATA_POINT_LINE_WIDTH
    } );

    super( dataPoint, representation, modelViewTransform );
  }
}

leastSquaresRegression.register( 'StaticDataPointNode', StaticDataPointNode );