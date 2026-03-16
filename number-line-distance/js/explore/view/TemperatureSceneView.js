// Copyright 2020-2025, University of Colorado Boulder

/**
 * 'Temperature' scene view for the explore screen
 *
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import antarctic_png from '../../../images/antarctic_png.js';
import desert_png from '../../../images/desert_png.js';
import trees_png from '../../../images/trees_png.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import TemperatureSceneModel from '../model/TemperatureSceneModel.js';
import NLDSceneView from './NLDSceneView.js';
import TemperaturePointControllerNode from './TemperaturePointControllerNode.js';

const aStringProperty = NumberLineDistanceStrings.symbol.AStringProperty;
const bStringProperty = NumberLineDistanceStrings.symbol.BStringProperty;
const temperatureSceneAbsoluteDistanceTemplateStringProperty = NumberLineDistanceStrings.temperatureSceneAbsoluteDistanceTemplateStringProperty;
const temperatureSceneDirectedPositiveDistanceTemplateStringProperty = NumberLineDistanceStrings.temperatureSceneDirectedPositiveDistanceTemplateStringProperty;
const temperatureSceneDirectedNegativeDistanceTemplateStringProperty = NumberLineDistanceStrings.temperatureSceneDirectedNegativeDistanceTemplateStringProperty;
const degreesCelsiusStringProperty = NumberLineDistanceStrings.symbol.degreesCelsiusStringProperty;
const degreeStringProperty = NumberLineDistanceStrings.degreeStringProperty;
const degreesStringProperty = NumberLineDistanceStrings.degreesStringProperty;

// constants
const REPRESENTATION_TEXT_OPTIONS = { font: new PhetFont( 25 ), maxWidth: 50 };
const NUMBER_OF_TEMPERATURE_GRADIENT_COLOR_STOPS = 5;

class TemperatureSceneView extends NLDSceneView {

  /**
   * @param {TemperatureSceneModel} model
   */
  constructor( model ) {

    // texts that represent the point controllers in the swap area at the bottom left
    const aText = new Text( aStringProperty, REPRESENTATION_TEXT_OPTIONS );
    const bText = new Text( bStringProperty, REPRESENTATION_TEXT_OPTIONS );

    // Match the color of the point controller with the representation texts.
    aText.fill = model.pointControllers[ 0 ].color;
    bText.fill = model.pointControllers[ 1 ].color;

    // @private
    super(
      model,
      {
        pointControllerRepresentationOne: aText,
        pointControllerRepresentationTwo: bText,
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: temperatureSceneAbsoluteDistanceTemplateStringProperty,
          directedPositiveDistanceDescriptionTemplate: temperatureSceneDirectedPositiveDistanceTemplateStringProperty,
          directedNegativeDistanceDescriptionTemplate: temperatureSceneDirectedNegativeDistanceTemplateStringProperty,
          singularUnits: degreeStringProperty,
          pluralUnits: degreesStringProperty,
          primaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              bStringProperty, aStringProperty ],
            ( isPrimarySwapped, bString, aString ) => {
              return isPrimarySwapped ? bString : aString;
            } ),
          secondaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              bStringProperty, aStringProperty ],
            ( isPrimarySwapped, bString, aString ) => {
              return isPrimarySwapped ? aString : bString;
            } )
        },
        distanceShadedNumberLineNodeOptions: { unitsString: degreesCelsiusStringProperty }
      }
    );

    // Create the gradient which shows a continuous color representation of the number line temperature values.
    let rectangleGradient = new LinearGradient(
      model.temperatureAreaBounds.minX,
      model.temperatureAreaBounds.minY,
      model.temperatureAreaBounds.maxX,
      model.temperatureAreaBounds.minY
    );
    for ( let i = 0; i < NUMBER_OF_TEMPERATURE_GRADIENT_COLOR_STOPS; i++ ) {
      const ratio = i / ( NUMBER_OF_TEMPERATURE_GRADIENT_COLOR_STOPS - 1 );
      const value = Utils.roundSymmetric(
        TemperatureSceneModel.TEMPERATURE_RANGE.getLength() * ratio + TemperatureSceneModel.TEMPERATURE_RANGE.min
      );
      rectangleGradient = rectangleGradient.addColorStop(
        ratio,
        model.temperatureToColorMapper.mapTemperatureToColor( value )
      );
    }
    this.addChild( new Rectangle( model.temperatureAreaBounds, {
      fill: rectangleGradient
    } ) );

    // Add images on top of the rectangle gradient.
    this.addChild( new Image(
      antarctic_png,
      {
        left: model.temperatureAreaBounds.left,
        bottom: model.temperatureAreaBounds.bottom,
        maxHeight: model.temperatureAreaBounds.height
      }
    ) );
    this.addChild( new Image(
      trees_png,
      {
        centerX: model.temperatureAreaBounds.centerX,
        bottom: model.temperatureAreaBounds.bottom,
        maxHeight: model.temperatureAreaBounds.height
      }
    ) );
    this.addChild( new Image(
      desert_png,
      {
        right: model.temperatureAreaBounds.right,
        bottom: model.temperatureAreaBounds.bottom,
        maxHeight: model.temperatureAreaBounds.height
      }
    ) );

    // point controllers
    const pointControllerNodeLayer = new Node( {
      children: [
        new TemperaturePointControllerNode( model.pointControllerOne, aStringProperty, {
          thermometerFluidHighlightColor: '#ad3dc3'
        } ),
        new TemperaturePointControllerNode( model.pointControllerTwo, bStringProperty )
      ]
    } );
    this.addChild( pointControllerNodeLayer );
  }

}

numberLineDistance.register( 'TemperatureSceneView', TemperatureSceneView );
export default TemperatureSceneView;