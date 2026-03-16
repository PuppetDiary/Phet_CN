// Copyright 2023-2025, University of Colorado Boulder

/**
 * The AngleToolNode is a static tool that displays a heat map representation of angle data.
 * It has two visual modes - ground level and raised. When the tool is at ground level, the angle range is 0 to 90 degrees.
 * When the tool is raised, the angle range is -40 to 40 degrees. The tool preserves data when switching between these modes.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import Node, { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import PDLColors from '../../common/PDLColors.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import HeatMapToolNode, { HeatMapToolNodeOptions } from './HeatMapToolNode.js';

type SelfOptions = {
  isIcon?: boolean;
};

export type AngleToolNodeOptions = SelfOptions & NodeTranslationOptions & PickOptional<HeatMapToolNodeOptions, 'visibleProperty'>;

// This is the inner radius of the tool body and heat nodes.
const INNER_BODY_RADIUS = 58;

// This is the outer radius of the tool body and heat nodes.
const OUTER_BODY_RADIUS = 93;

// This is the y position of the value readout when the tool is at ground level.
const VALUE_READOUT_Y_GROUND = 13;

// This is the y position of the value readout when the tool is raised.
const VALUE_READOUT_Y_RAISED = -29;

// These are the minimum and maximum angles for the tool when it is at ground level.
const MIN_ANGLE_GROUND = 0;
const MAX_ANGLE_GROUND = 90;

// These are the minimum and maximum angles for the tool when it is raised.
const MIN_ANGLE_RAISED = -40;
const MAX_ANGLE_RAISED = 40;

export default class AngleToolNode extends HeatMapToolNode {

  // elementsForGround is used to keep track of the elements that are visible when the tool is at ground level.
  private readonly elementsForGround: Node[] = [];

  // elementsForRaised is used to keep track of the elements that are visible when the tool is raised.
  private readonly elementsForRaised: Node[] = [];

  public constructor( latestValueProperty: TReadOnlyProperty<number>,
                      isRaisedProperty: TReadOnlyProperty<boolean>,
                      providedOptions: AngleToolNodeOptions ) {

    // bodyShapeForIsRaised creates the shape of the body of the display panel, which depends on whether the tool is raised.
    const bodyShapeForIsRaised = ( innerBodyRadius: number, outerBodyRadius: number, isRaised: boolean ) => {
      const minAngle = isRaised ? MIN_ANGLE_RAISED : MIN_ANGLE_GROUND;
      const maxAngle = isRaised ? MAX_ANGLE_RAISED : MAX_ANGLE_GROUND;
      const outerCircle = new Shape().arc( 0, 0, outerBodyRadius, Utils.toRadians( -maxAngle ), Utils.toRadians( -minAngle ) ).lineTo( 0, 0 );
      const innerCircle = new Shape().arc( 0, 0, innerBodyRadius, Utils.toRadians( -maxAngle ), Utils.toRadians( -minAngle ) ).lineTo( 0, 0 );
      return outerCircle.shapeDifference( innerCircle ).close();
    };

    // Create the body shape.
    const bodyShape = bodyShapeForIsRaised( INNER_BODY_RADIUS, OUTER_BODY_RADIUS, isRaisedProperty.value );

    // Create the needle shape.
    const needleLength = 76;
    const needleWidth = 3;
    const needleTipLength = 6;
    const needleArmLength = needleLength - needleTipLength - needleWidth / 2;

    // The needleBaseShape is the base of the needle, which is a half circle.
    const needleBaseShape = new Shape().arc( 0, 0, needleWidth / 2, Math.PI / 2, 3 * Math.PI / 2 );

    // The needleArmShape is the arm of the needle, which is a rectangle.
    const needleArmShape = new Shape().rect( 0, -needleWidth / 2, needleArmLength, needleWidth );

    // The needle tip is a triangle.
    const needleTipLeftX = needleArmLength;
    const needleTipShape = new Shape().polygon( [
      new Vector2( needleTipLeftX, -needleWidth / 2 ),
      new Vector2( needleTipLeftX + needleTipLength, 0 ),
      new Vector2( needleTipLeftX, needleWidth / 2 )
    ] );

    // The needleShape is the union of the three needle parts.
    const needleShape = Shape.union( [ needleBaseShape, needleArmShape, needleTipShape ] );

    // Find the minimum angle that for the tool, from both the ground and raised modes.
    const minAngle = Math.min( MIN_ANGLE_GROUND, MIN_ANGLE_RAISED );

    // Find the maximum angle that for the tool, from both the ground and raised modes.
    const maxAngle = Math.max( MAX_ANGLE_GROUND, MAX_ANGLE_RAISED );

    const options = optionize<AngleToolNodeOptions, SelfOptions, HeatMapToolNodeOptions>()( {
      displayOffset: Vector2.ZERO,
      bodyShape: bodyShape,
      needleShape: needleShape,
      binWidth: 1,
      minValue: minAngle,
      maxValue: maxAngle,
      minAngle: minAngle,
      maxAngle: maxAngle,
      innerHeatNodeRadius: INNER_BODY_RADIUS,
      outerHeatNodeRadius: OUTER_BODY_RADIUS,
      minLabeledValue: minAngle + 10,
      maxLabeledValue: maxAngle - 10,
      labeledValueIncrement: 10,
      labelDistanceFromCenter: ( INNER_BODY_RADIUS + OUTER_BODY_RADIUS ) / 2,
      labelMinAngle: minAngle + 10,
      labelMaxAngle: maxAngle - 10,
      isWithInnerTickMarks: true,
      majorTickMarkLength: 5,
      valueReadoutY: VALUE_READOUT_Y_GROUND,
      readoutPatternStringProperty: ProjectileDataLabStrings.valueDegreesPatternStringProperty,
      isIcon: false
    }, providedOptions );
    super( latestValueProperty, options );

    // rotatedElements is used to keep track of the elements that need to be rotated to their correct positions.
    const rotatedElements = [ ...this.heatNodes, ...this.tickMarks ];

    // Use the rotation of the elements to determine which elements are for ground and which are for raised.
    rotatedElements.forEach( rotatedElement => {
      const elementAngle = -Utils.toDegrees( rotatedElement.rotation );

      // If the element is within the ground range, add it to the elementsForGround array
      if ( elementAngle > MIN_ANGLE_GROUND && elementAngle < MAX_ANGLE_GROUND ) {
        this.elementsForGround.push( rotatedElement );
      }

      // If the element is within the raised range, add it to the elementsForRaised array
      if ( elementAngle > MIN_ANGLE_RAISED && elementAngle < MAX_ANGLE_RAISED ) {
        this.elementsForRaised.push( rotatedElement );
      }
    } );

    // Go through each of the labels, and use their angular displacement to determine which elements are for ground and which are for raised.
    this.labels.forEach( label => {
      const labelAngularDisplacement = Math.atan2( label.centerY, label.centerX );
      const labelAngle = _.round( -Utils.toDegrees( labelAngularDisplacement ) );

      // If the label is within the ground range, add it to the elementsForGround array
      if ( labelAngle > MIN_ANGLE_GROUND && labelAngle < MAX_ANGLE_GROUND ) {
        this.elementsForGround.push( label );
      }

      // If the label is within the raised range, add it to the elementsForRaised array
      if ( labelAngle > MIN_ANGLE_RAISED && labelAngle < MAX_ANGLE_RAISED ) {
        this.elementsForRaised.push( label );
      }
    } );

    // When the isRaisedProperty changes, update the visibility of the elements.
    isRaisedProperty.link( isRaised => {
      const bodyShape = bodyShapeForIsRaised( INNER_BODY_RADIUS, OUTER_BODY_RADIUS, isRaised );
      this.drawBodyNodes( bodyShape );

      // Set the visibility of the elements that are in this.elementsForRaised but not in this.elementsForGround to isRaised
      this.elementsForRaised.forEach( element => {
        if ( !this.elementsForGround.includes( element ) ) {
          element.setVisible( isRaised );
        }
      } );

      // Set the visibility of the elements that are in this.elementsForGround but not in this.elementsForRaised to !isRaised
      this.elementsForGround.forEach( element => {
        if ( !this.elementsForRaised.includes( element ) ) {
          element.setVisible( !isRaised );
        }
      } );

      // Position the value readout based on whether the tool is raised or not.
      this.valueReadoutNode.x = isRaised ? 0.25 * INNER_BODY_RADIUS : 0.5 * INNER_BODY_RADIUS;
      this.valueReadoutNode.y = isRaised ? VALUE_READOUT_Y_RAISED : VALUE_READOUT_Y_GROUND;
    } );
  }

  // drawBodyNodes updates the dislay panel with the new body shape. This changes the appearance of the tool when it is raised or lowered.
  private drawBodyNodes( bodyShape: Shape ): void {
    this.displayNode.removeChild( this.bodyBackNode );
    this.displayNode.removeChild( this.bodyFrontNode );
    this.bodyBackNode = new Path( bodyShape, { fill: PDLColors.heatMapDisplayFillProperty } );
    this.bodyFrontNode = new Path( bodyShape, { stroke: PDLColors.heatMapDisplayStrokeProperty, lineWidth: 1 } );
    this.displayNode.addChild( this.bodyBackNode );
    this.displayNode.addChild( this.bodyFrontNode );
    this.bodyBackNode.moveToBack();
    this.needleNode.moveToFront();
  }
}

projectileDataLab.register( 'AngleToolNode', AngleToolNode );