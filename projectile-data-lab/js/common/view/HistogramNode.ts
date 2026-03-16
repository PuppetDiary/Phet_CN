// Copyright 2023-2025, University of Colorado Boulder

/**
 * HistogramNode is the base class for displaying a Histogram in the Projectile Data Lab simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ChartCanvasNode from '../../../../bamboo/js/ChartCanvasNode.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import GridLineSet from '../../../../bamboo/js/GridLineSet.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import audioManager from '../../../../joist/js/audioManager.js';
import packageJSON from '../../../../joist/js/packageJSON.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import bullhornSolidShape from '../../../../sherpa/js/fontawesome-5/bullhornSolidShape.js';
import stopSolidShape from '../../../../sherpa/js/fontawesome-5/stopSolidShape.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import toggleSwitchLeft_mp3 from '../../../sounds/toggleSwitchLeft_mp3.js';
import toggleSwitchRight_mp3 from '../../../sounds/toggleSwitchRight_mp3.js';
import VSMField from '../../common-vsm/model/VSMField.js';
import Field from '../../common/model/Field.js';
import PDLConstants from '../../common/PDLConstants.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import SamplingField from '../../sampling/model/SamplingField.js';
import Histogram, { ZOOM_LEVELS } from '../model/Histogram.js';
import BinControlNode from './BinControlNode.js';
import HistogramCanvasPainter from './HistogramCanvasPainter.js';
import HistogramRepresentationIconNode from './HistogramRepresentationIconNode.js';
import PDLText from './PDLText.js';

type SelfOptions = EmptySelfOptions;
export type HistogramNodeOptions = SelfOptions & WithRequired<NodeOptions, 'tandem'>;

const toggleSwitchLeftSoundClip = new SoundClip( toggleSwitchLeft_mp3, { initialOutputLevel: 0.6 } );
soundManager.addSoundGenerator( toggleSwitchLeftSoundClip, { categoryName: 'user-interface' } );

const toggleSwitchRightSoundClip = new SoundClip( toggleSwitchRight_mp3, { initialOutputLevel: 0.6 } );
soundManager.addSoundGenerator( toggleSwitchRightSoundClip, { categoryName: 'user-interface' } );


const CHART_UI_MARGIN = 10;

export default class HistogramNode extends Node {

  protected readonly chartNode: Node;
  protected readonly chartTransform: ChartTransform;
  protected readonly chartClipLayer: Node;
  protected readonly chartBackground: ChartRectangle;

  protected constructor( fieldProperty: TReadOnlyProperty<Field>,
                         fields: Field[],
                         horizontalAxisLabelText: TReadOnlyProperty<string>,
                         histogram: Histogram,
                         histogramSoundEnabledProperty: TReadOnlyProperty<boolean>,
                         comboBoxParent: Node,
                         blockFillProperty: ColorProperty,
                         blockStrokeProperty: ColorProperty,
                         providedOptions: HistogramNodeOptions ) {
    super();

    const options = optionize<HistogramNodeOptions, SelfOptions, NodeOptions>()( {
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    this.chartTransform = new ChartTransform( {

      // Tuned to make the spacing between the right panel and the histogram match that of the left
      viewWidth: 561,
      viewHeight: 165,

      // In Projectile Data Lab, use the full span of the field for the histogram x-axis.
      // In Projectile Sampling Distributions, use a smaller range to make the histogram more readable.
      // See https://github.com/phetsims/projectile-data-lab/issues/304
      modelXRange: packageJSON.name === 'projectile-sampling-distributions' ? new Range( 20, 80 ) : new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ),
      modelYRange: new Range( 0, 25 )
    } );

    this.chartBackground = new ChartRectangle( this.chartTransform, {
      fill: 'white',
      stroke: 'black'
    } );

    // Show the frame in front, so it overlaps the bottom of the bars
    const chartFrame = new ChartRectangle( this.chartTransform, {
      fill: null,
      stroke: 'black'
    } );

    const histogramPainter = new HistogramCanvasPainter( histogram, this.chartTransform, histogram.binWidthProperty, histogram.representationProperty,
      blockFillProperty, blockStrokeProperty );

    // Grid lines along the y-axis (the lines themselves are horizontal). Changes based on the zoom level
    const verticalAxisGridLines = new GridLineSet( this.chartTransform, Orientation.VERTICAL, 5, {
      stroke: 'lightGray',
      lineWidth: 0.5
    } );

    const majorVerticalAxisGridLines = new GridLineSet( this.chartTransform, Orientation.VERTICAL, 10, {
      stroke: 'lightGray',
      lineWidth: 1.0
    } );

    // Grid lines along the x-axis (the lines themselves are vertical). Changes based on the bin width
    const horizontalAxisGridLines = new GridLineSet( this.chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: 'lightGray',
      lineWidth: 0.5
    } );
    const majorHorizontalAxisGridLines = new GridLineSet( this.chartTransform, Orientation.HORIZONTAL, 10, {
      stroke: 'lightGray',
      lineWidth: 1.0
    } );

    this.chartClipLayer = new Node();
    const chartCanvasNode = new ChartCanvasNode( this.chartTransform, [ histogramPainter ] );

    // Update the histogram when the sonified column changes
    histogram.histogramSonifier.histogramSonifierPhaseProperty.link( () => {
      chartCanvasNode.update();
    } );

    const chartClip = new Node( {
      clipArea: this.chartBackground.getShape(),
      children: [

        // grid lines
        verticalAxisGridLines,
        horizontalAxisGridLines,

        majorVerticalAxisGridLines,
        majorHorizontalAxisGridLines,

        this.chartClipLayer,

        // Some data
        chartCanvasNode
      ]
    } );

    const verticalTickMarkSet = new TickMarkSet( this.chartTransform, Orientation.VERTICAL, 5, { edge: 'min', extent: 8 } );
    const verticalTickLabelSet = new TickLabelSet( this.chartTransform, Orientation.VERTICAL, 5, {
      edge: 'min',
      createLabel: ( value: number ) => new Text( Utils.toFixed( value, 0 ), { fontSize: 12 } )
    } );
    this.chartNode = new Node( {
      children: [

        // Background
        this.chartBackground,

        // Clipped contents
        chartClip,

        // Draw the chart frame in front, so it occludes edge grid lines
        chartFrame,

        // Major ticks on the y-axis
        verticalTickLabelSet,

        verticalTickMarkSet,

        new TickMarkSet( this.chartTransform, Orientation.HORIZONTAL, PDLConstants.FIELD_LABEL_INCREMENT, { edge: 'min', extent: 8 } ),
        new TickLabelSet( this.chartTransform, Orientation.HORIZONTAL, PDLConstants.FIELD_LABEL_INCREMENT, {
          edge: 'min',
          createLabel: ( value: number ) => new Text( Utils.toFixed( value, 0 ), { fontSize: 12 } )
        } )
      ]
    } );

    histogram.binWidthProperty.link( binWidth => {
      horizontalAxisGridLines.setSpacing( binWidth );
      chartCanvasNode.update();
    } );

    this.chartTransform.changedEmitter.addListener( () => {
      chartCanvasNode.update();
    } );

    histogram.representationProperty.link( () => {
      chartCanvasNode.update();
    } );

    const zoomButtonGroup = new PlusMinusZoomButtonGroup( histogram.zoomProperty, {
      tandem: options.tandem.createTandem( 'zoomButtonGroup' ),
      orientation: 'vertical',
      centerY: this.chartTransform.viewHeight,
      spacing: 0,
      iconOptions: {
        scale: 1.2
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } );

    const verticalAxisLabel = new PDLText( ProjectileDataLabStrings.countStringProperty, {
      rotation: -Math.PI / 2,
      maxWidth: 86,
      font: PDLConstants.HISTOGRAM_AXIS_LABEL_FONT
    } );
    const horizontalAxisLabel = new PDLText( horizontalAxisLabelText, {
      maxWidth: 100,
      font: PDLConstants.HISTOGRAM_AXIS_LABEL_FONT
    } );

    this.children = [
      zoomButtonGroup,

      // Translate the chart node to the right far enough that it won't overlap with the zoom buttons even at the furthest zoomed out level
      this.chartNode.mutate( { left: zoomButtonGroup.right + CHART_UI_MARGIN } ),
      verticalAxisLabel,
      horizontalAxisLabel
    ];
    this.mutate( options );

    // Recompute and draw the entire histogram from scratch (not incrementally)
    const updateHistogram = ( cancelSonification: boolean ) => {

      // Avoid an inconsistent intermediate state while the phet-io state is being set
      if ( !isSettingPhetioStateProperty.value ) {

        const field = fieldProperty.value;
        if ( field instanceof VSMField ) {
          histogramPainter.setHistogramData( fieldProperty.value.landedProjectiles, field.selectedProjectileNumberProperty.value );
          histogram.histogramSonifier.setHistogramData( fieldProperty.value.landedProjectiles, cancelSonification );
        }
        else if ( field instanceof SamplingField ) {
          const samples = field.getHistogramData();
          const selectedSampleNumber = field.selectedSampleNumberProperty.value;
          histogramPainter.setHistogramData( samples, selectedSampleNumber );

          histogram.histogramSonifier.setHistogramData( samples, cancelSonification );
        }
        else {
          assert && assert( false, 'unhandled field type' );
        }

        chartCanvasNode.update();
      }
    };

    isSettingPhetioStateProperty.lazyLink( () => updateHistogram( true ) );

    // Similar to code in VSMScreenView that updates the angle tool node and speed tool node when the data changes.
    fields.forEach( field => {

      field.projectilesClearedEmitter.addListener( () => updateHistogram( true ) );

      // For VSM, redraw when the selected projectile changes
      if ( field instanceof VSMField ) {
        field.selectedProjectileProperty.link( () => updateHistogram( false ) );
        field.projectileLandedEmitter.addListener( () => updateHistogram( true ) );
      }
      else if ( field instanceof SamplingField ) {

        // Show a different selected brick
        field.selectedSampleNumberProperty.link( () => updateHistogram( false ) );

        // When we get a new mean, redraw the histogram
        field.numberOfCompletedSamplesProperty.link( () => updateHistogram( true ) );
        field.phaseProperty.link( () => updateHistogram( true ) );
        field.sampleMeanProperty.link( () => updateHistogram( false ) );
      }
    } );

    phetioStateSetEmitter.addListener( () => {
      updateHistogram( true );
    } );

    // When the field or bin width changes, redraw the histogram
    fieldProperty.link( () => updateHistogram( true ) );
    histogram.binWidthProperty.link( () => updateHistogram( true ) );
    histogram.zoomProperty.link( () => {

      const maxCount = ZOOM_LEVELS[ histogram.zoomProperty.value ].maxCount;

      this.chartTransform.setModelYRange( new Range( 0, maxCount ) );

      const tickSpacing = ZOOM_LEVELS[ histogram.zoomProperty.value ].maxCount / 5;

      verticalTickLabelSet.setSpacing( tickSpacing );
      verticalTickMarkSet.setSpacing( tickSpacing );
      majorVerticalAxisGridLines.setSpacing( tickSpacing );
      const spacing = ZOOM_LEVELS[ histogram.zoomProperty.value ].minorSpacing;
      if ( spacing !== null ) {
        verticalAxisGridLines.setSpacing( spacing );
      }
      verticalAxisGridLines.visible = spacing !== null;

      updateHistogram( false );
    } );

    const binControlNode = new BinControlNode( comboBoxParent, histogram.selectedBinWidthProperty, histogram.selectedTotalBinsProperty, {
      tandem: options.tandem.createTandem( 'binControlNode' ),
      leftTop: this.chartNode.leftBottom.plusXY( 15, CHART_UI_MARGIN ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
    this.addChild( binControlNode );

    const barBlockSwitch = new ABSwitch(
      histogram.representationProperty,
      'blocks', new HistogramRepresentationIconNode( blockFillProperty, blockStrokeProperty, 'blocks' ),
      'bars', new HistogramRepresentationIconNode( blockFillProperty, blockStrokeProperty, 'bars' ), {
        tandem: options.tandem.createTandem( 'barBlockSwitch' ),
        spacing: 8,
        toggleSwitchOptions: {
          maxWidth: 32,
          switchToLeftSoundPlayer: toggleSwitchLeftSoundClip,
          switchToRightSoundPlayer: toggleSwitchRightSoundClip
        },
        rightTop: this.chartNode.rightBottom.plusXY( -12, CHART_UI_MARGIN )
      } );
    this.addChild( barBlockSwitch );

    const soundIconNodeOptions = {
      fill: 'black',
      stroke: PhetColorScheme.BUTTON_YELLOW,
      lineWidth: 20
    };

    const histogramSoundIconToggleNode = new ToggleNode<boolean, Node>( new DerivedProperty( [
      histogram.histogramSonifier.histogramSonifierPhaseProperty
    ], histogramSonifierPhase => histogramSonifierPhase?.phaseName !== 'idlePhase' ), [ {
      value: false,
      createNode: () => new Path( bullhornSolidShape, soundIconNodeOptions )
    }, {
      value: true,
      createNode: () => new Path( stopSolidShape, soundIconNodeOptions )
    } ] );

    const toggleHistogramSoundButton = new RectangularPushButton( {
      content: histogramSoundIconToggleNode,
      soundPlayer: nullSoundPlayer,
      enabledProperty: DerivedProperty.and( [ histogramSoundEnabledProperty, audioManager.audioEnabledProperty ] ),
      size: new Dimension2( 34, 34 ),
      xMargin: 5,
      yMargin: 5,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      tandem: options.tandem.createTandem( 'toggleHistogramSoundButton' ),
      listener: () => {
        histogram.histogramSonifier.toggleSonification();
      }
    } );
    this.addChild( toggleHistogramSoundButton );

    ManualConstraint.create( this, [ this.chartNode, this.chartBackground, horizontalAxisLabel ], ( chartNodeProxy, chartBackgroundProxy, horizontalAxisLabelProxy ) => {
      horizontalAxisLabelProxy.centerX = chartBackgroundProxy.centerX;
      horizontalAxisLabelProxy.top = chartNodeProxy.bottom + CHART_UI_MARGIN;
    } );

    ManualConstraint.create( this, [ this.chartBackground, verticalAxisLabel, zoomButtonGroup ], ( chartBackgroundProxy, verticalAxisLabelProxy, zoomButtonGroupProxy ) => {
      verticalAxisLabelProxy.centerX = zoomButtonGroupProxy.centerX;
      verticalAxisLabelProxy.centerY = chartBackgroundProxy.centerY;
    } );

    ManualConstraint.create( this, [ this.chartBackground, toggleHistogramSoundButton ], ( chartBackgroundProxy, playHistogramSoundButtonProxy ) => {
      playHistogramSoundButtonProxy.right = chartBackgroundProxy.right - 5;
      playHistogramSoundButtonProxy.top = chartBackgroundProxy.top + 5;
    } );

    this.pdomOrder = [
      toggleHistogramSoundButton,
      zoomButtonGroup,
      binControlNode,
      barBlockSwitch
    ];
  }
}

projectileDataLab.register( 'HistogramNode', HistogramNode );