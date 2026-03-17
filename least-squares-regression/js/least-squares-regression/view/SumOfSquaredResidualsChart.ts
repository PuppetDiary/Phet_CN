// Copyright 2014-2025, University of Colorado Boulder

/**
 * A Scenery Node that represents a barometer chart of the sum of square residuals .
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import Graph from '../model/Graph.js';

// constants
const ARROW_LENGTH = 175;
const ARROW_HEAD_WIDTH = 4;
const ARROW_HEAD_HEIGHT = 6;
const RECTANGLE_BAROMETER_HEIGHT = 10;
const LINE_WIDTH = 1;
const LINE_COLOR = 'black';
const FONT = LeastSquaresRegressionConstants.SUM_RESIDUALS_FONT;

export default class SumOfSquaredResidualsChart extends Node {
  public readonly updateWidth: () => void;

  public constructor( graph: Graph, getSumOfSquaredResiduals: () => number, dataPointsAddedEmitter: Emitter, fillColor: Color | string, visibleProperty: TReadOnlyProperty<boolean> ) {

    super();

    // The barometer chart is on its side, set width to 1 , will update it momentarily
    const rectangleBarometer = new Rectangle( 0, 0, 1, RECTANGLE_BAROMETER_HEIGHT, {
      fill: fillColor,
      bottom: -LINE_WIDTH,
      left: LINE_WIDTH / 2
    } );

    // Create the chart
    const horizontalArrow = new ArrowNode( 0, 0, ARROW_LENGTH, 0, {
      tailWidth: LINE_WIDTH,
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT
    } );
    const verticalLine = new Line( 0, 0, 0, -2 * RECTANGLE_BAROMETER_HEIGHT, {
      lineWidth: LINE_WIDTH,
      stroke: LINE_COLOR
    } );

    // Text for the chart
    const label = new Text( LeastSquaresRegressionStrings.sumStringProperty, {
      font: FONT,
      maxWidth: 100
    } );
    ManualConstraint.create( this, [ label, horizontalArrow ], ( label, horizontalArrow ) => {
      label.centerX = horizontalArrow.centerX;
      label.top = horizontalArrow.bottom + 5;
    } );
    const zeroLabel = new Text( '0', { font: FONT, centerX: horizontalArrow.left, top: horizontalArrow.bottom + 5 } );

    /**
     * For an input value ranging from 0 to infinity, the tanh function will return a value ranging between 0 and 1
     */
    function tanh( x: number ): number {
      // this (particular) definition of hyperbolic tan function will work well for large positive x values
      return ( 1 - Math.exp( -2 * x ) ) / ( 1 + Math.exp( -2 * x ) );
    }

    /**
     * Update the width of the rectangular Barometer
     */
    function updateWidth(): void {
      // the width of the barometer is a non-linear. we use the tanh function to map an infinite range to a finite range
      // Note that tanh(0.5)=0.46. i.e  approximately 1/2;
      // We want that a sum of squared residuals of 1/8 the area of the visible graph yields a width that reaches
      // half the maximum value hence the value 4=8*1/2 .
      rectangleBarometer.rectWidth = ARROW_LENGTH * tanh( 4 * getSumOfSquaredResiduals() );
    }

    // The barometer width is adjustable
    // the square of the residuals vary if the position of the point change, points are added/subtracted to the graph and if the line change position
    Multilink.multilink( [ graph.angleProperty, graph.interceptProperty ], () => updateWidth() );

    // Trigger an update after all the points have been added in bulk to the model
    dataPointsAddedEmitter.addListener( updateWidth );

    // Controls the visibility of this node
    // no need to unlink since the chart is present for the lifetime of the sim
    visibleProperty.linkAttribute( this, 'visible' );

    // Add all the nodes
    this.addChild( rectangleBarometer );
    this.addChild( verticalLine );
    this.addChild( horizontalArrow );
    this.addChild( zeroLabel );
    this.addChild( label );

    this.updateWidth = updateWidth;
  }

  /**
   * Resets values to their original state
   */
  public reset(): void {
    this.updateWidth();
  }
}

leastSquaresRegression.register( 'SumOfSquaredResidualsChart', SumOfSquaredResidualsChart );