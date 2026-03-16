// Copyright 2023-2025, University of Colorado Boulder

/**
 * The DataMeasuresOverlay shows the graphics for the visual representation of the average and standard deviation
 * of the landed projectiles. It has a mean indicator node, a mean line, and two standard deviation lines with arrows.
 * It is used in both the field overlay and histogram overlay components on the Measures screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import { HistogramSonifierPhase } from '../../common/model/HistogramSonifier.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants, { IS_CURRENTLY_AUTO_GENERATING_DATA_PROPERTY } from '../../common/PDLConstants.js';
import MeanIndicatorNode from '../../common/view/MeanIndicatorNode.js';
import { PDLPanel } from '../../common/view/PDLPanel.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

type SelfOptions = {
  context: 'histogram' | 'field' | 'icon';
};
export type DataMeasuresFieldOverlayOptions = SelfOptions & NodeOptions;

const MEAN_LINE_WIDTH = 1.5;
const SIDE_LINE_WIDTH = 1;

// The y position of the arrows is a factor of the total height of the overlay
const ARROW_Y_POSITION_FACTOR = 0.7;

// The minimum distance between the edge of the SD label text and the mean line
const MIN_SD_TEXT_MARGIN_X = 3;

const TEXT_MAX_WIDTH = 80;

export default class DataMeasuresOverlay extends Node {
  public constructor( modelViewTransform: ModelViewTransform2 | ChartTransform,
                      meanDistanceProperty: TReadOnlyProperty<number | null>,
                      standardDeviationDistanceProperty: TReadOnlyProperty<number | null>,
                      isMeanDisplayedProperty: TReadOnlyProperty<boolean>,
                      isStandardDeviationDisplayedProperty: TReadOnlyProperty<boolean>,
                      isValuesDisplayedProperty: TReadOnlyProperty<boolean>,
                      totalHeight: number,
                      histogramSonifierPhaseProperty: TReadOnlyProperty<HistogramSonifierPhase> | null,
                      providedOptions: DataMeasuresFieldOverlayOptions ) {

    const origin = modelViewTransform.modelToViewPosition( Vector2.ZERO );

    const isNonNullProperty = ( nullableProperty: TReadOnlyProperty<number | null> ) =>
      new DerivedProperty( [ nullableProperty ], nullable => nullable !== null );

    const isGreaterThanProperty = ( property: TReadOnlyProperty<number | null>, value: number ) =>
      new DerivedProperty( [ property ], propertyValue => propertyValue !== null && propertyValue > value );

    const isMeanIndicatorVisibleProperty = DerivedProperty.and( [
      isMeanDisplayedProperty,
      isNonNullProperty( meanDistanceProperty )
    ] );

    const isSDIndicatorVisibleProperty = DerivedProperty.and( [
      isStandardDeviationDisplayedProperty,
      isNonNullProperty( standardDeviationDistanceProperty )
    ] );

    // Only show the arrows if the SD is greater than zero to avoid floating arrowheads
    const isSDArrowsVisibleProperty = DerivedProperty.and( [
      isStandardDeviationDisplayedProperty,
      isGreaterThanProperty( standardDeviationDistanceProperty, 0 )
    ] );

    const meanIndicatorRadius = providedOptions.context === 'icon' ? 8 : 12;

    const meanIndicatorFillProperty = histogramSonifierPhaseProperty ? new DerivedProperty( [ histogramSonifierPhaseProperty, PDLColors.meanMarkerFillProperty ],
      ( histogramSonifierPhase, meanMarkerFill ) => {
        return histogramSonifierPhase.phaseName === 'highlightingMeanPhase' && histogramSonifierPhase.isMeanHighlighted ? '#ff49e1' : meanMarkerFill;
      } ) : PDLColors.meanMarkerFillProperty;

    const meanIndicator = new MeanIndicatorNode( meanIndicatorRadius, {
      visibleProperty: isMeanIndicatorVisibleProperty,
      fill: meanIndicatorFillProperty
    } );

    // On the field, the mean indicator is nudged down a bit so that it hides the bottom of the mean line
    const meanIndicatorOffsetY = providedOptions.context === 'field' ? 2 : 0;
    meanIndicator.bottom = origin.y + meanIndicatorOffsetY;

    const meanIndicatorHeight = meanIndicator.bounds.height;

    const arrowYFactor = providedOptions.context === 'field' ? ARROW_Y_POSITION_FACTOR : 0.5;

    const arrowY = origin.y - arrowYFactor * totalHeight;
    const ARROW_HEAD_WIDTH = 6;

    const meanLine = new Path( new Shape().moveTo( 0, origin.y ).lineTo( 0, origin.y - totalHeight ), {
      visibleProperty: DerivedProperty.and( [ isSDIndicatorVisibleProperty, isNonNullProperty( meanDistanceProperty ) ] ),
      stroke: 'black',
      lineWidth: MEAN_LINE_WIDTH
    } );

    const sideLineHeight = providedOptions.context === 'field' ? 0.78 * totalHeight : totalHeight;

    // Create a vertical line for the standard deviation visual representation
    const createVerticalLine = ( ) => {
      return new Path( new Shape().moveTo( 0, origin.y ).lineTo( 0, origin.y - sideLineHeight ), {
        visibleProperty: isSDIndicatorVisibleProperty,
        stroke: 'black',
        lineWidth: SIDE_LINE_WIDTH
      } );
    };

    const leftLine = createVerticalLine();
    const rightLine = createVerticalLine();

    const arrowOptions: ArrowNodeOptions = {
      visibleProperty: isSDArrowsVisibleProperty,
      doubleHead: true,
      isHeadDynamic: true,
      scaleTailToo: true,
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_WIDTH,
      fractionalHeadHeight: 0.3,
      tailWidth: 1,
      stroke: 'black'
    };

    const leftArrow = new ArrowNode( 0, arrowY, 1e-6, arrowY, arrowOptions );
    const rightArrow = new ArrowNode( 0, arrowY, 1e-6, arrowY, arrowOptions );

    const roundedStringProperty = ( nullableNumberProperty: TReadOnlyProperty<number | null> ) =>
      new DerivedProperty( [ nullableNumberProperty ], nullableNumber => {
        return nullableNumber === null ? '' : Utils.toFixed( nullableNumber, 2 );
      } );

    const meanLabel = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.meanMPatternStringProperty,
      { mean: roundedStringProperty( meanDistanceProperty ) } ), {
      font: PDLConstants.PRIMARY_FONT,
      maxWidth: TEXT_MAX_WIDTH
    } );

    const meanLabelPanel = new PDLPanel( meanLabel, {
      visibleProperty: DerivedProperty.and( [ isMeanIndicatorVisibleProperty, isValuesDisplayedProperty ] ),
      fill: 'white',
      stroke: null,
      cornerRadius: 4,
      xMargin: 3,
      yMargin: 0
    } );

    const sdPatternStringProperty = new PatternStringProperty( ProjectileDataLabStrings.standardDeviationMPatternStringProperty,
      { standardDeviation: roundedStringProperty( standardDeviationDistanceProperty ) } );

    const isSDValuesVisibleProperty = DerivedProperty.and( [
      isStandardDeviationDisplayedProperty,
      isValuesDisplayedProperty,
      isNonNullProperty( standardDeviationDistanceProperty )
    ] );

    const createSDLabel = () => {
      return new PDLText( sdPatternStringProperty, {
        visibleProperty: isSDValuesVisibleProperty,
        font: PDLConstants.PRIMARY_FONT,
        bottom: origin.y - sideLineHeight,
        maxWidth: TEXT_MAX_WIDTH
      } );
    };

    const sdLeftLabel = createSDLabel();
    const sdRightLabel = createSDLabel();

    Multilink.multilink( [ IS_CURRENTLY_AUTO_GENERATING_DATA_PROPERTY, meanDistanceProperty, standardDeviationDistanceProperty, sdPatternStringProperty, meanLabelPanel.boundsProperty ],
      ( isCurrentlyAutoGeneratingData, meanDistance, standardDeviationDistance ) => {

        // To improve performance, do not incrementally update the graphics every time a projectile is auto-generated
        if ( isCurrentlyAutoGeneratingData ) {
          return;
        }

        if ( meanDistance !== null ) {
          const meanX = modelViewTransform.modelToViewX( meanDistance );

          meanIndicator.x = meanX;
          meanLine.x = meanX;
          meanLabelPanel.centerX = meanX;
          meanLabelPanel.bottom = origin.y - meanIndicatorHeight - 1;

          if ( standardDeviationDistance !== null ) {
            const leftX = modelViewTransform.modelToViewX( meanDistance - standardDeviationDistance );
            const rightX = modelViewTransform.modelToViewX( meanDistance + standardDeviationDistance );

            leftLine.x = leftX;
            rightLine.x = rightX;

            if ( standardDeviationDistance > 0 ) {
              leftArrow.setTail( leftX + 0.5 * SIDE_LINE_WIDTH, leftArrow.tailY );
              leftArrow.setTip( meanX - 0.5 * MEAN_LINE_WIDTH, leftArrow.tipY );
              rightArrow.setTail( meanX + 0.5 * MEAN_LINE_WIDTH, rightArrow.tailY );
              rightArrow.setTip( rightX - 0.5 * SIDE_LINE_WIDTH, rightArrow.tipY );
            }

            sdLeftLabel.centerX = _.mean( [ leftX, meanX ] );
            sdRightLabel.centerX = _.mean( [ meanX, rightX ] );

            // Prevent the SD labels from overlapping the mean line
            if ( meanX - sdLeftLabel.right < MIN_SD_TEXT_MARGIN_X ) {
              sdLeftLabel.right = meanX - MIN_SD_TEXT_MARGIN_X;
            }
            if ( sdRightLabel.left - meanX < MIN_SD_TEXT_MARGIN_X ) {
              sdRightLabel.left = meanX + MIN_SD_TEXT_MARGIN_X;
            }
          }
        }
      } );

    const children: Node[] = [
      leftArrow,
      rightArrow,
      leftLine,
      rightLine,
      meanLine,
      meanIndicator
    ];

    if ( providedOptions.context === 'field' ) {
      children.push( meanLabelPanel, sdLeftLabel, sdRightLabel );
    }

    const options = optionize<DataMeasuresFieldOverlayOptions, SelfOptions, NodeOptions>()( {
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      children: children
    }, providedOptions );

    super( options );
  }
}

projectileDataLab.register( 'DataMeasuresOverlay', DataMeasuresOverlay );