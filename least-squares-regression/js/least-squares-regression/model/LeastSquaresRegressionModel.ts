// Copyright 2014-2024, University of Colorado Boulder

/**
 * Contains all the model logic for the screen LeastSquaresRegressionScreen.
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import DataPoint from './DataPoint.js';
import DataSet from './DataSet.js';
import Graph from './Graph.js';

// constants
const BUCKET_SIZE = new Dimension2( 100, 55 );
const BUCKET_POSITION = new Vector2( 120, 480 );

export default class LeastSquaresRegressionModel {

  // Controls the visibility of the graph grid
  public readonly showGridProperty: Property<boolean>;

  // DataSet selected by the Combo Box
  public readonly selectedDataSetProperty: Property<DataSet>;

  // Sends an event when points are added in bulk
  public readonly dataPointsAddedEmitter: Emitter;

  // Array of dataPoints (may be on or off the graph)
  public readonly dataPoints: ObservableArray<DataPoint>;

  // Various data sets that populate the Combo Box
  public readonly dataSets: DataSet[];

  // Model of the graph containing all information regarding graph composition
  public readonly graph: Graph;

  // Bucket model
  public readonly bucket: Bucket;

  public constructor() {
    this.showGridProperty = new BooleanProperty( false );
    this.selectedDataSetProperty = new Property( DataSet.CUSTOM );
    this.dataPointsAddedEmitter = new Emitter();

    // Create an observable array for data points
    this.dataPoints = createObservableArray<DataPoint>();

    // Populate dataSets
    this.dataSets = [
      DataSet.CUSTOM,
      DataSet.HEIGHT_SHOE,
      DataSet.SPENDING_SALARY,
      DataSet.MORTALITY_YEAR,
      DataSet.WAGE_YEAR,
      DataSet.USER_YEAR,
      DataSet.GASOLINE_YEAR,
      DataSet.LIFE_TV,
      DataSet.SPEED_DISTANCE,
      DataSet.TEMPERATURE_FAHRENHEIT_CHIRP,
      DataSet.TEMPERATURE_FAHRENHEIT_LONGITUDE,
      DataSet.TEMPERATURE_FAHRENHEIT_LATITUDE,
      DataSet.TEMPERATURE_CELSIUS_CHIRP,
      DataSet.TEMPERATURE_CELSIUS_LONGITUDE,
      DataSet.TEMPERATURE_CELSIUS_LATITUDE
    ];

    this.graph = new Graph(
      this.selectedDataSetProperty.value.xRange,
      this.selectedDataSetProperty.value.yRange
    );

    this.bucket = new Bucket( {
      position: BUCKET_POSITION,
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    } );

    let savedCustomDataPoints: Array<{ currentPoint: Vector2; initialPoint: Vector2 }> = [];

    // What to do when the selected Data Set changes. no need to unlink, present for the lifetime of the sim
    this.selectedDataSetProperty.link( ( selectedDataSet, oldSelectedDataSet ) => {

      // saved the position data of CUSTOM if we are going from CUSTOM to another dataSet
      if ( oldSelectedDataSet && oldSelectedDataSet === DataSet.CUSTOM ) {
        savedCustomDataPoints = this.graph.dataPointsOnGraph.map( dataPoint => {
          return {
            initialPoint: dataPoint.positionProperty.initialValue.copy(),
            currentPoint: dataPoint.positionProperty.value.copy()
          };
        } );
      }

      // unlink the listeners to dataPoints
      // this address an issue if one is userControlling a dataPoint while changing selecting a new dataSet (only possible with multitouch)
      //  see  https://github.com/phetsims/least-squares-regression/issues/11
      this.disposeDataPoints();

      // Clear the dataPoints array
      this.dataPoints.clear();

      // Clear the residual arrays and the dataPointsOnGraph array
      this.graph.resetOnChangeOfDataSet();

      // Set the horizontal range, vertical range, and multiplicative factors for the slope and the intercept
      this.graph.setGraphDomain( selectedDataSet.xRange, selectedDataSet.yRange );

      // Populate the dataPoints array

      if ( selectedDataSet === DataSet.CUSTOM ) {

        // use the savedCustomDataPoints to populate the dataPoints array
        savedCustomDataPoints.forEach( dataPoint => {
          const newDataPoint = new DataPoint( dataPoint.initialPoint.copy() );
          newDataPoint.positionProperty.value = dataPoint.currentPoint.copy();
          this.dataPoints.push( newDataPoint );
        } );

        this.dataPoints.forEach( dataPoint => {
          this.addDataPointControlledListener( dataPoint );
        } );
      }
      else {
        // Populate from selectedDataSet dataXY
        selectedDataSet.dataXY.forEach( position => {

          // For your information, only one modelViewTransform is used throughout the simulation, the bounds of the model are set by the graph bounds
          // Rescale all the {X,Y} value to the normalized graph bounds
          const xNormalized = Utils.linear(
            selectedDataSet.xRange.min,
            selectedDataSet.xRange.max,
            this.graph.bounds.minX,
            this.graph.bounds.maxX,
            position.x
          );
          const yNormalized = Utils.linear(
            selectedDataSet.yRange.min,
            selectedDataSet.yRange.max,
            this.graph.bounds.minY,
            this.graph.bounds.maxY,
            position.y
          );
          const positionVector = new Vector2( xNormalized, yNormalized );
          this.dataPoints.push( new DataPoint( positionVector ) );
        } );
      }

      // Add the Data Points on Graph and all the Residuals
      // For performance reason, we do it in bulk so that we don't constantly update the residuals after adding a dataPoint
      this.dataPoints.forEach( dataPoint => this.graph.dataPointsOnGraph.push( dataPoint ) );

      // Since we added the dataPoints in Bulk, let's send a trigger to the view
      this.dataPointsAddedEmitter.emit();
    } );
  }

  /**
   * Resets values to their original state
   */
  public reset(): void {
    this.showGridProperty.reset();
    this.selectedDataSetProperty.reset();
    this.disposeDataPoints();
    this.dataPoints.clear();
    this.graph.reset();
  }

  /**
   * Unlink listeners to dataPoint. Listeners might have been removed when the data point was removed from the graph,
   * so check that they are still attached first.
   */
  private disposeDataPoints(): void {
    this.dataPoints.forEach( dataPoint => {
      if ( dataPoint.userControlledProperty.hasListener( dataPoint.userControlledListener! ) ) {
        dataPoint.userControlledProperty.unlink( dataPoint.userControlledListener! );
      }

      dataPoint.dispose();
    } );
  }

  /**
   * Animates all the dataPoints back to the bucket
   */
  public returnAllDataPointsToBucket(): void {
    this.dataPoints.forEach( dataPoint => {
      dataPoint.animateBackToBucket();
    } );
  }

  /**
   * Function for adding new dataPoints to this model when the user creates them, generally by clicking on
   * some sort of creator node.
   */
  public addUserCreatedDataPoint( dataPoint: DataPoint ): void {
    this.dataPoints.push( dataPoint );
    this.addDataPointControlledListener( dataPoint );
  }

  /**
   * Function that adds position listener and user Controlled listener;
   * Useful for dynamical points
   */
  private addDataPointControlledListener( dataPoint: DataPoint ): void {

    dataPoint.userControlledListener = ( userControlled: boolean ) => {
      const isOnGraph = this.graph.isDataPointPositionOverlappingGraph( dataPoint.positionProperty.value );
      if ( !isOnGraph && !userControlled ) {
        // return the dataPoint to the bucket
        dataPoint.animateBackToBucket();
      }
    };

    // Determine if the data Point is not user controlled and not on graph. If so let's animate it, i.e. return it to the bucket
    dataPoint.userControlledProperty.link( dataPoint.userControlledListener );

    // The dataPoint will be removed from the model if and when it returns to its origination point. This is how a dataPoint
    // can be 'put back' into the bucket. Listeners might have been removed when it was removed from the
    // graph so check to make sure listeners are still attached before unlinking.
    dataPoint.returnedToOriginListener = () => {
      if ( this.dataPoints.includes( dataPoint ) ) {
        this.dataPoints.remove( dataPoint );
      }

      if ( dataPoint.userControlledListener &&
           dataPoint.userControlledProperty.hasListener( dataPoint.userControlledListener ) ) {
        dataPoint.userControlledProperty.unlink( dataPoint.userControlledListener );
      }

      if ( dataPoint.returnedToOriginListener && dataPoint.returnedToOriginEmitter.hasListener( dataPoint.returnedToOriginListener ) ) {
        dataPoint.returnedToOriginEmitter.removeListener( dataPoint.returnedToOriginListener );
      }
    };

    dataPoint.returnedToOriginEmitter.addListener( dataPoint.returnedToOriginListener );
  }
}

leastSquaresRegression.register( 'LeastSquaresRegressionModel', LeastSquaresRegressionModel );