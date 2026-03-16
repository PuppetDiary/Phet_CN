// Copyright 2019-2025, University of Colorado Boulder

/**
 * view for the "Temperature" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ColorizedReadoutNode from '../../../../number-line-common/js/common/view/ColorizedReadoutNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import GridBox from '../../../../scenery/js/layout/nodes/GridBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import TemperatureSceneModel from '../model/TemperatureSceneModel.js';
import MonthsComboBox from './MonthsComboBox.js';
import SceneView from './SceneView.js';
import TemperatureMapNode from './TemperatureMapNode.js';
import TemperaturePointControllerNode from './TemperaturePointControllerNode.js';

// constants
const NUMBER_LINE_LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );
const UNITS_SELECTOR_LABEL_FONT = new PhetFont( { size: 18 } );
const UNITS_SELECTOR_TEXT_OPTIONS = {
  font: UNITS_SELECTOR_LABEL_FONT,
  maxWidth: 40 // empirically determined to work with other aspects of the layout
};
const NUMBER_LINE_PANEL_WIDTH = 200; // empirically determined
const NUMBER_LINE_PANEL_MARGINS = 10;
const TEMPERATURE_UNITS_SELECTOR_WIDTH = 53;
const PANEL_CONTENT_SPACING = 5;
const TITLE_TO_SELECTOR_SPACING = 10;
const CELSIUS_NUMBER_LINE_INDEX = TemperatureSceneModel.CELSIUS_NUMBER_LINE_INDEX;
const FAHRENHEIT_NUMBER_LINE_INDEX = TemperatureSceneModel.FAHRENHEIT_NUMBER_LINE_INDEX;

const temperatureAmountCelsiusStringProperty = NumberLineIntegersStrings.temperatureAmountCelsiusStringProperty;
const temperatureAmountFahrenheitStringProperty = NumberLineIntegersStrings.temperatureAmountFahrenheitStringProperty;
const temperatureLabelCelsiusStringProperty = NumberLineIntegersStrings.temperatureLabelCelsiusStringProperty;
const temperatureLabelFahrenheitStringProperty = NumberLineIntegersStrings.temperatureLabelFahrenheitStringProperty;
const temperatureMapCaptionStringProperty = NumberLineIntegersStrings.temperatureMapCaptionStringProperty;
const temperatureStringProperty = NumberLineIntegersStrings.temperatureStringProperty;

class TemperatureSceneView extends SceneView {

  /**
   * @param {TemperatureSceneModel} sceneModel
   * @param {Bounds2} layoutBounds
   * @public
   */
  constructor( sceneModel, layoutBounds ) {

    super( sceneModel, layoutBounds, {

      // options common to both number lines
      commonNumberLineNodeOptions: {
        tickMarkLabelPositionWhenVertical: 'left',
        pointNodeOptions: {
          usePointColorForLabelText: false,
          colorizeLabelBackground: true
        }
      },

      // options unique to the individual number lines, must be in correct order
      uniqueNumberLineNodeOptionsList: [
        { numericalLabelTemplate: temperatureAmountFahrenheitStringProperty },
        { numericalLabelTemplate: temperatureAmountCelsiusStringProperty }
      ],

      // Don't have the super constructor add the number line nodes - that will be done below.
      automaticallyAddNLNodes: false
    } );

    // Put the number lines on their own layer so that their position can be easily adjusted.
    const numberLinesRootNode = new Node();
    const fahrenheitNumberLineNode = this.numberLineNodes[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const celsiusNumberLineNode = this.numberLineNodes[ CELSIUS_NUMBER_LINE_INDEX ];
    numberLinesRootNode.addChild( fahrenheitNumberLineNode );
    numberLinesRootNode.addChild( celsiusNumberLineNode );

    // Get local references to other items needed to manage the two separate number lines.
    const fahrenheitNumberLine = sceneModel.numberLines[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const fahrenheitComparisonStatementAccordionBox = this.comparisonStatementAccordionBoxes[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const celsiusNumberLine = sceneModel.numberLines[ CELSIUS_NUMBER_LINE_INDEX ];
    const celsiusComparisonStatementAccordionBox = this.comparisonStatementAccordionBoxes[ CELSIUS_NUMBER_LINE_INDEX ];

    // node where the contents of the number line panel will be placed
    const numberLinePanelContent = new Node();
    numberLinePanelContent.addChild( numberLinesRootNode );

    // Make sure that the same operator is being used in both the celsius and fahrenheit comparison statements.
    celsiusComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.link( selectedOperator => {
      fahrenheitComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.set( selectedOperator );
    } );
    fahrenheitComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.link( selectedOperator => {
      celsiusComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.set( selectedOperator );
    } );

    // @private
    this.monthsComboBox = new MonthsComboBox( sceneModel.monthProperty, this.controlsLayer, {
      left: this.checkboxGroup.left,
      top: sceneModel.mapBounds.minY,
      buttonTouchAreaXDilation: 7,
      buttonTouchAreaYDilation: 7
    } );
    this.controlsLayer.addChild( this.monthsComboBox );

    // @private - map of the world that depicts temperature data
    this.temperatureMap = new TemperatureMapNode( sceneModel.monthProperty, sceneModel.mapBounds );
    this.temperatureMap.center = sceneModel.mapBounds.center;
    this.scenesLayer.addChild( this.temperatureMap );

    // Add the node that represents the box that will hold the thermometers.
    const thermometerBox = Rectangle.bounds( sceneModel.thermometerBoxBounds, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 6
    } );
    this.scenesLayer.addChild( thermometerBox );

    // caption for the temperature map
    const temperatureMapCaption = new RichText( temperatureMapCaptionStringProperty, {
      align: 'center',
      font: new PhetFont( 10 ),
      fill: '#707070',
      maxWidth: sceneModel.mapBounds.width - 200, // empirically determined
      maxHeight: 60
    } );

    ManualConstraint.create( this, [ temperatureMapCaption, this.temperatureMap ], ( captionProxy, mapProxy ) => {
      captionProxy.centerX = mapProxy.centerX;
      captionProxy.top = mapProxy.bottom + 7; // a little bit under the map
    } );
    this.scenesLayer.addChild( temperatureMapCaption );

    // radio button group for selecting the temperature units
    const temperatureUnitsSelector = new VerticalAquaRadioButtonGroup(
      sceneModel.temperatureUnitsProperty,
      [
        {
          value: NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT,
          createNode: () => new Text( temperatureLabelFahrenheitStringProperty, UNITS_SELECTOR_TEXT_OPTIONS )
        },
        {
          value: NLIConstants.TEMPERATURE_UNITS.CELSIUS,
          createNode: () => new Text( temperatureLabelCelsiusStringProperty, UNITS_SELECTOR_TEXT_OPTIONS )
        }
      ],
      {
        // Limit the width to half the panel width to handle long labels from translations and string tests.
        maxWidth: TEMPERATURE_UNITS_SELECTOR_WIDTH,
        layoutOptions: {
          xAlign: 'right',
          xStretch: true,
          yAlign: 'top',
          verticalSpan: 2
        }
      }
    );

    // title for the panel where the number line will appear
    const numberLinePanelTitle = new Text( temperatureStringProperty, {
      font: NUMBER_LINE_LABEL_FONT,
      maxWidth: NUMBER_LINE_PANEL_WIDTH - TEMPERATURE_UNITS_SELECTOR_WIDTH - TITLE_TO_SELECTOR_SPACING -
                2 * NUMBER_LINE_PANEL_MARGINS
    } );

    const titleHBox = new HBox( {
      children: [ numberLinePanelTitle ],
      align: 'top',
      justify: 'center',
      layoutOptions: {
        minContentWidth: NUMBER_LINE_PANEL_WIDTH - TEMPERATURE_UNITS_SELECTOR_WIDTH - PANEL_CONTENT_SPACING - ( 2 * NUMBER_LINE_PANEL_MARGINS ),
        stretch: true
      }
    } );

    // Manage the label texts for each thermometer.
    const celsiusLabelsLayer = new Node();
    const fahrenheitLabelsLayer = new Node();
    const onAddedNumberLinePoint = ( numberLine, labelsLayer, addedNumberLinePoint ) => {

      // Create the textual label.
      const labelNode = new ColorizedReadoutNode(
        addedNumberLinePoint.controller.label,
        addedNumberLinePoint.colorProperty,
        {
          textOptions: {
            font: new PhetFont( 16 ),
            maxWidth: 20 // empirically determined to prevent layout problems with long and RTL strings
          }
        }
      );
      labelsLayer.addChild( labelNode );

      const numberLinePointListener = () => {
        labelNode.leftCenter = addedNumberLinePoint.getPositionInModelSpace().plus( new Vector2( 15, 0 ) );
      };
      addedNumberLinePoint.valueProperty.link( numberLinePointListener );

      const dragStateChangeHandler = dragging => {
        if ( dragging ) {
          labelNode.moveToFront();
        }
      };
      addedNumberLinePoint.isDraggingProperty.link( dragStateChangeHandler );

      const removalListener = removedNumberLinePoint => {
        if ( removedNumberLinePoint !== addedNumberLinePoint ) {
          return;
        }
        numberLine.residentPoints.removeItemRemovedListener( removalListener );
        labelsLayer.removeChild( labelNode );
        labelNode.dispose();
        addedNumberLinePoint.valueProperty.unlink( numberLinePointListener );
      };
      numberLine.residentPoints.addItemRemovedListener( removalListener );
    };

    celsiusNumberLine.residentPoints.addItemAddedListener( addedPoint => {
      onAddedNumberLinePoint( celsiusNumberLine, celsiusLabelsLayer, addedPoint );
    } );
    fahrenheitNumberLine.residentPoints.addItemAddedListener( addedPoint => {
      onAddedNumberLinePoint( fahrenheitNumberLine, fahrenheitLabelsLayer, addedPoint );
    } );

    numberLinesRootNode.addChild( celsiusLabelsLayer );
    numberLinesRootNode.addChild( fahrenheitLabelsLayer );

    const gridBox = new GridBox( {
      columns: [ [ titleHBox, numberLinesRootNode ], [ temperatureUnitsSelector ] ],
      spacing: PANEL_CONTENT_SPACING,
      resize: false
    } );

    const numberLinePanel = new Panel(
      gridBox,
      {
        fill: 'lightgray',
        stroke: 'transparent',
        resize: false,
        yMargin: NUMBER_LINE_PANEL_MARGINS,
        xMargin: NUMBER_LINE_PANEL_MARGINS,
        centerX: this.temperatureMap.left / 2, // centered between left edge of scene and left edge of map
        centerY: this.layoutBounds.minY + this.layoutBounds.maxY / 2, // centered vertically in the layout bounds
        minWidth: NUMBER_LINE_PANEL_WIDTH,
        maxWidth: NUMBER_LINE_PANEL_WIDTH
      }
    );
    this.numberLinesLayer.addChild( numberLinePanel );

    Multilink.multilink(
      [ sceneModel.temperatureUnitsProperty, sceneModel.showNumberLineProperty ],
      ( temperatureUnits, showNumberLine ) => {
        celsiusNumberLineNode.visible = temperatureUnits === NLIConstants.TEMPERATURE_UNITS.CELSIUS;
        celsiusComparisonStatementAccordionBox.visible = celsiusNumberLineNode.visible;
        celsiusLabelsLayer.visible = celsiusNumberLineNode.visible;
        fahrenheitNumberLineNode.visible = temperatureUnits === NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT;
        fahrenheitComparisonStatementAccordionBox.visible = fahrenheitNumberLineNode.visible;
        fahrenheitLabelsLayer.visible = fahrenheitNumberLineNode.visible;
        numberLinePanel.visible = showNumberLine;
      }
    );

    this.scenesLayer.addChild( new Node( {
      children: sceneModel.permanentPointControllers.map(
        pointController => new TemperaturePointControllerNode(
          pointController,
          sceneModel.numberLineAbsoluteValueIndicatorsVisibleProperty,
          sceneModel.temperatureUnitsProperty
        )
      )
    } ) );
  }
}

numberLineIntegers.register( 'TemperatureSceneView', TemperatureSceneView );
export default TemperatureSceneView;