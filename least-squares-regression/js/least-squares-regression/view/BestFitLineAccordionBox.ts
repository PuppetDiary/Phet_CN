// Copyright 2014-2025, University of Colorado Boulder

/**
 * Accordion Box Node that displays checkboxes associated with properties of Best Fit Line.
 * This Node also displays the Best Fit Line Equation and the Sum of Squares Barometer Chart.
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../../../scenery/js/SceneryConstants.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import Graph from '../model/Graph.js';
import EquationNode from './EquationNode.js';
import SumOfSquaredResidualsChart from './SumOfSquaredResidualsChart.js';

export default class BestFitLineAccordionBox extends AccordionBox {

  private readonly equationText: EquationNode;
  public readonly sumOfSquaredResidualsChart: SumOfSquaredResidualsChart;

  /**
   * @param graph - Model of the graph
   * @param dataPointsAddedEmitter - Emitter that signals when data points are added in bulk
   * @param providedOptions - Optional customization options
   */
  public constructor(
    private readonly graph: Graph,
    dataPointsAddedEmitter: Emitter,
    providedOptions?: AccordionBoxOptions
  ) {

    // Merge provided options with default options
    const options = combineOptions<AccordionBoxOptions>( {
      cornerRadius: 3,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 12,
        touchAreaYDilation: 12
      },
      titleNode: new Text( LeastSquaresRegressionStrings.bestFitLineStringProperty, {
        font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
        maxWidth: 120
      } ),
      titleXMargin: 0,
      contentXMargin: 10,
      contentYMargin: 10,
      expandedDefaultValue: false
    }, providedOptions );

    // Create the chart (barometer) displaying the sum of the squares
    const sumOfSquaredResidualsChart = new SumOfSquaredResidualsChart(
      graph,
      graph.getBestFitLineSumOfSquaredResiduals.bind( graph ),
      dataPointsAddedEmitter,
      LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.SUM_OF_SQUARES_COLOR,
      graph.bestFitLineSquaredResidualsVisibleProperty
    );

    // Create the 'Best Fit Line' equation
    // initial values set the spacing, the correct values for the slope and the intercept will be updated below
    const equationNode = new EquationNode( { mode: 'bestFitLine' } );
    equationNode.setEquationVisible( false );

    // Create a Panel to contain the Equation Node
    const equationPanel = new Panel( equationNode, {
      fill: 'white',
      stroke: LeastSquaresRegressionConstants.SMALL_PANEL_STROKE,
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS,
      resize: true // here
    } );

    // Text options for checkboxes
    const textOptions = {
      font: LeastSquaresRegressionConstants.CHECKBOX_TEXT_FONT,
      maxWidth: 140
    };

    // Create the checkboxes
    const lineCheckbox = new Checkbox(
      graph.bestFitLineVisibleProperty,
      new Text( LeastSquaresRegressionStrings.bestFitLineStringProperty, textOptions )
    );

    const VBOX_SPACING = 10;

    const residualsCheckbox = new Checkbox( graph.bestFitLineShowResidualsProperty, new Text( LeastSquaresRegressionStrings.residualsStringProperty, textOptions ) );
    const squaredResidualsCheckbox = new Checkbox( graph.bestFitLineShowSquaredResidualsProperty, new Text( LeastSquaresRegressionStrings.squaredResidualsStringProperty, textOptions ) );

    // Expand the touch Area
    lineCheckbox.touchArea = lineCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );
    residualsCheckbox.touchArea = residualsCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );
    squaredResidualsCheckbox.touchArea = squaredResidualsCheckbox.localBounds.dilatedXY( 8, VBOX_SPACING / 2 );

    // Update the control Panel upon a change of the status of the Best Fit Line Checkbox
    // No need to unlink, present for the lifetime of the sim
    const updateEquationNodeVisible = () => {

      const enabled = graph.bestFitLineVisibleProperty.value;

      // Set Equation to invisible if there is less than one point on the graph
      if ( graph.isLinearFitDefined() ) {
        equationNode.opacity = enabled ? 1 : 0;
      }
      equationPanel.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
      residualsCheckbox.enabled = enabled;
      squaredResidualsCheckbox.enabled = enabled;
    };

    graph.angleProperty.link( updateEquationNodeVisible );
    graph.interceptProperty.link( updateEquationNodeVisible );
    graph.bestFitLineVisibleProperty.link( updateEquationNodeVisible );

    const content = new VBox( {
      spacing: VBOX_SPACING,
      children: [
        lineCheckbox,
        new HBox( { children: [ new HStrut( 20 ), equationPanel ] } ),
        residualsCheckbox,
        squaredResidualsCheckbox,
        sumOfSquaredResidualsChart
      ],
      excludeInvisibleChildrenFromBounds: false,
      align: 'left'
    } );

    super( content, options );

    this.equationText = equationNode;
    this.sumOfSquaredResidualsChart = sumOfSquaredResidualsChart;

    // Update the Best Fit Line Equation initially
    this.updateBestFitLineEquation();
  }

  /**
   * Resets the control panel to its original state.
   */
  public override reset(): void {
    this.sumOfSquaredResidualsChart.reset();
    super.reset();
  }

  /**
   * Updates the text of the Best Fit Line Equation based on the current linear fit parameters.
   */
  public updateBestFitLineEquation(): void {
    if ( this.graph.isLinearFitDefined() ) {
      const linearFitParameters = this.graph.getLinearFit();
      this.equationText.setSlopeText( linearFitParameters.slope * this.graph.slopeFactor );
      this.equationText.setInterceptText( linearFitParameters.intercept * this.graph.interceptFactor + this.graph.interceptOffset );

      // Ensure the equation is visible if the Best Fit Line is enabled
      if ( this.graph.bestFitLineVisibleProperty.value ) {
        this.equationText.setEquationVisible( true );
      }
    }
    else {
      this.equationText.setEquationVisible( false );
    }
  }
}

leastSquaresRegression.register( 'BestFitLineAccordionBox', BestFitLineAccordionBox );