// Copyright 2020-2025, University of Colorado Boulder

/**
 * 'Distance' scene view for the explore screen
 *
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import fireHydrant_png from '../../../images/fireHydrant_png.js';
import house_png from '../../../images/house_png.js';
import sidewalk_png from '../../../images/sidewalk_png.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceImages from '../../NumberLineDistanceImages.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import DistancePointControllerNode from './DistancePointControllerNode.js';
import NLDSceneView from './NLDSceneView.js';

const eastStringProperty = NumberLineDistanceStrings.symbol.eastStringProperty;
const westStringProperty = NumberLineDistanceStrings.symbol.westStringProperty;
const houseStringProperty = NumberLineDistanceStrings.houseStringProperty;
const personStringProperty = NumberLineDistanceStrings.personStringProperty;
const distanceSceneAbsoluteDistanceTemplateStringProperty = NumberLineDistanceStrings.distanceSceneAbsoluteDistanceTemplateStringProperty;
const distanceSceneDirectedPositiveDistanceTemplateStringProperty = NumberLineDistanceStrings.distanceSceneDirectedPositiveDistanceTemplateStringProperty;
const distanceSceneDirectedNegativeDistanceTemplateStringProperty = NumberLineDistanceStrings.distanceSceneDirectedNegativeDistanceTemplateStringProperty;
const metersSymbolStringProperty = NumberLineDistanceStrings.symbol.metersStringProperty;
const meterStringProperty = NumberLineDistanceStrings.meterStringProperty;
const metersStringProperty = NumberLineDistanceStrings.metersStringProperty;

const DIRECTION_INDICATOR_FONT = new PhetFont( 25 );
const DIRECTION_INDICATOR_MAX_WIDTH = 50;

class DistanceSceneView extends NLDSceneView {

  /**
   * @param {DistanceSceneModel} model
   */
  constructor( model ) {

    // Create the representations for the person and the house. Scales were empirically determined.
    const houseRepresentation = new Image( house_png, { scale: 0.05 } );
    const personRepresentation = new Image( NumberLineDistanceImages.personImageProperty, { scale: 0.1 } );

    super(
      model,
      {
        pointControllerRepresentationOne: houseRepresentation,
        pointControllerRepresentationTwo: personRepresentation,
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: distanceSceneAbsoluteDistanceTemplateStringProperty,
          directedPositiveDistanceDescriptionTemplate: distanceSceneDirectedPositiveDistanceTemplateStringProperty,
          directedNegativeDistanceDescriptionTemplate: distanceSceneDirectedNegativeDistanceTemplateStringProperty,
          singularUnits: meterStringProperty,
          pluralUnits: metersStringProperty,
          primaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              personStringProperty, houseStringProperty ],
            ( isPrimarySwapped, personString, houseString ) => {
              return isPrimarySwapped ? personString : houseString;
            } ),
          secondaryPointControllerLabelStringProperty: new DerivedProperty( [ model.isPrimaryControllerSwappedProperty,
              personStringProperty, houseStringProperty ],
            ( isPrimarySwapped, personString, houseString ) => {
              return isPrimarySwapped ? houseString : personString;
            } )
        },
        distanceShadedNumberLineNodeOptions: { unitsString: metersSymbolStringProperty }
      }
    );

    // Sidewalk is the plane where the person stands.
    const sidewalkImage = new Image( sidewalk_png );
    sidewalkImage.scale( model.sidewalkBounds.width / sidewalkImage.width, model.sidewalkBounds.height / sidewalkImage.height );
    sidewalkImage.center = model.sidewalkBounds.center;
    this.addChild( sidewalkImage );

    // Fire hydrant sits at the 0 location of the number line.
    this.addChild( new Image( fireHydrant_png, {
      centerX: model.sidewalkBounds.center.x,
      bottom: model.sidewalkBounds.center.y - 5,
      scale: 0.15
    } ) );

    const housePointControllerImage = new Image( house_png, { scale: 0.2 } );
    const personPointControllerImage = new Image( NumberLineDistanceImages.personImageProperty, { scale: 0.22 } );

    // Mouse area dilation for #38, empirically determined.
    personPointControllerImage.localBoundsProperty.link( localBounds => {
      personPointControllerImage.mouseArea = localBounds.dilated( 5 / personPointControllerImage.getScaleVector().x );
    } );

    const housePointControllerNode = new DistancePointControllerNode( model.pointControllerOne, housePointControllerImage );
    const personPointControllerNode = new DistancePointControllerNode( model.pointControllerTwo, personPointControllerImage );

    // Point controllers have different parent Nodes so that the person is always in front of the house.
    const pointControllersLayer = new Node( {
      children: [
        new Node( { children: [ housePointControllerNode ] } ),
        new Node( { children: [ personPointControllerNode ] } )
      ]
    } );
    this.addChild( pointControllersLayer );

    // Symbols at edges of number line, denoting east ('E') and west ('W')
    const eastSymbolText = new Text( eastStringProperty, {
      font: DIRECTION_INDICATOR_FONT,
      maxWidth: DIRECTION_INDICATOR_MAX_WIDTH
    } );
    const westSymbolText = new Text( westStringProperty, {
      font: DIRECTION_INDICATOR_FONT,
      maxWidth: DIRECTION_INDICATOR_MAX_WIDTH
    } );

    const range = model.numberLine.displayedRangeProperty.value;
    const textOffsetFromNumberLine = this.numberLineNode.options.displayedRangeInset + this.numberLineNode.options.arrowSize + 4; // empirically determined
    ManualConstraint.create( this, [ eastSymbolText, westSymbolText, this.numberLineNode ], ( eastProxy, westProxy, numberLineProxy ) => {
      eastProxy.leftCenter = model.numberLine.valueToModelPosition( range.max ).plusXY( textOffsetFromNumberLine, 0 );
      westProxy.rightCenter = model.numberLine.valueToModelPosition( range.min ).plusXY( -textOffsetFromNumberLine, 0 );
    } );
    this.addChild( eastSymbolText );
    this.addChild( westSymbolText );
    eastSymbolText.moveToBack();
    westSymbolText.moveToBack();
  }
}

numberLineDistance.register( 'DistanceSceneView', DistanceSceneView );
export default DistanceSceneView;