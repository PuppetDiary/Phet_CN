// Copyright 2014-2025, University of Colorado Boulder

/**
 * Scenery Node representing a Control Panel with check Boxes and Sliders that controls properties of My Line
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../../../scenery/js/SceneryConstants.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import VSlider, { VSliderOptions } from '../../../../sun/js/VSlider.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import Graph from '../model/Graph.js';
import EquationNode from './EquationNode.js';
import SumOfSquaredResidualsChart from './SumOfSquaredResidualsChart.js';

// constants
const SLIDER_OPTIONS: VSliderOptions = {
  trackSize: new Dimension2( 2, 190 ),
  thumbSize: new Dimension2( 30, 15 ),
  thumbTouchAreaXDilation: 8,
  majorTickLength: 18
};
const MAX_WIDTH = 120;

export default class MyLineControlPanel extends Panel {
  public readonly sumOfSquaredResiduals: SumOfSquaredResidualsChart;

  public constructor( graph: Graph, dataPointsAddedEmitter: Emitter, options: PanelOptions ) {

    // Create a mutable equation y = {1} x + {2} , the slope and intercept are updated later
    // max width determined empirically, and there are 6 elements that make up the equation node
    const equationCharacterMaxWidth = MAX_WIDTH / 6;
    const equationText = new EquationNode( { maxCharacterWidth: equationCharacterMaxWidth } );

    /**
     * Function that updates the value of the current slope (based on the angle of the line)
     */
    function updateTextSlope( angle: number ): void {
      const slope = graph.slope( angle );
      equationText.setSlopeText( slope * graph.slopeFactor );
    }

    /**
     * Function that updates the value of the intercept
     */
    function updateTextIntercept( intercept: number ): void {
      equationText.setInterceptText( intercept * graph.interceptFactor + graph.interceptOffset );
    }

    updateTextIntercept( 0 );
    updateTextSlope( 0 );

    // Create an immutable equation y = a x + b
    const blackOptions = {
      font: LeastSquaresRegressionConstants.TEXT_FONT,
      fill: 'black',
      maxWidth: equationCharacterMaxWidth
    };
    const boldOptions = {
      font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
      fill: LeastSquaresRegressionConstants.MY_LINE_COLOR.BASE_COLOR,
      maxWidth: equationCharacterMaxWidth
    };

    const yText = new Text( LeastSquaresRegressionStrings.symbol.yStringProperty, blackOptions ); // 'y'
    const equalText = new Text( '=', blackOptions ); // the '=' sign
    const aText = new Text( LeastSquaresRegressionStrings.aStringProperty, boldOptions ); // a number
    const xText = new Text( LeastSquaresRegressionStrings.symbol.xStringProperty, blackOptions ); // 'x'
    const signInterceptText = new Text( MathSymbols.PLUS, blackOptions );// '+'
    const bText = new Text( LeastSquaresRegressionStrings.bStringProperty, boldOptions );// a number

    // create the equation panel with white background
    const equationPanel = new Rectangle( {
      fill: 'white',
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS,
      stroke: LeastSquaresRegressionConstants.SMALL_PANEL_STROKE
    } );

    // Create two sliders: The aSlider controls the angle of the line and by proxy the slope, the bSlider controls the intercept
    const sliderInterceptRange = new Range( -1.5 * graph.bounds.maxY, 1.5 * graph.bounds.maxY );
    const maxSlope = 10; // determines the maximum slope (using the graph bounds as reference, i.e. the unit square)

    const aSlider = new VSlider( graph.angleProperty, new Range( -Math.atan( maxSlope ), Math.atan( maxSlope ) ), SLIDER_OPTIONS );
    aSlider.addMajorTick( 0 );
    const bSlider = new VSlider( graph.interceptProperty, sliderInterceptRange, SLIDER_OPTIONS );
    bSlider.addMajorTick( 0 );

    // Create label below the sliders
    const aSliderText = new Text( LeastSquaresRegressionStrings.aStringProperty, merge( { maxWidth: MAX_WIDTH }, boldOptions ) );
    const bSliderText = new Text( LeastSquaresRegressionStrings.bStringProperty, merge( { maxWidth: MAX_WIDTH }, boldOptions ) );

    // collect the immutable equation, the mutable equation and the sliders in one node
    const hStrut = new HStrut( 20 );
    const rightAlignedNode = new Node( {
      children: [
        aSlider,
        bSlider,

        aSliderText,
        bSliderText,

        equationPanel,

        equationText.yText,
        equationText.equalText,
        equationText.signSlopeText,
        equationText.valueSlopeText,
        equationText.xText,
        equationText.signInterceptText,
        equationText.valueInterceptText,

        yText,
        equalText,
        aText,
        xText,
        signInterceptText,
        bText,

        hStrut
      ]
    } );
    const VBOX_SPACING = 10;

    // Create three checkboxes
    const checkboxTextOptions = { font: LeastSquaresRegressionConstants.CHECKBOX_TEXT_FONT, maxWidth: 140 };
    const lineCheckbox = new Checkbox( graph.myLineVisibleProperty, new Text( LeastSquaresRegressionStrings.myLineStringProperty, checkboxTextOptions ) );
    const residualsCheckbox = new Checkbox( graph.myLineShowResidualsProperty, new Text( LeastSquaresRegressionStrings.residualsStringProperty, checkboxTextOptions ) );
    const squaredResidualsCheckbox = new Checkbox( graph.myLineShowSquaredResidualsProperty, new Text( LeastSquaresRegressionStrings.squaredResidualsStringProperty, checkboxTextOptions ) );

    // Expand the touch Area
    lineCheckbox.touchArea = lineCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );
    residualsCheckbox.touchArea = residualsCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );
    squaredResidualsCheckbox.touchArea = squaredResidualsCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );

    // Create the barometer chart for the sum of the squares
    const sumOfSquaredResiduals = new SumOfSquaredResidualsChart(
      graph,
      graph.getMyLineSumOfSquaredResiduals.bind( graph ),
      dataPointsAddedEmitter,
      LeastSquaresRegressionConstants.MY_LINE_COLOR.SUM_OF_SQUARES_COLOR,
      graph.myLineSquaredResidualsVisibleProperty
    );

    // assemble all the previous nodes in a vertical box
    const mainBox = new VBox( {
      spacing: VBOX_SPACING,
      children: [
        lineCheckbox,
        rightAlignedNode,
        residualsCheckbox,
        squaredResidualsCheckbox,
        sumOfSquaredResiduals
      ],
      align: 'left',
      excludeInvisibleChildrenFromBounds: false
    } );

    // layout the internal nodes of the right Aligned Node
    aSlider.centerX = 70;
    bSlider.centerX = 135;
    aSlider.top = 10;
    bSlider.top = 10;

    super( mainBox, options );

    // Dynamic layout of the equations.
    // Align in a grid with the "a" and "b" parts of the equation centered over the sliders, then flow the rest of the layout
    // around that. Accommodate dynamically sizing strings.
    // Cannot use GridBox or AlignBox because the slider horizontally centered (tick mark makes it lopsided)
    ManualConstraint.create( this, [

      aSlider,
      bSlider,

      aSliderText,
      bSliderText,

      equationText.yText,
      equationText.equalText,
      equationText.signSlopeText,
      equationText.valueSlopeText,
      equationText.xText,
      equationText.signInterceptText,
      equationText.valueInterceptText,

      yText,
      equalText,
      aText,
      xText,
      signInterceptText,
      bText,

      equationPanel
    ], (
      aSliderProxy,
      bSliderProxy,
      aSliderTextProxy,
      bSliderTextProxy,
      dynamicYTextProxy,
      dynamicEqualTextProxy,
      dynamicSignSlopeTextProxy,
      dynamicValueSlopeTextProxy,
      dynamicXTextProxy,
      dynamicSignInterceptTextProxy,
      dynamicValueInterceptTextProxy,
      staticYTextProxy,
      staticEqualTextProxy,
      staticATextProxy,
      staticXTextProxy,
      staticSignInterceptTextProxy,
      staticBTextProxy,
      equationPanelProxy
    ) => {

      aSliderTextProxy.top = aSliderProxy.bottom + 8;
      bSliderTextProxy.top = bSliderProxy.bottom + 8;
      aSliderTextProxy.centerX = aSliderProxy.x + 1;
      bSliderTextProxy.centerX = bSliderProxy.x + 1;

      dynamicValueSlopeTextProxy.centerX = aSliderProxy.x + 1;
      dynamicValueSlopeTextProxy.bottom = aSliderProxy.top - 35;

      dynamicSignSlopeTextProxy.right = dynamicValueSlopeTextProxy.left - 5;
      dynamicSignSlopeTextProxy.y = dynamicValueSlopeTextProxy.y;

      dynamicValueInterceptTextProxy.centerX = bSliderProxy.x + 1;
      dynamicValueInterceptTextProxy.bottom = bSliderProxy.top - 35;

      staticATextProxy.bottom = aSliderProxy.top - 5;
      staticATextProxy.centerX = aSliderProxy.x + 1;

      staticBTextProxy.bottom = bSliderProxy.top - 5;
      staticBTextProxy.centerX = bSliderProxy.x + 1;

      dynamicXTextProxy.left = dynamicValueSlopeTextProxy.right + 3;
      dynamicXTextProxy.y = dynamicValueSlopeTextProxy.y;

      dynamicSignInterceptTextProxy.centerX = ( dynamicXTextProxy.right + dynamicValueInterceptTextProxy.left ) / 2;
      dynamicSignInterceptTextProxy.y = dynamicValueInterceptTextProxy.y;

      dynamicEqualTextProxy.right = dynamicSignSlopeTextProxy.left - 5;
      dynamicEqualTextProxy.y = dynamicSignSlopeTextProxy.y;

      dynamicYTextProxy.right = dynamicEqualTextProxy.left - 5;
      dynamicYTextProxy.y = dynamicValueSlopeTextProxy.y;

      staticEqualTextProxy.centerX = dynamicEqualTextProxy.centerX;
      staticEqualTextProxy.y = staticBTextProxy.y;

      staticYTextProxy.right = dynamicEqualTextProxy.left - 5;
      staticYTextProxy.y = staticBTextProxy.y;

      staticXTextProxy.centerX = dynamicXTextProxy.centerX;
      staticXTextProxy.y = staticATextProxy.y;

      staticSignInterceptTextProxy.centerX = dynamicSignInterceptTextProxy.centerX;
      staticSignInterceptTextProxy.y = staticBTextProxy.y;

      const top = Math.min(
        dynamicYTextProxy.top,
        dynamicEqualTextProxy.top,
        dynamicSignSlopeTextProxy.top,
        dynamicValueSlopeTextProxy.top,
        dynamicXTextProxy.top,
        dynamicSignInterceptTextProxy.top,
        dynamicValueInterceptTextProxy.top
      );

      const bottom = Math.min(
        dynamicYTextProxy.bottom,
        dynamicEqualTextProxy.bottom,
        dynamicSignSlopeTextProxy.bottom,
        dynamicValueSlopeTextProxy.bottom,
        dynamicXTextProxy.bottom,
        dynamicSignInterceptTextProxy.bottom,
        dynamicValueInterceptTextProxy.bottom
      );

      // CAUTION: Setting the width and the height outside of the proxy
      equationPanel.setRectWidth( dynamicValueInterceptTextProxy.right - dynamicYTextProxy.left + 10 );
      equationPanel.setRectHeight( Math.abs( bottom - top ) + 10 );

      equationPanelProxy.left = dynamicYTextProxy.left - 5;
      equationPanelProxy.top = top - 5;
    } );

    // Trigger the opacity/non-opacity when checking the myLine checkbox
    graph.myLineVisibleProperty.link( enabled => {
      equationText.setEquationVisible( enabled );
      aSlider.pickable = enabled; // enable/disable slider
      bSlider.pickable = enabled;// enable/disable slider
      residualsCheckbox.enabled = enabled;
      squaredResidualsCheckbox.enabled = enabled;
      rightAlignedNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
    } );

    // update the text (slope) of the equation when the aSlider is moving
    graph.angleProperty.link( angle => {
      updateTextSlope( angle );
    } );

    // update the text (intercept) of the equation when the bSlider is moving
    graph.interceptProperty.link( intercept => {
      updateTextIntercept( intercept );
    } );

    // Trigger an update after all the points have been added in bulk to the model
    // Update the equation text
    dataPointsAddedEmitter.addListener( () => {
      updateTextSlope( graph.angleProperty.value );
      updateTextIntercept( graph.interceptProperty.value );
    } );

    this.sumOfSquaredResiduals = sumOfSquaredResiduals;

    graph.myLineVisibleProperty.link( enabled => {

      // Hide but keep the same bounds
      equationText.yText.opacity = enabled ? 1 : 0;
      equationText.equalText.opacity = enabled ? 1 : 0;
      equationText.signSlopeText.opacity = enabled ? 1 : 0;
      equationText.valueSlopeText.opacity = enabled ? 1 : 0;
      equationText.xText.opacity = enabled ? 1 : 0;
      equationText.signInterceptText.opacity = enabled ? 1 : 0;
      equationText.valueInterceptText.opacity = enabled ? 1 : 0;
    } );
  }

  public reset(): void {
    this.sumOfSquaredResiduals.reset();
  }
}

leastSquaresRegression.register( 'MyLineControlPanel', MyLineControlPanel );