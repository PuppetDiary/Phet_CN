// Copyright 2024-2025, University of Colorado Boulder

/**
 * Render residual lines and squares.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import Graph from '../model/Graph.js';
import Residual from '../model/Residual.js';

export default class ResidualCanvasNode extends CanvasNode {

  public constructor(
    private readonly graph: Graph,
    private readonly modelViewTransform: ModelViewTransform2,
    stageWidth: number, stageHeight: number ) {

    super( {
      canvasBounds: new Bounds2( 0, 0, stageWidth, stageHeight )
    } );
    this.invalidatePaint();
    this.modelViewTransform = modelViewTransform;
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {

    // --- SET CLIPPING REGION ---
    context.save(); // Save context state before clipping

    // Transform the graph's xRange and yRange to view coordinates
    const xMinView = this.modelViewTransform.modelToViewX( this.graph.bounds.minX );
    const xMaxView = this.modelViewTransform.modelToViewX( this.graph.bounds.maxX );
    const yMinView = this.modelViewTransform.modelToViewY( this.graph.bounds.minY );
    const yMaxView = this.modelViewTransform.modelToViewY( this.graph.bounds.maxY );

    // Determine the clipping rectangle dimensions in view coordinates
    const clipLeft = Math.min( xMinView, xMaxView );
    const clipRight = Math.max( xMinView, xMaxView );
    const clipTop = Math.min( yMinView, yMaxView );
    const clipBottom = Math.max( yMinView, yMaxView );

    const clipWidth = clipRight - clipLeft;
    const clipHeight = clipBottom - clipTop;

    // Define and activate the clipping region
    context.beginPath();
    context.rect( clipLeft, clipTop, clipWidth, clipHeight );
    context.clip(); // Activate the clip region
    context.closePath();
    // --- CLIPPING END ---

    // --- DRAW BACKGROUND FOR DEBUGGING ---
    // Apply background color in view coordinates
    // context.fillStyle = 'rgba(0,0,255,0.5)';
    // context.fillRect( 0, 0, context.canvas.width, context.canvas.height );
    // --- DRAW BACKGROUND END ---

    // --- DEFINE HELPER FUNCTION TO DRAW RESIDUALS ---
    const drawResidual = (
      residual: Residual,
      residualColor: string,
      squaredResidualColor: string,
      lineWidth: number,
      showLines: boolean,
      showSquares: boolean
    ) => {
      // Convert residual points to view coordinates
      const point1 = this.modelViewTransform.modelToViewPosition( residual.point1 );
      const point2 = this.modelViewTransform.modelToViewPosition( residual.point2 );

      if ( showSquares ) {

        // Calculate square residual dimensions
        const top = Math.min( point1.y, point2.y );
        const height = Math.abs( point1.y - point2.y );
        const width = height; // Ensuring the square has equal width and height

        // Determine the left position of the square based on residual direction
        const left = residual.isSquaredResidualToTheLeft ? point1.x - width : point1.x;

        // Draw square residual
        context.beginPath();
        context.fillStyle = squaredResidualColor;
        context.rect( left, top, width, height );
        context.fill(); // Fill square
        context.closePath();
      }

      if ( showLines ) {
        // Draw residual line
        context.beginPath();
        context.moveTo( point1.x, point1.y );
        context.strokeStyle = residualColor;
        context.lineWidth = lineWidth;
        context.lineTo( point2.x, point2.y );
        context.stroke();
        context.closePath();
      }

    };
    // --- HELPER FUNCTION END ---

    // --- DRAW RESIDUALS ---
    // Iterate over each data point on the graph
    this.graph.dataPointsOnGraph.forEach( dataPoint => {
      if ( this.graph.isLinearFitDefined() ) {
        const bestFitLine = this.graph.getLinearFit();
        const bestFitResidual = new Residual( dataPoint, bestFitLine.slope, bestFitLine.intercept );

        // Use helper function to draw residual for linear fit
        drawResidual(
          bestFitResidual,
          LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.RESIDUAL_COLOR,
          LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.SQUARED_RESIDUAL_COLOR,
          LeastSquaresRegressionConstants.RESIDUAL_LINE_WIDTH,
          this.graph.bestFitLineResidualsVisibleProperty.value,
          this.graph.bestFitLineSquaredResidualsVisibleProperty.value
        );
      }

      // Create residual for "my line"
      const myLineResidual = new Residual( dataPoint, this.graph.slope( this.graph.angleProperty.value ), this.graph.interceptProperty.value );

      // Use helper function to draw residual for "my line"
      drawResidual(
        myLineResidual,
        LeastSquaresRegressionConstants.MY_LINE_COLOR.RESIDUAL_COLOR,
        LeastSquaresRegressionConstants.MY_LINE_COLOR.SQUARED_RESIDUAL_COLOR,
        LeastSquaresRegressionConstants.RESIDUAL_LINE_WIDTH,
        this.graph.myLineResidualsVisibleProperty.value,
        this.graph.myLineSquaredResidualsVisibleProperty.value
      );
    } );
    // --- RESIDUALS DRAWN ---

    context.restore(); // Restore the context to remove the clipping region
  }
}

leastSquaresRegression.register( 'ResidualCanvasNode', ResidualCanvasNode );