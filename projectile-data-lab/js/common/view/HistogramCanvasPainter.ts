// Copyright 2023-2025, University of Colorado Boulder

/**
 * Shows bars or blocks for histogram-related numerical data.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import CanvasPainter, { CanvasPainterOptions } from '../../../../bamboo/js/CanvasPainter.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import HistogramData from '../../common/model/HistogramData.js';
import projectileDataLab from '../../projectileDataLab.js';
import Histogram from '../model/Histogram.js';
import { HistogramRepresentation } from '../model/HistogramRepresentation.js';

type SelfOptions = EmptySelfOptions;
export type BarPlotOptions = SelfOptions & CanvasPainterOptions;

// The radius of the dot labelling the highlighted block in the 'blocks' representation
const DOT_RADIUS = 2.4;

export default class HistogramCanvasPainter extends CanvasPainter {

  private data: HistogramData[] = [];
  private selectedIndex: number | null = null;

  public constructor( private histogram: Histogram | null,
                      private readonly chartTransform: ChartTransform,
                      private readonly binWidthProperty: TReadOnlyProperty<number>,
                      private readonly histogramRepresentationProperty: TReadOnlyProperty<HistogramRepresentation>,
                      private readonly blockFillProperty: TReadOnlyProperty<Color>,
                      private readonly blockStrokeProperty: TReadOnlyProperty<Color>,
                      providedOptions?: BarPlotOptions ) {
    super( providedOptions );
  }

  /**
   * Sets the dataSet and redraws the plot. If instead the dataSet array is mutated, it is the client's responsibility
   * to call `update` or make sure `update` is called elsewhere (say, if the chart scrolls in that frame).
   */
  public setHistogramData( data: HistogramData[], selectedNumber: number | null ): void {
    this.data = data;
    if ( selectedNumber === null ) {
      this.selectedIndex = null;
    }
    else {
      this.selectedIndex = selectedNumber >= 1 ? selectedNumber - 1 : null;
    }
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {

    const isSonifiedBin = ( bin: number ) => {
      return !!( this.histogram &&
                 this.histogram.histogramSonifier.histogramSonifierPhaseProperty.value.phaseName === 'highlightingBinPhase' &&
                 this.histogram.histogramSonifier.histogramSonifierPhaseProperty.value.highlightedBin === bin );
    };

    const getFillColorForBin = ( bin: number ) => {
      return isSonifiedBin( bin ) ? '#ffb371' : this.blockFillProperty.value.toCSS();
    };

    const histogramRepresentation = this.histogramRepresentationProperty.value;
    context.save();

    context.fillStyle = this.blockFillProperty.value.toCSS();
    context.strokeStyle = this.blockStrokeProperty.value.toCSS();

    const lineWidth = Math.abs( this.chartTransform.modelToViewDeltaY( 0.15 ) );


    // Canvas cannot render a lineWidth < 1 (it rounds up to 1), so we scale the canvas to compensate
    const scaleFactor = 1 / lineWidth;
    context.scale( 1 / scaleFactor, 1 / scaleFactor );
    context.lineWidth = 1;

    const histogram = new Map<number, number>();
    const binWidth = this.binWidthProperty.value;

    const blockWidth = this.chartTransform.modelToViewDeltaX( this.binWidthProperty.value );
    const blockHeight = Math.abs( this.chartTransform.modelToViewDeltaY( 1 ) );

    let highlightDotX = null;
    let highlightDotY = null;

    for ( let i = 0; i < this.data.length; i++ ) {
      const projectile = this.data[ i ];
      const isHighlighted = i === this.selectedIndex;

      // Calculate the bin for this value by its lower bound
      const bin = Math.floor( projectile.x / binWidth ) * binWidth;

      // Update the count for this bin
      const binCount = ( histogram.get( bin ) || 0 ) + 1;
      histogram.set( bin, binCount );

      const x = this.chartTransform.modelToViewX( bin );
      const y = this.chartTransform.modelToViewY( binCount );

      if ( histogramRepresentation === 'blocks' ) {
        context.fillStyle = getFillColorForBin( bin );
        context.fillRect( x * scaleFactor, y * scaleFactor, blockWidth * scaleFactor, blockHeight * scaleFactor );
        context.strokeRect( x * scaleFactor, y * scaleFactor, blockWidth * scaleFactor, blockHeight * scaleFactor );
      }

      // If the highlighted data block is in the sonified bin, don't draw the dot
      if ( isHighlighted && !isSonifiedBin( bin ) ) {
        highlightDotX = x;
        highlightDotY = y;
      }
    }

    if ( histogramRepresentation === 'bars' ) {
      for ( const [ bin, count ] of histogram ) {

        context.fillStyle = getFillColorForBin( bin );

        const x = this.chartTransform.modelToViewX( bin );
        const y = this.chartTransform.modelToViewY( 0 );
        const height = this.chartTransform.modelToViewDeltaY( count );

        const h = Math.abs( height ) * scaleFactor;
        context.fillRect( x * scaleFactor, y * scaleFactor - h, blockWidth * scaleFactor, h );
        context.strokeRect( x * scaleFactor, y * scaleFactor - h, blockWidth * scaleFactor, h );
      }
    }
    else if ( highlightDotX !== null && highlightDotY !== null ) {

      // draw a white dot in the middle of the highlighted block, in front of the all the data blocks
      context.beginPath();
      context.arc( highlightDotX * scaleFactor + blockWidth * scaleFactor / 2, highlightDotY * scaleFactor + blockHeight * scaleFactor / 2, DOT_RADIUS * scaleFactor, 0, 2 * Math.PI );
      context.fillStyle = 'white';
      context.strokeStyle = this.blockFillProperty.value.toCSS();
      context.lineWidth = scaleFactor;
      context.fill();
      context.stroke();
    }

    context.restore();
  }
}

projectileDataLab.register( 'HistogramCanvasPainter', HistogramCanvasPainter );