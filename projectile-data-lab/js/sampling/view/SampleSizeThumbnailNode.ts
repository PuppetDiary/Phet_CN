// Copyright 2023-2025, University of Colorado Boulder

/**
 * SampleSizeThumbnailNode shows a smaller, zoomed-in depiction of the histogram. These are shown to the right of the large
 * histogram, and are designed to make it easy to compare the widths of sample means for different n=? sample sizes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ChartCanvasNode from '../../../../bamboo/js/ChartCanvasNode.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import GridLineSet from '../../../../bamboo/js/GridLineSet.js';
import Range from '../../../../dot/js/Range.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import { ZOOM_LEVELS } from '../../common/model/Histogram.js';
import { HistogramRepresentation } from '../../common/model/HistogramRepresentation.js';
import PDLConstants from '../../common/PDLConstants.js';
import HistogramCanvasPainter from '../../common/view/HistogramCanvasPainter.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import SamplingField from '../model/SamplingField.js';

type SelfOptions = EmptySelfOptions;
type SampleSizeThumbnailNodeOptions = SelfOptions & WithRequired<NodeOptions, 'tandem'>;

export default class SampleSizeThumbnailNode extends Node {
  public constructor( thumbnailSampleSize: number,
                      fieldProperty: TReadOnlyProperty<SamplingField>,
                      fields: SamplingField[],
                      meanLaunchSpeedProperty: TReadOnlyProperty<number>,
                      standardDeviationSpeedProperty: TReadOnlyProperty<number>,
                      standardDeviationAngleProperty: TReadOnlyProperty<number>,
                      binWidthProperty: TReadOnlyProperty<number>,
                      histogramRepresentationProperty: TReadOnlyProperty<HistogramRepresentation>,
                      blockFillProperty: TReadOnlyProperty<Color>,
                      blockStrokeProperty: TReadOnlyProperty<Color>,
                      zoomLevelProperty: NumberProperty,
                      providedOptions: SampleSizeThumbnailNodeOptions ) {
    super( providedOptions );

    const chartTransform = new ChartTransform( {
      viewWidth: 160,
      viewHeight: 51,
      modelXRange: new Range( 0, 100 ),
      modelYRange: new Range( 0, 10 )
    } );

    // Horizontally zoom in on the thumbnails, centering on the average output for the mystery launcher
    // Each launcher has a different average output, so we need to adjust the range for the thumbnail histogram based on the mystery launcher

    Multilink.multilink( [ binWidthProperty, meanLaunchSpeedProperty, standardDeviationSpeedProperty, standardDeviationAngleProperty ],
      ( binWidth, meanLaunchSpeed, standardDeviationSpeed, standardDeviationAngle ) => {

        const meanRange = Math.pow( meanLaunchSpeed, 2 ) / PDLConstants.FREEFALL_ACCELERATION * Math.sin( 2 * 30 * Math.PI / 180 );

        const standardDeviationRange = SampleSizeThumbnailNode.calculateRangeStdDev(
          meanLaunchSpeed,
          standardDeviationSpeed,
          30,
          standardDeviationAngle
        );

        // To ensure the data fits in the thumbnail within a healthy margin, we multiply the standard deviation by this amount
        // to set the domain of the axis.
        const SCALE_STANDARD_DEVIATION = 3;

        // Show at least one bin on either side so the bars don't go offscreen too much. This is most helpful when the bins
        // are very large.
        const addedPadding = binWidth;
        const range = new Range( meanRange - SCALE_STANDARD_DEVIATION * standardDeviationRange - addedPadding, meanRange + SCALE_STANDARD_DEVIATION * standardDeviationRange + addedPadding );

        chartTransform.setModelXRange( range );
      } );

    const chartBackground = new ChartRectangle( chartTransform, {
      fill: 'white',
      stroke: 'black'
    } );

    // A stroke that has the same lineWidth as the selected stroke, but is transparent, in order that the chart spacing
    // remains the same and the charts don't move when the selection changes
    const chartSpacingRectangle = new ChartRectangle( chartTransform, {
      fill: null,
      stroke: new Color( 0, 0, 0 ).withAlpha( 0 ),
      lineWidth: 2
    } );

    // Show the frame in front, so it overlaps the bottom of the bars
    const chartFrame = new ChartRectangle( chartTransform, {
      fill: null
    } );

    fieldProperty.link( field => {
      chartFrame.lineWidth = field.sampleSize === thumbnailSampleSize ? 2 : 1;
      chartFrame.stroke = field.sampleSize === thumbnailSampleSize ? 'black' : '#989898';
    } );

    const histogramPainter = new HistogramCanvasPainter(
      null, chartTransform, binWidthProperty, histogramRepresentationProperty,
      blockFillProperty, blockStrokeProperty );

    // Changes based on the zoom level
    const verticalGridLines = new GridLineSet( chartTransform, Orientation.VERTICAL, 10, {
      stroke: 'lightGray',
      lineWidth: 0.8
    } );

    // Changes based on the bin width
    const horizontalGridLines = new GridLineSet( chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: 'lightGray',
      lineWidth: 0.8
    } );

    const chartCanvasNode = new ChartCanvasNode( chartTransform, [ histogramPainter ] );
    const chartClip = new Node( {
      clipArea: chartBackground.getShape(),
      children: [

        // Minor grid lines
        verticalGridLines,
        horizontalGridLines,

        // Some data
        chartCanvasNode
      ]
    } );

    const chartNode = new Node( {
      children: [

        // Background
        chartBackground,

        // Clipped contents
        chartClip,

        chartSpacingRectangle,

        // Outline
        chartFrame
      ]
    } );

    binWidthProperty.link( binWidth => {

      // In the thumbnail, show Half as many grid lines as in the main histogram, so multiply the bin width by 2
      horizontalGridLines.setSpacing( binWidth * 2 );
      chartCanvasNode.update();
    } );

    chartTransform.changedEmitter.addListener( () => chartCanvasNode.update() );
    histogramRepresentationProperty.link( () => chartCanvasNode.update() );

    const labelText = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.nEqualsSampleSizePatternStringProperty, {
      sampleSize: thumbnailSampleSize
    } ), {
      maxWidth: 80
    } );
    this.children = [ chartNode, labelText ];
    labelText.leftTop = chartNode.leftTop.plusXY( 4, 1 );

    // Recompute and draw the entire histogram from scratch (not incrementally)
    const updateHistogram = () => {

      // Avoid an inconsistent intermediate state while the phet-io state is being set
      if ( !isSettingPhetioStateProperty.value ) {

        // Find the field that matches the thumbnail sample size and the mystery launcher
        const histogramData = fields.find( field =>
          field.sampleSize === thumbnailSampleSize &&
          field.launcherProperty.value === fieldProperty.value.launcherProperty.value
        )!.getHistogramData();
        histogramPainter.setHistogramData( histogramData, null );

        chartCanvasNode.update();
      }
    };

    isSettingPhetioStateProperty.lazyLink( updateHistogram );

    // Similar to code in VSMScreenView that updates the angle tool node and speed tool node when the data changes.
    fields.forEach( field => {

      field.projectilesClearedEmitter.addListener( () => updateHistogram() );
      field.selectedSampleNumberProperty.link( () => updateHistogram() );
      field.numberOfCompletedSamplesProperty.link( () => updateHistogram() );
      field.phaseProperty.link( () => updateHistogram() );
    } );

    phetioStateSetEmitter.addListener( () => {
      updateHistogram();
    } );

    // When the field or bin width changes, redraw the histogram
    fieldProperty.link( () => updateHistogram() );
    binWidthProperty.link( () => updateHistogram() );
    zoomLevelProperty.link( () => {
      const maxCount = ZOOM_LEVELS[ zoomLevelProperty.value ].maxCount;
      chartTransform.setModelYRange( new Range( 0, maxCount ) );
      const thumbnailSpacing = ZOOM_LEVELS[ zoomLevelProperty.value ].maxCount / ZOOM_LEVELS[ zoomLevelProperty.value ].numberOfThumbnailGridLines;

      if ( thumbnailSpacing !== null ) {

        // In the thumbnail, show Half as many grid lines as in the main histogram, so multiply the tick spacing by 2
        verticalGridLines.setSpacing( thumbnailSpacing );
      }
      verticalGridLines.visible = thumbnailSpacing !== null;

      updateHistogram();
    } );
  }

  /**
   * Calculates the standard deviation of the projectile's range based on the propagation of errors from the launch
   * speed and angle, both of which are assumed to follow Gaussian distributions. The function takes into account the
   * mean and standard deviation of both the launch speed and angle, converts angles from degrees to radians, computes
   * partial derivatives of the range equation with respect to both speed and angle at their mean values, and then
   * calculates the contribution of each variable to the total variance of the projectile's range.
   *
   * @param meanSpeed - The mean speed of the projectile (in meters per second).
   * @param stdDevSpeed - The standard deviation of the speed (in meters per second).
   * @param meanAngle - The mean launch angle of the projectile (in degrees).
   * @param stdDevAngle - The standard deviation of the launch angle (in degrees).
   * @returns The estimated standard deviation of the range of the projectile, accounting for
   *                   uncertainties in both speed and angle.
   *
   * Mathematical details:
   * - Range equation used: R = (v^2 / g) * sin(2 * theta)
   * - Propagation of error formula: sqrt((∂R/∂v * σ_v)² + (∂R/∂θ * σ_θ)²)
   * - Partial derivatives:
   *   ∂R/∂v = (2 * v / g) * sin(2 * theta)
   *   ∂R/∂θ = (2 * v² / g) * cos(2 * theta), where θ is in radians
   */
  private static calculateRangeStdDev( meanSpeed: number, stdDevSpeed: number, meanAngle: number, stdDevAngle: number ): number {
    const radiansMeanAngle = meanAngle * Math.PI / 180; // convert mean angle from degrees to radians
    const radiansStdDevAngle = stdDevAngle * Math.PI / 180; // convert standard deviation angle from degrees to radians

    // Partial derivatives evaluated at mean values
    const partialV = ( 2 * meanSpeed / PDLConstants.FREEFALL_ACCELERATION ) * Math.sin( 2 * radiansMeanAngle );
    const partialTheta = ( 2 * meanSpeed ** 2 / PDLConstants.FREEFALL_ACCELERATION ) * Math.cos( 2 * radiansMeanAngle );

    // Variance components
    const varV = partialV ** 2 * stdDevSpeed ** 2;
    const varTheta = partialTheta ** 2 * radiansStdDevAngle ** 2;

    // Total variance of the range
    const totalVariance = varV + varTheta;

    // Standard deviation of the range
    const rangeStdDev = Math.sqrt( totalVariance );

    return rangeStdDev;
  }
}


projectileDataLab.register( 'SampleSizeThumbnailNode', SampleSizeThumbnailNode );