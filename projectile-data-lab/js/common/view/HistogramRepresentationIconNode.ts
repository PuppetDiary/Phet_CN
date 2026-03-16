// Copyright 2023-2025, University of Colorado Boulder

/**
 * HistogramRepresentationIconNode draws the icons to choose between 'blocks' or 'bars'.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import ChartCanvasNode from '../../../../bamboo/js/ChartCanvasNode.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import projectileDataLab from '../../projectileDataLab.js';
import { HistogramRepresentation } from '../model/HistogramRepresentation.js';
import HistogramCanvasPainter from './HistogramCanvasPainter.js';

export default class HistogramRepresentationIconNode extends Node {
  public constructor( blockFillProperty: ColorProperty, blockStrokeProperty: ColorProperty, histogramRepresentation: HistogramRepresentation ) {
    super( {
      pickable: true
    } );

    const chartTransform = new ChartTransform( {
      viewWidth: 23,
      viewHeight: 23,
      modelXRange: new Range( 0, 3 ),
      modelYRange: new Range( 0, 3 )
    } );
    const histogramPainter = new HistogramCanvasPainter(
      null,
      chartTransform,
      new NumberProperty( 1 ),
      new Property<HistogramRepresentation>( histogramRepresentation ),
      blockFillProperty, blockStrokeProperty
    );
    const data = [ { x: 0 }, { x: 0 }, { x: 1 }, { x: 1 }, { x: 1 }, { x: 2 } ];
    histogramPainter.setHistogramData( data, 2 );
    const chartCanvasNode = new ChartCanvasNode( chartTransform, [ histogramPainter ] );

    this.addChild( chartCanvasNode );

    const area = chartCanvasNode.localBounds.dilatedXY( 2, 10 );
    this.setTouchArea( area );
    this.setMouseArea( area );
  }
}

projectileDataLab.register( 'HistogramRepresentationIconNode', HistogramRepresentationIconNode );