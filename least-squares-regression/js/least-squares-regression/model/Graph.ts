// Copyright 2014-2025, University of Colorado Boulder

/**
 * Model of a rectangular graph upon which various data points can be placed.
 * The graph Model is responsible for generating all statistical quantities related to a dataPoint set for 'best Fit Line' and 'My Line'
 * In addition, the associated Residuals (for 'My Line' and 'Best Fit Line') of the dataPoints are handled by graph model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import DataPoint from './DataPoint.js';

/**
 * Graph model for handling data points, residuals, and statistics related to lines of best fit.
 */
export default class Graph {

  // Public Properties controlling visibility and line parameters
  public readonly angleProperty: NumberProperty; // in radians, a proxy for the 'my line' slope.
  public readonly interceptProperty: NumberProperty; // in graph units
  public readonly myLineVisibleProperty: BooleanProperty; // visibility of My Line on the graph and associated checkbox
  public readonly bestFitLineVisibleProperty: BooleanProperty; // visibility of Best Fit Line on the graph and associated checkbox
  public readonly myLineShowResidualsProperty: BooleanProperty; // visibility of Residuals of My Line (checkbox only)
  public readonly myLineShowSquaredResidualsProperty: BooleanProperty; // visibility of Squared Residuals of My Line (checkbox only)
  public readonly bestFitLineShowResidualsProperty: BooleanProperty; // visibility of Residuals of Best Fit Line (checkbox only)
  public readonly bestFitLineShowSquaredResidualsProperty: BooleanProperty; // visibility of Squared Residuals of Best Fit Line (checkbox only)

  // DerivedProperties controlling visibility of residuals based on multiple factors
  public readonly myLineResidualsVisibleProperty: TReadOnlyProperty<boolean>; // property that controls the visibility of the Residuals on the graph for My Line
  public readonly myLineSquaredResidualsVisibleProperty: TReadOnlyProperty<boolean>; // property that controls the visibility of the Square Residuals on the graph for My Line
  public readonly bestFitLineResidualsVisibleProperty: TReadOnlyProperty<boolean>; // property that controls the visibility of the Square Residuals on the graph for Best Fit Line
  public readonly bestFitLineSquaredResidualsVisibleProperty: TReadOnlyProperty<boolean>; // property that controls the visibility of the Square Residuals on the graph for Best Fit Line

  // Bounds for the graph in model coordinates, it is a unit square. This remains the same for all DataSets
  public readonly bounds: Bounds2;

  // Array of dataPoints currently on the graph
  public dataPointsOnGraph: DataPoint[];

  // Factors for slope and intercept conversions
  public slopeFactor!: number;
  public interceptFactor!: number;
  public interceptOffset!: number;

  // Statistical fields
  private averageOfSumOfSquaresXX!: number;
  private averageOfSumOfSquaresXY!: number;
  private averageOfSumOfSquaresYY!: number;
  private averageOfSumOfX!: number;
  private averageOfSumOfY!: number;

  public constructor( xRange: Range, yRange: Range ) {

    this.angleProperty = new NumberProperty( 0 );
    this.interceptProperty = new NumberProperty( 0 );
    this.myLineVisibleProperty = new BooleanProperty( true );
    this.bestFitLineVisibleProperty = new BooleanProperty( false );
    this.myLineShowResidualsProperty = new BooleanProperty( false );
    this.myLineShowSquaredResidualsProperty = new BooleanProperty( false );
    this.bestFitLineShowResidualsProperty = new BooleanProperty( false );
    this.bestFitLineShowSquaredResidualsProperty = new BooleanProperty( false );

    this.myLineResidualsVisibleProperty = new DerivedProperty(
      [ this.myLineVisibleProperty, this.myLineShowResidualsProperty ],
      ( myLineVisible, myLineShowResiduals ) => myLineVisible && myLineShowResiduals
    );

    this.myLineSquaredResidualsVisibleProperty = new DerivedProperty(
      [ this.myLineVisibleProperty, this.myLineShowSquaredResidualsProperty ],
      ( myLineVisible, myLineShowSquaredResiduals ) => myLineVisible && myLineShowSquaredResiduals
    );

    this.bestFitLineResidualsVisibleProperty = new DerivedProperty(
      [ this.bestFitLineVisibleProperty, this.bestFitLineShowResidualsProperty ],
      ( bestFitLineVisible, bestFitLineShowResiduals ) => bestFitLineVisible && bestFitLineShowResiduals
    );

    this.bestFitLineSquaredResidualsVisibleProperty = new DerivedProperty(
      [ this.bestFitLineVisibleProperty, this.bestFitLineShowSquaredResidualsProperty ],
      ( bestFitLineVisible, bestFitLineShowSquaredResiduals ) => bestFitLineVisible && bestFitLineShowSquaredResiduals
    );

    this.bounds = new Bounds2( 0, 0, 1, 1 );

    // array of the dataPoints that are overlapping the graph.
    this.dataPointsOnGraph = [];

    // set the domain of the graphs (for future use by the equation Node and the graph Axes)
    this.setGraphDomain( xRange, yRange );
  }

  /**
   * Reset the visibility of the lines and residuals as well as the angle and intercept.
   * Empty out the two residual arrays and the dataPoints on Graph array
   */
  public reset(): void {
    this.angleProperty.reset();
    this.interceptProperty.reset();
    this.myLineVisibleProperty.reset();
    this.bestFitLineVisibleProperty.reset();
    this.myLineShowResidualsProperty.reset();
    this.myLineShowSquaredResidualsProperty.reset();
    this.bestFitLineShowResidualsProperty.reset();
    this.bestFitLineShowSquaredResidualsProperty.reset();
    this.dataPointsOnGraph = [];
  }

  /**
   * Empty out the two residual arrays and the dataPointsOnGraph array.
   */
  public resetOnChangeOfDataSet(): void {
    this.dataPointsOnGraph = [];
  }

  /**
   * Sets the horizontal and vertical graph domain of dataSets and the corresponding multiplicative factor
   * for the slope and intercept.
   */
  public setGraphDomain( xRange: Range, yRange: Range ): void {
    this.slopeFactor = ( yRange.max - yRange.min ) / ( xRange.max - xRange.min ) / ( this.bounds.height / this.bounds.width );
    this.interceptFactor = ( yRange.max - yRange.min ) / this.bounds.height;
    this.interceptOffset = ( yRange.min );
  }

  /**
   * Convert the angle of a line (measured from the horizontal x-axis) to a slope.
   */
  public slope( angle: number ): number {
    return Math.tan( angle ) * this.bounds.height / this.bounds.width;
  }

  /**
   * Function that returns true if the dataPoint is on the array.
   */
  public isDataPointOnList( dataPoint: DataPoint ): boolean {
    const index = this.dataPointsOnGraph.indexOf( dataPoint );
    return ( index !== -1 );
  }

  /**
   * Function that determines if the Position of a Data Point is within the visual bounds of the graph.
   */
  public isDataPointPositionOverlappingGraph( position: Vector2 ): boolean {
    return this.bounds.containsPoint( position );
  }

  /**
   * Add the dataPoint to the dataPointsOnGraph Array and add 'My Line' and 'Best Fit Line' model Residuals.
   */
  public addPointAndResiduals( dataPoint: DataPoint ): void {
    this.dataPointsOnGraph.push( dataPoint );
  }

  /**
   * Remove a dataPoint and its associated residuals ('My Line' and 'Best Fit Line')
   */
  public removePoint( dataPoint: DataPoint ): void {
    affirm( this.isDataPointOnList( dataPoint ), ' need the point to be on the list to remove it' );
    arrayRemove( this.dataPointsOnGraph, dataPoint );
  }

  /**
   * Function that returns the sum of squared residuals of all the dataPoints on the list (compared with a line with a slope and intercept)
   */
  private sumOfSquaredResiduals( slope: number, intercept: number ): number {
    let sumOfSquareResiduals = 0;
    this.dataPointsOnGraph.forEach( dataPoint => {
      const yResidual = ( slope * dataPoint.positionProperty.value.x + intercept ) - dataPoint.positionProperty.value.y;
      sumOfSquareResiduals += yResidual * yResidual;
    } );
    return sumOfSquareResiduals;
  }

  /**
   * Function that returns the sum of squared residuals of 'My Line'
   * The sum of squared residual is zero if there are less than one dataPoint on the graph.
   */
  public getMyLineSumOfSquaredResiduals(): number {
    if ( this.dataPointsOnGraph.length >= 1 ) {
      return this.sumOfSquaredResiduals( this.slope( this.angleProperty.value ), this.interceptProperty.value );
    }
    else {
      return 0;
    }
  }

  /**
   * Function that returns the sum of squared residuals of 'Best Fit Line'
   * The sum of squared residual is zero if there are less than two dataPoints on the graph
   */
  public getBestFitLineSumOfSquaredResiduals(): number {
    if ( this.isLinearFitDefined() ) {
      const linearFitParameters = this.getLinearFit();
      return this.sumOfSquaredResiduals( linearFitParameters.slope, linearFitParameters.intercept );
    }
    else {
      return 0;
    }
  }

  /**
   * Returns an array of two points that crosses the left and the right hand side of the graph bounds
   */
  public getBoundaryPoints( slope: number, intercept: number ): { point1: Vector2; point2: Vector2 } {
    const yValueLeft = slope * this.bounds.minX + intercept;
    const yValueRight = slope * this.bounds.maxX + intercept;
    return {
      point1: new Vector2( this.bounds.minX, yValueLeft ),
      point2: new Vector2( this.bounds.maxX, yValueRight )
    };
  }

  /**
   * Function that updates statistical properties of the dataPoints on the graph.
   */
  private getStatistics(): void {
    const dataPointArray = this.dataPointsOnGraph;
    affirm( dataPointArray !== null, 'dataPointsOnGraph must contain data' );
    const arrayLength = dataPointArray.length;

    const squaresXX = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.x );
    const squaresXY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.y );
    const squaresYY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.y * dataPoint.positionProperty.value.y );
    const positionArrayX = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x );
    const positionArrayY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.y );

    function add( memo: number, num: number ): number {
      return memo + num;
    }

    const sumOfSquaresXX = _.reduce( squaresXX, add, 0 );
    const sumOfSquaresXY = _.reduce( squaresXY, add, 0 );
    const sumOfSquaresYY = _.reduce( squaresYY, add, 0 );
    const sumOfX = _.reduce( positionArrayX, add, 0 );
    const sumOfY = _.reduce( positionArrayY, add, 0 );

    this.averageOfSumOfSquaresXX = sumOfSquaresXX / arrayLength;
    this.averageOfSumOfSquaresXY = sumOfSquaresXY / arrayLength;
    this.averageOfSumOfSquaresYY = sumOfSquaresYY / arrayLength;
    this.averageOfSumOfX = sumOfX / arrayLength;
    this.averageOfSumOfY = sumOfY / arrayLength;
  }

  /**
   * Determine if the best fit line can be defined (at least two points and no vertical alignment).
   */
  public isLinearFitDefined(): boolean {

    // you can't have a linear fit with less than 2 data points
    if ( this.dataPointsOnGraph.length < 2 ) {
      return false;
    }
    else {
      this.getStatistics();
      const xVariance = this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX;

      // the linear fit parameters are not defined when the points are aligned vertically (infinite slope).
      // check for a threshold to prevent https://github.com/phetsims/least-squares-regression/issues/60
      return xVariance >= 2e-10;
    }
  }

  /**
   * Function that returns the 'best fit line' parameters, i.e. slope and intercept of the dataPoints on the graph.
   * It would be wise to check if isLinearFitDefined() is true before calling this function.
   */
  public getLinearFit(): { slope: number; intercept: number } {
    this.getStatistics();
    const slopeNumerator = this.averageOfSumOfSquaresXY - this.averageOfSumOfX * this.averageOfSumOfY;
    const slopeDenominator = this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX;
    const slope = slopeNumerator / slopeDenominator;
    const intercept = this.averageOfSumOfY - slope * this.averageOfSumOfX;

    return {
      slope: slope,
      intercept: intercept
    };
  }

  /**
   * Function that returns the Pearson Coefficient Correlation
   * It returns null if there are less than two dataPoints on the graph.
   * For two dataPoints and more, the Pearson coefficient ranges from -1 to 1.
   * Note that the Pearson Coefficient Correlation is an intrinsic property of a set of DataPoint
   * See http://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient
   */
  public getPearsonCoefficientCorrelation(): number | null {
    if ( !this.isLinearFitDefined() ) {
      return null;
    }
    else {
      this.getStatistics();
      let pearsonCoefficientCorrelationNumerator = this.averageOfSumOfSquaresXY - this.averageOfSumOfX * this.averageOfSumOfY;

      if ( Math.abs( pearsonCoefficientCorrelationNumerator ) < 1E-10 ) {
        pearsonCoefficientCorrelationNumerator = 0;
      }

      // for very small values, we can end up with a very small or negative number.  In this case, return null so we
      // don't get a NaN for the coefficient.

      const number = ( this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX ) * ( this.averageOfSumOfSquaresYY - this.averageOfSumOfY * this.averageOfSumOfY );
      if ( number < 1E-15 ) {
        return null;
      }
      const pearsonCoefficientCorrelationDenominator = Math.sqrt( number );

      // make sure the denominator is not equal to zero, this happens if all the points are aligned vertically
      if ( pearsonCoefficientCorrelationDenominator === 0 ) {
        return null;
      }
      else {
        return pearsonCoefficientCorrelationNumerator / pearsonCoefficientCorrelationDenominator;
      }
    }
  }
}

leastSquaresRegression.register( 'Graph', Graph );