// Copyright 2020-2025, University of Colorado Boulder

/**
 * 'Elevation' scene view for the explore screen
 *
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import birdInAir_png from '../../../../number-line-common/images/birdInAir_png.js';
import birdInWater_png from '../../../../number-line-common/images/birdInWater_png.js';
import fishInAir_png from '../../../../number-line-common/images/fishInAir_png.js';
import fishInWater_png from '../../../../number-line-common/images/fishInWater_png.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import elevationBackground_png from '../../../images/elevationBackground_png.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import ElevationPointControllerNode from './ElevationPointControllerNode.js';
import NLDSceneView from './NLDSceneView.js';

const fishStringProperty = NumberLineDistanceStrings.fishStringProperty;
const birdStringProperty = NumberLineDistanceStrings.birdStringProperty;
const elevationSceneAbsoluteDistanceTemplateStringProperty = NumberLineDistanceStrings.elevationSceneAbsoluteDistanceTemplateStringProperty;
const elevationSceneDirectedPositiveDistanceTemplateStringProperty = NumberLineDistanceStrings.elevationSceneDirectedPositiveDistanceTemplateStringProperty;
const elevationSceneDirectedNegativeDistanceTemplateStringProperty = NumberLineDistanceStrings.elevationSceneDirectedNegativeDistanceTemplateStringProperty;
const metersSymbolStringProperty = NumberLineDistanceStrings.symbol.metersStringProperty;
const meterStringProperty = NumberLineDistanceStrings.meterStringProperty;
const metersStringProperty = NumberLineDistanceStrings.metersStringProperty;

class ElevationSceneView extends NLDSceneView {

  /**
   * @param {ElevationSceneModel} model
   */
  constructor( model ) {
    super(
      model,
      {
        pointControllerRepresentationOne: new Image( birdInAir_png, { center: new Vector2( 0, -10 ), maxWidth: 35 } ),
        pointControllerRepresentationTwo: new Image( fishInWater_png, { center: Vector2.ZERO, maxWidth: 35 } ),
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: elevationSceneAbsoluteDistanceTemplateStringProperty,
          directedPositiveDistanceDescriptionTemplate: elevationSceneDirectedPositiveDistanceTemplateStringProperty,
          directedNegativeDistanceDescriptionTemplate: elevationSceneDirectedNegativeDistanceTemplateStringProperty,
          singularUnits: meterStringProperty,
          pluralUnits: metersStringProperty,
          primaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              fishStringProperty, birdStringProperty ],
            ( isPrimarySwapped, fishString, birdString ) => {
              return isPrimarySwapped ? fishString : birdString;
            } ),
          secondaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              fishStringProperty, birdStringProperty ],
            ( isPrimarySwapped, fishString, birdString ) => {
              return isPrimarySwapped ? birdString : fishString;
            } )
        },
        distanceShadedNumberLineNodeOptions: {
          unitsString: metersSymbolStringProperty,
          distanceTextPadding: 54 // determined empirically; see https://github.com/phetsims/number-line-distance/issues/67
        }
      }
    );

    // Add background image and water rectangle. Water rectangle is on top of everything so that point controllers
    // appear 'submerged' in water because they are layered beneath the rectangle.
    this.addChild( new Image(
      elevationBackground_png,
      {
        x: model.elevationAreaBounds.minX,
        y: model.elevationAreaBounds.minY,
        maxWidth: model.elevationAreaBounds.width,
        maxHeight: model.elevationAreaBounds.height
      }
    ) );
    const waterRectangle = new Rectangle(
      model.elevationAreaBounds.minX,
      model.elevationAreaBounds.minY + model.elevationAreaBounds.height / 2,
      model.elevationAreaBounds.width,
      model.elevationAreaBounds.height / 2,
      { fill: '#97C4F2', opacity: 0.3 }
    );
    this.addChild( waterRectangle );

    const seaLevel = model.numberLine.valueToModelPosition( 0 ).y;

    // point controllers
    const pointControllerNodeLayer = new Node( {
      children: [
        new ElevationPointControllerNode(
          model.pointControllerOne,
          seaLevel,
          new Image( birdInWater_png, { center: Vector2.ZERO, maxWidth: 65 } ),
          new Image( birdInAir_png, { center: new Vector2( 0, -10 ), maxWidth: 60 } )
        ),
        new ElevationPointControllerNode(
          model.pointControllerTwo,
          seaLevel,
          new Image( fishInWater_png, { center: Vector2.ZERO, maxWidth: 60 } ),
          new Image( fishInAir_png, { center: Vector2.ZERO, maxWidth: 60 } )
        )
      ]
    } );
    this.addChild( pointControllerNodeLayer );

    waterRectangle.moveToFront();
  }

}

numberLineDistance.register( 'ElevationSceneView', ElevationSceneView );
export default ElevationSceneView;