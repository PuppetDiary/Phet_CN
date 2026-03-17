// Copyright 2014-2024, University of Colorado Boulder

/**
 * Type that defines a residual and a square residual.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import DataPoint from './DataPoint.js';

/**
 * Represents a residual between a data point and a line (either 'My Line' or 'Best Fit Line').
 */
export default class Residual {

  /**
   * Position of the dataPoint.
   */
  public readonly point1: Vector2;

  /**
   * Position on the line corresponding to the dataPoint's x-coordinate.
   */
  public readonly point2: Vector2;

  /**
   * Indicates if the squared residual is to the left of the line.
   */
  public readonly isSquaredResidualToTheLeft: boolean;

  public constructor( dataPoint: DataPoint, slope: number, intercept: number ) {

    // Calculate the y-value on the line corresponding to the dataPoint's x-coordinate.
    const yValue = slope * dataPoint.positionProperty.value.x + intercept;

    // Calculate the vertical displacement: positive if above the line, negative if below.
    const verticalDisplacement = dataPoint.positionProperty.value.y - yValue;

    // Position of the dataPoint.
    this.point1 = new Vector2( dataPoint.positionProperty.value.x, dataPoint.positionProperty.value.y );

    // Position on the line corresponding to the dataPoint's x-coordinate.
    this.point2 = new Vector2( dataPoint.positionProperty.value.x, yValue );

    // Determine if the squared residual is to the left of the line.
    this.isSquaredResidualToTheLeft = ( slope * verticalDisplacement > 0 );
  }
}

leastSquaresRegression.register( 'Residual', Residual );