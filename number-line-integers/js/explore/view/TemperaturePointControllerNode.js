// Copyright 2019-2025, University of Colorado Boulder

/**
 * A scenery node that is used to control point positions in the temperature scene based on the temperature of the map
 * below this node.  It looks like a thermometer with a triangular pointer next to it.
 *
 * @author Arnab Purkayastha
 * @author Saurabh Totey
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Range from '../../../../dot/js/Range.js';
import ColorizedReadoutNode from '../../../../number-line-common/js/common/view/ColorizedReadoutNode.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TemperatureAndColorSensorNode from '../../../../scenery-phet/js/TemperatureAndColorSensorNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

// constants
const TOUCH_DILATION = 5;
const TEMPERATURE_RANGE = new Range( -85, 104 ); // determined based on the temperature data that was used

const negativeTemperatureAmountStringProperty = NumberLineIntegersStrings.negativeTemperatureAmountStringProperty;
const positiveTemperatureAmountStringProperty = NumberLineIntegersStrings.positiveTemperatureAmountStringProperty;
const zeroTemperatureAmountStringProperty = NumberLineIntegersStrings.zeroTemperatureAmountStringProperty;

class TemperaturePointControllerNode extends PointControllerNode {

  /**
   * @param {TemperaturePointController} pointController
   * @param {BooleanProperty} showAbsoluteValuesProperty
   * @param {Property} temperatureUnitsProperty - whether temperature is being shown in Celsius or Fahrenheit
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, showAbsoluteValuesProperty, temperatureUnitsProperty, options ) {

    // Create a node that contains thermometer and triangle.
    const compositeThermometerNode = new Node();

    options = merge( {
      node: compositeThermometerNode,
      connectorLine: false
    }, options );

    const temperatureAndColorSensorNode = new TemperatureAndColorSensorNode(
      pointController.fahrenheitTemperatureProperty, TEMPERATURE_RANGE, pointController.colorProperty, {
        thermometerNodeOptions: {
          fluidMainColor: new Color( 0, 120, 0 ),
          fluidHighlightColor: new Color( 0, 210, 0 ),
          backgroundFill: 'rgba( 255, 255, 255, 0.9 )',
          tickSpacingTemperature: 20,
          majorTickLength: 0,
          minorTickLength: 0
        }
      } );
    compositeThermometerNode.addChild( temperatureAndColorSensorNode );

    // Add the textual label for this thermometer, generally a single letter.
    const thermometerLabel = new Text( pointController.label, {
      font: new PhetFont( 16 ),
      centerX: temperatureAndColorSensorNode.thermometerBounds.centerX,
      top: temperatureAndColorSensorNode.top + 4, // offset empirically determined
      maxWidth: temperatureAndColorSensorNode.width * 0.25 // multiplier empirically determined
    } );
    compositeThermometerNode.addChild( thermometerLabel );

    // Add a readout that will describe the temperature textually, e.g. "20° above 0".
    const createTemperatureReadoutNode = ( stringProperty, temperatureProperty, visibleProperty ) => {
      return new ColorizedReadoutNode(
        new PatternStringProperty( stringProperty, { value: temperatureProperty }, {
          maps: {
            value: value => Math.abs( value )
          }
        } ),
        pointController.colorProperty,
        {
          left: temperatureAndColorSensorNode.right + 3,
          centerY: 0,
          textOptions: {
            font: new PhetFont( 18 ),
            maxWidth: 250
          },
          visibleProperty: visibleProperty
        }
      );
    };

    // NEGATIVE readouts
    const negativeFahrenheitTemperatureReadout = createTemperatureReadoutNode(
      negativeTemperatureAmountStringProperty,
      pointController.fahrenheitTemperatureProperty,
      new DerivedProperty( [ pointController.fahrenheitTemperatureProperty, temperatureUnitsProperty ],
        ( fahrenheit, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT && fahrenheit < 0;
        } ) );

    const negativeCelsiusTemperatureReadout = createTemperatureReadoutNode(
      negativeTemperatureAmountStringProperty,
      pointController.celsiusTemperatureProperty,
      new DerivedProperty( [ pointController.celsiusTemperatureProperty, temperatureUnitsProperty ],
        ( celsius, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.CELSIUS && celsius < 0;
        } ) );

    // ZERO readouts
    const zeroFahrenheitTemperatureReadout = createTemperatureReadoutNode(
      zeroTemperatureAmountStringProperty,
      pointController.fahrenheitTemperatureProperty,
      new DerivedProperty( [ pointController.fahrenheitTemperatureProperty, temperatureUnitsProperty ],
        ( fahrenheit, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT && fahrenheit === 0;
        } ) );

    const zeroCelsiusTemperatureReadout = createTemperatureReadoutNode(
      zeroTemperatureAmountStringProperty,
      pointController.celsiusTemperatureProperty,
      new DerivedProperty( [ pointController.celsiusTemperatureProperty, temperatureUnitsProperty ],
        ( celsius, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.CELSIUS && celsius === 0;
        } ) );

    // POSITIVE readouts
    const positiveFahrenheitTemperatureReadout = createTemperatureReadoutNode(
      positiveTemperatureAmountStringProperty,
      pointController.fahrenheitTemperatureProperty,
      new DerivedProperty( [ pointController.fahrenheitTemperatureProperty, temperatureUnitsProperty ],
        ( fahrenheit, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT && fahrenheit > 0;
        } ) );

    const positiveTemperatureReadout = createTemperatureReadoutNode(
      positiveTemperatureAmountStringProperty,
      pointController.celsiusTemperatureProperty,
      new DerivedProperty( [ pointController.celsiusTemperatureProperty, temperatureUnitsProperty ],
        ( celsius, units ) => {
          return units === NLIConstants.TEMPERATURE_UNITS.CELSIUS && celsius > 0;
        } ) );

    const temperatureReadoutWrapper = new Node( {
      children: [ negativeFahrenheitTemperatureReadout, negativeCelsiusTemperatureReadout, zeroFahrenheitTemperatureReadout,
        zeroCelsiusTemperatureReadout, positiveFahrenheitTemperatureReadout, positiveTemperatureReadout ]
    } );

    compositeThermometerNode.addChild( temperatureReadoutWrapper );


    // Control the visibility of the textual label, no unlink needed because these point controllers are permanent.
    Multilink.multilink(
      [ showAbsoluteValuesProperty, pointController.isOverMapProperty ],
      ( showAbsoluteValues, isOverMap ) => {
        temperatureReadoutWrapper.visible = showAbsoluteValues && isOverMap;
      }
    );

    // Dilate the touch area for easier grabbing.
    compositeThermometerNode.touchArea = temperatureAndColorSensorNode.bounds.dilated( TOUCH_DILATION );

    super( pointController, options );
  }
}

numberLineIntegers.register( 'TemperaturePointControllerNode', TemperaturePointControllerNode );
export default TemperaturePointControllerNode;