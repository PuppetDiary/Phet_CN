// Copyright 2014-2025, University of Colorado Boulder

/**
 * A Scenery node that shows the Pearson correlation coefficient in an equation form
 *
 * @author Martin Veillette (Berea College)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import Graph from '../model/Graph.js';

// string
const pattern_0r_1value = '{0} {1}'; // This "half" of the equation is intentionally not i18nized

// constants
const MAX_LABEL_WIDTH = 120; // restrict width of labels for i18n

export default class CorrelationCoefficientAccordionBox extends AccordionBox {
  private readonly rightHandSideText: Text;
  private readonly hStrut: HStrut;
  private readonly leftHandSideText: Text;

  public constructor( private readonly graph: Graph, options?: AccordionBoxOptions ) {

    // Options for the Accordion Box
    options = combineOptions<AccordionBoxOptions>( {
      cornerRadius: 3,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 12,
        touchAreaYDilation: 12
      },
      titleYMargin: 10,
      titleNode: new RichText( LeastSquaresRegressionStrings.correlationCoefficientStringProperty, {
        replaceNewlines: true,
        align: 'center',
        font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
        maxWidth: MAX_LABEL_WIDTH
      } ),
      contentXMargin: 10,
      contentYMargin: 10,
      expandedDefaultValue: false
    }, options );

    const textOptions = { font: LeastSquaresRegressionConstants.PEARSON_COEFFICIENT_TEXT_FONT };

    const rEqualsStringProperty = new DerivedProperty( [ LeastSquaresRegressionStrings.symbol.rStringProperty ], rString => {
      return StringUtils.format( '{0} =', rString );
    } );

    // Create the left hand side of the equation (includes the equal sign)
    const leftHandSideText = new Text( rEqualsStringProperty, textOptions );

    // Create the right hand side of the equation
    const rightHandSideText = new Text( '', textOptions );

    // calculate the maximum width of the right hand side of the equation
    const rightHandSideMaxWidth = new Text( `${MathSymbols.PLUS} 0.00`, textOptions ).width;
    const hStrut = new HStrut( rightHandSideMaxWidth );

    // Create the equation
    const equation = new Node( {
      children: [
        leftHandSideText,
        hStrut,
        rightHandSideText
      ],
      maxWidth: MAX_LABEL_WIDTH
    } );

    // Create the panel that holds the equation
    const mutableEquationPanel = new Panel( equation, {
      fill: LeastSquaresRegressionConstants.GRAPH_BACKGROUND_COLOR,
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS,
      stroke: LeastSquaresRegressionConstants.SMALL_PANEL_STROKE,
      resize: true,
      xMargin: 10
    } );

    const content = new VBox( {
      children: [ new HStrut( 180 ), mutableEquationPanel ]
    } );

    super( content, options );

    this.rightHandSideText = rightHandSideText;

    this.hStrut = hStrut;
    this.leftHandSideText = leftHandSideText;
    this.rightHandSideText = rightHandSideText;
    this.leftHandSideText = leftHandSideText;
    this.update();

    rEqualsStringProperty.link( rString => this.update() );
  }

  public override reset(): void {
    this.update();
    super.reset();
  }

  /**
   * Updates the value of the right hand side of the equation.
   */
  public update(): void {
    let rValueString;

    // Check for the existence of the rValue
    if ( this.graph.isLinearFitDefined() ) {
      const rValue = this.graph.getPearsonCoefficientCorrelation();

      // if the rValue is zero and there are only two points on the graph, return null.  This is to avoid
      // a precision error for when the points are aligned horizontally and the denominator is non-zero
      if ( rValue === 0 ) {
        if ( this.graph.dataPointsOnGraph.length === 2 ) {
          rValueString = '';
        }
      }

      // getPearsonCoefficientCorrelation() will return null if NaN
      if ( rValue === null ) {
        rValueString = '';
      }
      else {
        const isNegative = ( rValue < 0 );
        const signString = isNegative ? MathSymbols.MINUS : MathSymbols.PLUS;
        rValueString = StringUtils.format( pattern_0r_1value, signString, Utils.toFixed( Math.abs( rValue ), 2 ) );
      }
    }
    else {

      // Set to null if the Pearson Coefficient does not exist
      rValueString = '';
    }

    // Update the text on the right Hand side of the equation
    this.rightHandSideText.string = rValueString;

    this.hStrut.left = this.leftHandSideText.right + 5;
    this.rightHandSideText.left = this.leftHandSideText.right + 5;
  }
}

leastSquaresRegression.register( 'CorrelationCoefficientAccordionBox', CorrelationCoefficientAccordionBox );