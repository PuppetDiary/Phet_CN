// Copyright 2023-2025, University of Colorado Boulder

/**
 * The measures histogram node is a histogram node that also shows the mean and standard deviation of the data.
 * It is used in the Measures screen in the Projectile Data Lab simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import VSMHistogramNode from '../../common-vsm/view/VSMHistogramNode.js';
import Field from '../../common/model/Field.js';
import Histogram from '../../common/model/Histogram.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLPreferences from '../../common/PDLPreferences.js';
import { HistogramNodeOptions } from '../../common/view/HistogramNode.js';
import { PDLPanel } from '../../common/view/PDLPanel.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import IntervalTool from '../model/IntervalTool.js';
import MeasuresField from '../model/MeasuresField.js';
import DataMeasuresOverlay from './DataMeasuresOverlay.js';

type SelfOptions = EmptySelfOptions;
type MeasuresHistogramNodeOptions = SelfOptions & WithRequired<HistogramNodeOptions, 'tandem'>;

export default class MeasuresHistogramNode extends VSMHistogramNode {

  public constructor( fieldProperty: TReadOnlyProperty<MeasuresField>,
                      fields: Field[],
                      totalProjectileCountProperty: TReadOnlyProperty<number>,
                      numberOfLandedProjectilesProperty: TReadOnlyProperty<number>,
                      histogram: Histogram,
                      horizontalAxisLabelText: TReadOnlyProperty<string>,
                      isMeanVisibleProperty: TReadOnlyProperty<boolean>,
                      isStandardDeviationVisibleProperty: TReadOnlyProperty<boolean>,
                      isValuesVisibleProperty: TReadOnlyProperty<boolean>,
                      meanDistanceProperty: TReadOnlyProperty<number | null>,
                      standardDeviationProperty: TReadOnlyProperty<number | null>,
                      standardErrorProperty: TReadOnlyProperty<number | null>,
                      intervalTool: IntervalTool,
                      intervalToolVisibleProperty: TReadOnlyProperty<boolean>,
                      comboBoxParent: Node,
                      options: MeasuresHistogramNodeOptions ) {
    super(
      fieldProperty,
      fields,
      totalProjectileCountProperty,
      numberOfLandedProjectilesProperty,
      horizontalAxisLabelText,
      histogram,
      comboBoxParent,
      PDLColors.histogramDataFillProperty,
      PDLColors.histogramDataStrokeProperty,
      options );

    const noDataLabel = new PDLText( ProjectileDataLabStrings.noDataStringProperty );

    const roundedStringProperty = ( nullableNumberProperty: TReadOnlyProperty<number | null> ) =>
      new DerivedProperty( [ nullableNumberProperty ], nullableNumber => {
        return nullableNumber === null ? '' : Utils.toFixed( nullableNumber, 2 );
      } );

    const isStandardDeviationNonNullProperty = new DerivedProperty( [ standardDeviationProperty ], standardDeviation => standardDeviation !== null );

    // Create a pattern string property that uses meanXBarEqualsValueMPatternStringProperty if PDLPreferences.showStandardErrorProperty is true, otherwise use meanEqualsValueMPatternStringProperty
    const meanPatternStringProperty = DerivedProperty.deriveAny( [
        PDLPreferences.showStandardErrorProperty, ProjectileDataLabStrings.meanXBarEqualsValueMPatternStringProperty, ProjectileDataLabStrings.meanEqualsValueMPatternStringProperty ],
      () => {
        return PDLPreferences.showStandardErrorProperty.value ? ProjectileDataLabStrings.meanXBarEqualsValueMPatternStringProperty.value : ProjectileDataLabStrings.meanEqualsValueMPatternStringProperty.value;
      } );

    const dataLabels = [
      new PDLText( new PatternStringProperty( meanPatternStringProperty,
        { value: roundedStringProperty( meanDistanceProperty ) } ), {
        font: PDLConstants.HISTOGRAM_PANEL_FONT
      } ),
      new PDLText( new PatternStringProperty( ProjectileDataLabStrings.standardDeviationEqualsValueMPatternStringProperty,
        { value: roundedStringProperty( standardDeviationProperty ) } ), {
        font: PDLConstants.HISTOGRAM_PANEL_FONT,
        visibleProperty: isStandardDeviationNonNullProperty
      } ),
      new PDLText( new PatternStringProperty( ProjectileDataLabStrings.standardErrorOfXBarEqualsValueMPatternStringProperty,
        { value: roundedStringProperty( standardErrorProperty ) } ), {
        font: PDLConstants.HISTOGRAM_PANEL_FONT,
        visibleProperty: DerivedProperty.and( [ isStandardDeviationNonNullProperty, PDLPreferences.showStandardErrorProperty ] )
      } )
    ];

    const textVBox = new VBox( {

      // Prevent from overlapping with the majority of the data in ?stringTest=long
      maxWidth: 250,
      align: 'left',
      spacing: 2.5,

      // Children are specified in a link() below
      children: []
    } );

    const valuesChartOverlayTandem = options.tandem.createTandem( 'valuesChartOverlay' );

    const showValuesChartOverlayProperty = new BooleanProperty( true, {
      tandem: valuesChartOverlayTandem.createTandem( 'showValuesChartOverlayProperty' ),
      phetioDocumentation: 'An additional gate that controls the visibility of the valuesChartOverlay. For the valuesChartOverlay to be displayed, this Property and the isValuesVisibleProperty must both be true.',
      phetioFeatured: true
    } );

    // const parent = new Node();

    const valuesChartOverlay = new PDLPanel( textVBox, {
      visibleProperty: DerivedProperty.and( [ isValuesVisibleProperty, showValuesChartOverlayProperty ] ),
      fill: 'white',
      cornerRadius: 5,
      tandem: valuesChartOverlayTandem
    } );

    const dataMeasuresChartOverlay = new DataMeasuresOverlay(
      this.chartTransform,
      meanDistanceProperty,
      standardDeviationProperty,
      isMeanVisibleProperty,
      isStandardDeviationVisibleProperty,

      // The numbers on the data measures overlay are not shown in the histogram
      new BooleanProperty( false ),

      this.chartTransform.viewHeight,
      histogram.histogramSonifier.histogramSonifierPhaseProperty, {
        context: 'histogram',
        tandem: options.tandem.createTandem( 'dataMeasuresChartOverlay' )
      } );

    // Put the text panel in front of the data measures overlay so that the text is not obscured by the overlay
    this.chartNode.addChild( dataMeasuresChartOverlay );
    this.chartNode.addChild( valuesChartOverlay );

    const intervalToolHighlight = new Rectangle( 0, 0, 0, 0, {
      fill: PDLColors.histogramIntervalToolFillProperty,
      visibleProperty: intervalToolVisibleProperty
    } );
    this.chartClipLayer.addChild( intervalToolHighlight );
    intervalToolHighlight.moveToBack();
    const updateIntervalToolHighlight = () => {
      const x1 = this.chartTransform.modelToViewX( intervalTool.edge1Property.value );
      const x2 = this.chartTransform.modelToViewX( intervalTool.edge2Property.value );
      const min = Math.min( x1, x2 );
      const max = Math.max( x1, x2 );
      intervalToolHighlight.setRect( min, 0, max - min, this.chartTransform.viewHeight );
    };
    updateIntervalToolHighlight();
    intervalTool.edge1Property.link( updateIntervalToolHighlight );
    intervalTool.edge2Property.link( updateIntervalToolHighlight );

    meanDistanceProperty.link( mean => {
      textVBox.setChildren( mean === null ? [ noDataLabel ] : dataLabels );
    } );

    ManualConstraint.create( this, [ valuesChartOverlay, this.chartBackground ], ( textPanelProxy, chartBackgroundProxy ) => {
      textPanelProxy.left = chartBackgroundProxy.left + PDLConstants.HISTOGRAM_PANEL_MARGIN;
      textPanelProxy.top = chartBackgroundProxy.top + PDLConstants.HISTOGRAM_PANEL_MARGIN;
    } );
  }
}

projectileDataLab.register( 'MeasuresHistogramNode', MeasuresHistogramNode );