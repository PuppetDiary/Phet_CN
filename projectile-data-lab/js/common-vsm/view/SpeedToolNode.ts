// Copyright 2023-2025, University of Colorado Boulder

/**
 * The SpeedToolNode is a static tool that displays a heat map representation of speed data.
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
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node, { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import PDLColors from '../../common/PDLColors.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import HeatMapToolNode, { HeatMapToolNodeOptions } from './HeatMapToolNode.js';

type SelfOptions = {
  isIcon?: boolean;
};

export type SpeedToolNodeOptions = SelfOptions & NodeTranslationOptions & PickOptional<HeatMapToolNodeOptions, 'visibleProperty'>;

// The min speed is the minimum value that the tool can display.
const MIN_SPEED = 0;

// The max speed is the maximum value that the tool can display.
const MAX_SPEED = 35;

// The body radius is the radius of the display panel, which the is background of the heat map display.
const BODY_RADIUS = 60;

// The needle length is the length of the needle that points to the current value.
const NEEDLE_LENGTH = 55;

// The needle angle overhang is the number of degrees that the needle rotates below the horizontal at 0 and max values.
const NEEDLE_ANGLE_OVERHANG = 9;

// The bottom margin angle is number of degrees that the body extends below the lowest overhang point
const BOTTOM_MARGIN_ANGLE = 8;

// The total angle overhang is the sum of the needle angle overhang and the bottom margin angle
const TOTAL_ANGLE_OVERHANG = NEEDLE_ANGLE_OVERHANG + BOTTOM_MARGIN_ANGLE;

// The needle base radius is the radius of the semicircular base of the needle.
const NEEDLE_BASE_RADIUS = 2.5;

// The needle tip radius is the radius of the semicircular tip of the needle.
const NEEDLE_TIP_RADIUS = 1;

// The needle tip offset is the distance from the center of the needle's base to the center of the needle's tip.
const NEEDLE_TIP_OFFSET = NEEDLE_LENGTH - NEEDLE_BASE_RADIUS - NEEDLE_TIP_RADIUS;

export default class SpeedToolNode extends HeatMapToolNode {

  // The connecting wire connects the tool to the launcher (not created when the tool is an icon).
  private readonly connectingWire?: Node;

  // The display offset is the position of the tool display panel relative to its origin.
  private displayOffset: Vector2;

  public constructor( latestValueProperty: TReadOnlyProperty<number>, isLauncherRaised: TReadOnlyProperty<boolean>, providedOptions: SpeedToolNodeOptions ) {

    // The body shape is an arc that represents the background of the heat map display.
    const bodyShape = new Shape().arc( 0, 0, BODY_RADIUS,
      Math.PI - Utils.toRadians( TOTAL_ANGLE_OVERHANG ), Utils.toRadians( TOTAL_ANGLE_OVERHANG ) ).close();

    // The needle base shape is the semicircular base of the needle.
    const needleBaseShape = new Shape().arc( 0, 0, NEEDLE_BASE_RADIUS, Math.PI / 2, 3 * Math.PI / 2 );

    // The needle tip shape is the semicircular tip of the needle.
    const needleTipShape = new Shape().arc( NEEDLE_TIP_OFFSET, 0, NEEDLE_TIP_RADIUS, 3 * Math.PI / 2, Math.PI / 2 );

    // The needle arm shape is the polygon that connects the base and tip of the needle.
    const needleArmShape = new Shape().polygon( [
      new Vector2( 0, NEEDLE_BASE_RADIUS ),
      new Vector2( NEEDLE_TIP_OFFSET, NEEDLE_TIP_RADIUS ),
      new Vector2( NEEDLE_TIP_OFFSET, -NEEDLE_TIP_RADIUS ),
      new Vector2( 0, -NEEDLE_BASE_RADIUS )
    ] );

    // The needle is a shape that is the union of the three needle component shapes
    const needleShape = Shape.union( [ needleArmShape, needleBaseShape, needleTipShape ] );

    const options = optionize<SpeedToolNodeOptions, SelfOptions, HeatMapToolNodeOptions>()( {
      displayOffset: new Vector2( -20, -150 ),
      bodyShape: bodyShape,
      needleShape: needleShape,
      binWidth: 0.25,
      minValue: MIN_SPEED,
      maxValue: MAX_SPEED,
      minAngle: 180 + NEEDLE_ANGLE_OVERHANG,
      maxAngle: -NEEDLE_ANGLE_OVERHANG,
      innerHeatNodeRadius: 0.5 * BODY_RADIUS,
      outerHeatNodeRadius: BODY_RADIUS,
      minLabeledValue: MIN_SPEED,
      maxLabeledValue: MAX_SPEED,
      labeledValueIncrement: 5,
      labelDistanceFromCenter: 0.8 * BODY_RADIUS,
      labelMinAngle: 180 + NEEDLE_ANGLE_OVERHANG,
      labelMaxAngle: -NEEDLE_ANGLE_OVERHANG,
      isWithMinorTickMarks: true,
      minorTickMarkIncrement: 1,
      majorTickMarkLength: 5,
      minorTickMarkLength: 3,
      valueReadoutY: BODY_RADIUS * Math.sin( Utils.toRadians( TOTAL_ANGLE_OVERHANG ) ),
      readoutPatternStringProperty: ProjectileDataLabStrings.valueMetersPerSecondPatternStringProperty,
      isClockwise: true,
      isIcon: false
    }, providedOptions );
    super( latestValueProperty, options );

    this.displayOffset = options.displayOffset;

    // If this is an icon, do not create the connecting wire or the launcher circle
    if ( options.isIcon ) {
      return;
    }

    // If this is not an icon, create the graphics for the wire connected to the launcher
    const launcherCircle = new Circle( 4, { fill: 'black' } );
    const connectingWireShape = this.connectingWireShapeForIsRaised( );

    this.connectingWire = new Node();
    this.connectingWire.addChild( new Path( connectingWireShape, {
      stroke: PDLColors.speedToolConnectorStrokeProperty, lineWidth: 4
    } ) );

    this.addChild( launcherCircle );
    this.addChild( this.connectingWire );

    launcherCircle.moveToBack();
    this.connectingWire.moveToBack();

    // When the launcher is raised or lowered, update the positioning of the display panel and the connecting wire
    isLauncherRaised.link( isRaised => {
      this.setForIsLauncherRaised( isRaised );
    } );
  }

  // When the launcher is raised or lowered, update the positioning of the display panel and the connecting wire
  private setForIsLauncherRaised( isLauncherRaised: boolean ): void {
    const speedToolX = -62;
    const speedToolY = isLauncherRaised ? 100 : -103;

    this.displayOffset = new Vector2( speedToolX, speedToolY );

    const connectingWireShape = this.connectingWireShapeForIsRaised( );

    if ( this.connectingWire ) {
      this.connectingWire.children = [ new Path( connectingWireShape, {
        stroke: PDLColors.speedToolConnectorStrokeProperty, lineWidth: 4
      } ) ];
    }

    this.displayNode.setX( speedToolX );
    this.displayNode.setY( speedToolY );
  }

  // The connecting wire shape is the shape of the wire that connects the tool to the launcher
  private connectingWireShapeForIsRaised(): Shape {
    const controlPoint1 = new Vector2( this.displayOffset.x, 0.8 * this.displayOffset.y );
    const controlPoint2 = new Vector2( this.displayOffset.x, 0.5 * this.displayOffset.y );
    return new Shape().moveTo( this.displayOffset.x, this.displayOffset.y ).cubicCurveTo(
      controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, 0, 0 );
  }
}

projectileDataLab.register( 'SpeedToolNode', SpeedToolNode );