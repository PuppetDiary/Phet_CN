// Copyright 2014-2025, University of Colorado Boulder

/**
 * Base type for graphs, displays a 2D grid and axes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Martin Veillette (Berea College)
 */

import TProperty from '../../../../axon/js/TProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataSet from '../model/DataSet.js';

//----------------------------------------------------------------------------------------
// constants
//----------------------------------------------------------------------------------------

// background
const GRID_BACKGROUND_FILL = 'white';
const GRID_BACKGROUND_LINE_WIDTH = 1; // for the border of graph
const GRID_BACKGROUND_STROKE = 'gray';

// grid
const MAJOR_GRID_LINE_WIDTH = 1;
const MAJOR_GRID_LINE_COLOR = LeastSquaresRegressionConstants.MAJOR_GRID_STROKE_COLOR;
const MINOR_GRID_LINE_WIDTH = 1;
const MINOR_GRID_LINE_COLOR = LeastSquaresRegressionConstants.MINOR_GRID_STROKE_COLOR;

// axes
const AXIS_COLOR = 'black';
const AXIS_EXTENT = 0.0; // how far the line extends past the min/max ticks, in model coordinates

// labels
const AXIS_LABEL_FONT = LeastSquaresRegressionConstants.TEXT_BOLD_FONT;
const AXIS_LABEL_COLOR = 'black'; // space between end of axis and label
const MAX_LABEL_WIDTH = 500; // i18n restriction, empirically determined

// ticks
const MINOR_TICK_LENGTH = 3; // how far a minor tick extends from the axis
const MINOR_TICK_LINE_WIDTH = 1;
const MINOR_TICK_COLOR = 'black';
const MAJOR_TICK_LENGTH = 6; // how far a major tick extends from the axis
const MAJOR_TICK_LINE_WIDTH = 1;
const MAJOR_TICK_COLOR = 'black';
const MAJOR_TICK_FONT = LeastSquaresRegressionConstants.MAJOR_TICK_FONT;
const TICK_LABEL_SPACING = 2;
const MINUS_SIGN_WIDTH = new Text( MathSymbols.MINUS, { font: MAJOR_TICK_FONT } ).width;

const SMALL_EPSILON = 0.0000001; // for equalEpsilon check

export default class GraphAxesNode extends Node {
  /**
   * Function responsible for laying out the ticks of the graph, the axis titles and the grid
   * @param dataSet
   * @param modelViewTransform
   * @param showGridProperty
   */
  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2, showGridProperty: TProperty<boolean> ) {

    const gridNode = new GridNode( dataSet, modelViewTransform );
    const showGridPropertyObserver = ( visible: boolean ) => {
      gridNode.visible = visible;
    };

    showGridProperty.link( showGridPropertyObserver );

    const xAxisNode = new XAxisNode( dataSet, modelViewTransform );
    const yAxisNode = new YAxisNode( dataSet, modelViewTransform );
    const xLabelNode = new XLabelNode( dataSet, modelViewTransform );
    super();

    const yLabelNode = new YLabelNode( dataSet, this, yAxisNode, modelViewTransform );
    this.children = [
      new BackgroundNode( dataSet, modelViewTransform ),
      gridNode,
      xAxisNode,
      yAxisNode,
      xLabelNode,
      yLabelNode
    ];

    this.disposeEmitter.addListener( () => {
      showGridProperty.unlink( showGridPropertyObserver );
      xAxisNode.dispose();
      yAxisNode.dispose();
      xLabelNode.dispose();
      yLabelNode.dispose();
      gridNode.dispose();
    } );
  }
}

leastSquaresRegression.register( 'GraphAxesNode', GraphAxesNode );

//----------------------------------------------------------------------------------------
// major tick with label, orientation is vertical or horizontal
//----------------------------------------------------------------------------------------

class MajorTickNode extends Node {
  // Tick is placed at (x,y) and is either vertical or horizontal.
  public constructor( x: number, y: number, value: string, isVertical: boolean ) {

    super();

    // tick line
    const tickLineNode = new Path( isVertical ?
                                   Shape.lineSegment( x, y - MAJOR_TICK_LENGTH, x, y + MAJOR_TICK_LENGTH ) :
                                   Shape.lineSegment( x - MAJOR_TICK_LENGTH, y, x + MAJOR_TICK_LENGTH, y ), {
      stroke: MAJOR_TICK_COLOR,
      lineWidth: MAJOR_TICK_LINE_WIDTH
    } );
    this.addChild( tickLineNode );

    // tick label
    const tickLabelNode = new Text( value, { font: MAJOR_TICK_FONT, fill: MAJOR_TICK_COLOR } );
    this.addChild( tickLabelNode );

    // label position
    if ( isVertical ) {
      // center label under the line, compensate for minus sign
      const signXOffset = ( parseFloat( value ) < 0 ) ? -( MINUS_SIGN_WIDTH / 2 ) : 0;
      tickLabelNode.left = tickLineNode.centerX - ( tickLabelNode.width / 2 ) + signXOffset;
      tickLabelNode.top = tickLineNode.bottom + TICK_LABEL_SPACING;
    }
    else {
      // center label to left of line
      tickLabelNode.right = tickLineNode.left - TICK_LABEL_SPACING;
      tickLabelNode.centerY = tickLineNode.centerY;
    }
  }
}

//----------------------------------------------------------------------------------------
// minor tick mark, no label, orientation is vertical or horizontal
//----------------------------------------------------------------------------------------

class MinorTickNode extends Path {
  // Tick is placed at (x,y) and is either vertical or horizontal
  public constructor( x: number, y: number, isVertical: boolean ) {
    super( isVertical ?
           Shape.lineSegment( x, y - MINOR_TICK_LENGTH, x, y + MINOR_TICK_LENGTH ) :
           Shape.lineSegment( x - MINOR_TICK_LENGTH, y, x + MINOR_TICK_LENGTH, y ), {
      lineWidth: MINOR_TICK_LINE_WIDTH,
      stroke: MINOR_TICK_COLOR
    } );
  }
}

//--------------
// Tick Spacing for major and minor ticks
//--------------
function tickSpacing( range: Range ): {
  majorTickSpacing: number;
  minorTickSpacing: number;
  minorTicksPerMajor: number;
  tickStartPosition: number;
  tickStopPosition: number;
  numberOfTicks: number;
  decimalPlaces: number;
} {
  const width = range.max - range.min;
  const logOfWidth = Math.log( width ) / Math.LN10; // polyfill for Math.log10(width)
  const exponent = Math.floor( logOfWidth ); // width = mantissa*10^exponent
  const mantissa = Math.pow( 10, logOfWidth - exponent );// mantissa  ranges from 1 to 10;

  let majorBaseMultiple;
  let minorTicksPerMajor;

  // on a graph there should be minimum of 4 major ticks and a maximum of 8.
  // the numbers for the mantissa were chosen empirically
  if ( mantissa >= 6.5 ) {
    majorBaseMultiple = 2;
    minorTicksPerMajor = 4;
  }
  else if ( mantissa >= 3.2 ) {
    majorBaseMultiple = 1;
    minorTicksPerMajor = 5;
  }
  else if ( mantissa >= 1.55 ) {
    majorBaseMultiple = 0.5;
    minorTicksPerMajor = 5;
  }
  else {
    majorBaseMultiple = 0.2;
    minorTicksPerMajor = 4;
  }

  const majorTickSpacing = majorBaseMultiple * Math.pow( 10, exponent ); // separation between two major ticks
  const minorTickSpacing = majorBaseMultiple * Math.pow( 10, exponent ) / minorTicksPerMajor; // separation between two minor ticks
  const tickStartPosition = Math.ceil( range.min / minorTickSpacing ) * minorTickSpacing; // {number} position of the first tick
  const tickStopPosition = Math.floor( range.max / minorTickSpacing ) * minorTickSpacing; // {number} position of the last tick
  const numberOfTicks = ( tickStopPosition - tickStartPosition ) / minorTickSpacing + 1; // number of ticks
  const decimalPlaces = Utils.roundSymmetric( majorTickSpacing > 1 ? 0 : -1 * Math.log( majorTickSpacing ) / Math.LN10 + 1 ); // the precision of ticks (for text purposes)

  return {
    majorTickSpacing: majorTickSpacing,
    minorTickSpacing: minorTickSpacing,
    minorTicksPerMajor: minorTicksPerMajor,
    tickStartPosition: tickStartPosition,
    tickStopPosition: tickStopPosition,
    numberOfTicks: numberOfTicks,
    decimalPlaces: decimalPlaces
  };
}

//----------------------------------------------------------------------------------------
// x-axis (horizontal)
//----------------------------------------------------------------------------------------

class XAxisNode extends Node {
  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2 ) {

    super();

    // horizontal line
    const tailPosition = new Vector2( modelViewTransform.modelToViewX( dataSet.xRange.min - AXIS_EXTENT ), modelViewTransform.modelToViewY( dataSet.yRange.min ) );
    const tipPosition = new Vector2( modelViewTransform.modelToViewX( dataSet.xRange.max + AXIS_EXTENT ), modelViewTransform.modelToViewY( dataSet.yRange.min ) );
    const lineNode = new Line( tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y, {
      fill: AXIS_COLOR,
      stroke: 'black'
    } );
    this.addChild( lineNode );

    // ticks
    const tickSeparation = tickSpacing( dataSet.xRange );
    const numberOfTicks = tickSeparation.numberOfTicks;

    for ( let i = 0; i < numberOfTicks; i++ ) {
      const modelX = tickSeparation.tickStartPosition + tickSeparation.minorTickSpacing * i;
      const x = modelViewTransform.modelToViewX( modelX );
      const y = modelViewTransform.modelToViewY( dataSet.yRange.min );

      if ( Math.abs( modelX / tickSeparation.minorTickSpacing ) % ( tickSeparation.minorTicksPerMajor ) < SMALL_EPSILON ) {
        // major tick
        this.addChild( new MajorTickNode( x, y, Utils.toFixed( modelX, tickSeparation.decimalPlaces ), true ) );
      }
      else {
        // minor tick
        this.addChild( new MinorTickNode( x, y, true ) );
      }
    }
  }
}

//----------------------------------------------------------------------------------------
//   y-axis (vertical)
//----------------------------------------------------------------------------------------

class YAxisNode extends Node {
  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2 ) {

    super();

    // vertical line
    const tailPosition = new Vector2( modelViewTransform.modelToViewX( dataSet.xRange.min ), modelViewTransform.modelToViewY( dataSet.yRange.min - AXIS_EXTENT ) );
    const tipPosition = new Vector2( modelViewTransform.modelToViewX( dataSet.xRange.min ), modelViewTransform.modelToViewY( dataSet.yRange.max + AXIS_EXTENT ) );
    const lineNode = new Line( tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y, {
      fill: AXIS_COLOR,
      stroke: 'black'
    } );
    this.addChild( lineNode );

    // ticks
    const tickSeparation = tickSpacing( dataSet.yRange );
    const numberOfTicks = tickSeparation.numberOfTicks;

    for ( let i = 0; i < numberOfTicks; i++ ) {
      const modelY = tickSeparation.tickStartPosition + tickSeparation.minorTickSpacing * i;

      const x = modelViewTransform.modelToViewX( dataSet.xRange.min );
      const y = modelViewTransform.modelToViewY( modelY );
      if ( Math.abs( modelY / tickSeparation.minorTickSpacing ) % ( tickSeparation.minorTicksPerMajor ) < SMALL_EPSILON ) {
        // major tick
        this.addChild( new MajorTickNode( x, y, Utils.toFixed( modelY, tickSeparation.decimalPlaces ), false ) );
      }
      else {
        // minor tick
        this.addChild( new MinorTickNode( x, y, false ) );
      }
    }

  }
}

//----------------------------------------------------------------------------------------
//  X label
//----------------------------------------------------------------------------------------

class XLabelNode extends Node {

  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2, options?: NodeOptions ) {

    super( options );

    const centerX = modelViewTransform.modelToViewX( ( dataSet.xRange.min + dataSet.xRange.max ) / 2 );
    const bottom = modelViewTransform.modelToViewY( dataSet.yRange.min );
    const xLabelNode = new Text( dataSet.xAxisTitle, {
      font: AXIS_LABEL_FONT,
      fill: AXIS_LABEL_COLOR,
      maxWidth: MAX_LABEL_WIDTH
    } );
    this.addChild( xLabelNode );

    ManualConstraint.create( this, [ xLabelNode ], xLabelNodeProxy => {
      xLabelNodeProxy.centerX = centerX;
      xLabelNodeProxy.bottom = bottom + 50;
    } );

    this.disposeEmitter.addListener( () => {
      xLabelNode.dispose();
    } );
  }
}

//----------------------------------------------------------------------------------------
//  Y label
//----------------------------------------------------------------------------------------

class YLabelNode extends Node {

  public constructor( dataSet: DataSet, layoutParent: Node, yAxisNode: Node, modelViewTransform: ModelViewTransform2 ) {

    super();

    const centerY = modelViewTransform.modelToViewY( ( dataSet.yRange.min + dataSet.yRange.max ) / 2 );
    const textNode = new Text( dataSet.yAxisTitle, {
      font: AXIS_LABEL_FONT,
      fill: AXIS_LABEL_COLOR,
      maxWidth: MAX_LABEL_WIDTH,
      rotation: -Math.PI / 2
    } );
    this.addChild( textNode );

    ManualConstraint.create( layoutParent, [ this, textNode, yAxisNode ], ( thisProxy, yLabelNodeProxy, yAxisNodeProxy ) => {
      yLabelNodeProxy.centerY = centerY;
      yLabelNodeProxy.right = yAxisNode.left - 7;
    } );

    this.disposeEmitter.addListener( () => {
      textNode.dispose();
    } );
  }
}

//----------------------------------------------------------------------------------------
//  2D Background
//----------------------------------------------------------------------------------------

class BackgroundNode extends Node {
  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2 ) {
    super();

    const backgroundNode = new Rectangle(
      modelViewTransform.modelToViewX( dataSet.xRange.min ),
      modelViewTransform.modelToViewY( dataSet.yRange.max ),
      modelViewTransform.modelToViewDeltaX( dataSet.xRange.getLength() ),
      modelViewTransform.modelToViewDeltaY( -dataSet.yRange.getLength() ),
      { fill: GRID_BACKGROUND_FILL, lineWidth: GRID_BACKGROUND_LINE_WIDTH, stroke: GRID_BACKGROUND_STROKE } );
    this.addChild( backgroundNode );
  }
}

//----------------------------------------------------------------------------------------
//   2D grid
//----------------------------------------------------------------------------------------

class GridNode extends Node {

  public constructor( dataSet: DataSet, modelViewTransform: ModelViewTransform2 ) {
    super();

    // horizontal grid lines, one line for each unit of grid spacing
    const horizontalGridLinesNode = new Node();
    this.addChild( horizontalGridLinesNode );
    const tickYSeparation = tickSpacing( dataSet.yRange );
    const numberOfHorizontalGridLines = tickYSeparation.numberOfTicks;

    const majorGridLinesShape = new Shape();
    const minorGridLinesShape = new Shape();

    const minX = dataSet.xRange.min;
    const maxX = dataSet.xRange.max;
    for ( let i = 0; i < numberOfHorizontalGridLines; i++ ) {
      const modelY = tickYSeparation.tickStartPosition + tickYSeparation.minorTickSpacing * i;
      if ( modelY !== dataSet.yRange.min ) { // skip origin, x-axis will live here
        const yOffset = modelY;
        const isMajorX = Math.abs( modelY / tickYSeparation.minorTickSpacing ) % ( tickYSeparation.minorTicksPerMajor ) < SMALL_EPSILON;
        if ( isMajorX ) {
          majorGridLinesShape.moveTo( minX, yOffset )
            .horizontalLineTo( maxX );
        }
        else {
          minorGridLinesShape.moveTo( minX, yOffset )
            .horizontalLineTo( maxX );
        }
      }
    }

    // vertical grid lines, one line for each unit of grid spacing
    const verticalGridLinesNode = new Node();
    this.addChild( verticalGridLinesNode );
    const tickXSeparation = tickSpacing( dataSet.xRange );
    const numberOfVerticalGridLines = tickXSeparation.numberOfTicks;
    const minY = dataSet.yRange.max; // yes, swap min and max
    const maxY = dataSet.yRange.min;
    for ( let j = 0; j < numberOfVerticalGridLines; j++ ) {
      const modelX = tickXSeparation.tickStartPosition + tickXSeparation.minorTickSpacing * j;
      if ( modelX !== dataSet.xRange.min ) { // skip origin, y-axis will live here
        const xOffset = modelX;
        const isMajorY = Math.abs( modelX / tickXSeparation.minorTickSpacing ) % ( tickXSeparation.minorTicksPerMajor ) < SMALL_EPSILON;
        if ( isMajorY ) {
          majorGridLinesShape.moveTo( xOffset, minY )
            .verticalLineTo( maxY );
        }
        else {
          minorGridLinesShape.moveTo( xOffset, minY )
            .verticalLineTo( maxY );
        }
      }
    }

    const majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
      lineWidth: MAJOR_GRID_LINE_WIDTH,
      stroke: MAJOR_GRID_LINE_COLOR
    } );
    const minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
      lineWidth: MINOR_GRID_LINE_WIDTH,
      stroke: MINOR_GRID_LINE_COLOR
    } );

    this.addChild( majorGridLinesPath );
    this.addChild( minorGridLinesPath );
  }
}