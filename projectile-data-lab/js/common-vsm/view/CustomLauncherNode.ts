// Copyright 2023-2025, University of Colorado Boulder

/**
 * The CustomLauncherNode is the visual representation of the customizable launcher. It contains a barrelFillProperty, frame and a stand.
 * It also contains a symbol that represents the type of launcher. The symbol is a spring for the spring launcher, a pressure
 * gauge for the pressure launcher, and an explosion for the explosion launcher.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import explosion_svg from '../../../images/explosion_svg.js';
import gear_svg from '../../../images/gear_svg.js';
import pressureNeedle_png from '../../../images/pressureNeedle_png.js';
import pressureWithoutNeedle_png from '../../../images/pressureWithoutNeedle_png.js';
import spring_svg from '../../../images/spring_svg.js';
import Field from '../../common/model/Field.js';
import Launcher from '../../common/model/Launcher.js';
import { LauncherOrientation, MEAN_LAUNCH_ANGLES } from '../../common/model/LauncherOrientation.js';
import { MysteryOrCustom } from '../../common/model/MysteryOrCustom.js';
import PDLColors from '../../common/PDLColors.js';
import LauncherNode, { BARREL_LENGTH_BEFORE_ORIGIN, GUIDE_RAIL_MAX_ANGLE, GUIDE_RAIL_MIN_ANGLE, GUIDE_RAIL_OUTER_RADIUS, LauncherNodeOptions } from '../../common/view/LauncherNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import LauncherMechanism from '../model/LauncherMechanism.js';

type SelfOptions = EmptySelfOptions;
type CustomLauncherNodeOptions = SelfOptions & LauncherNodeOptions;

// This is how much of the outer guide rail is cut off to make room to show the angle stabilizers.
const GUIDE_RAIL_OUTER_CUTOFF = 13;
const LAUNCH_ANGLE_LIMITER_LENGTH = 17;
const LAUNCH_ANGLE_LIMITER_WIDTH = 5;

// This is the multiple of launch angle standard deviations to use for the gap of the angle stabilizer.
const ANGLE_STABILIZER_NUM_STANDARD_DEVIATIONS = 3;

export default class CustomLauncherNode extends LauncherNode {

  private readonly angleStabilizersContainer = new Node();

  public constructor( modelViewTransform: ModelViewTransform2,
                      launcherOrientationProperty: TReadOnlyProperty<LauncherOrientation>,
                      launcherAngleProperty: TReadOnlyProperty<number>,
                      launcherHeightProperty: TReadOnlyProperty<number>,
                      mysteryOrCustomProperty: TReadOnlyProperty<MysteryOrCustom>,
                      mysteryLauncherProperty: TProperty<Launcher>,
                      launcherMechanismProperty: TProperty<LauncherMechanism>,
                      standardDeviationAngleProperty: TReadOnlyProperty<number>,
                      latestLaunchSpeedProperty: TReadOnlyProperty<number>,
                      fieldProperty: TReadOnlyProperty<Field> | null,
                      providedOptions?: CustomLauncherNodeOptions ) {

    super( modelViewTransform, launcherAngleProperty, launcherHeightProperty, mysteryLauncherProperty, fieldProperty, providedOptions );

    const launcherTypeIcon = new Image( CustomLauncherNode.getImageKeyForCustomLauncherMechanism( launcherMechanismProperty.value ), {
      centerX: 0,
      centerY: 0
    } );

    const isLauncherCustomProperty = DerivedProperty.valueEqualsConstant( mysteryOrCustomProperty, 'custom' );

    const pressureNeedleNode = new Node( {
      children: [
        new Image( pressureNeedle_png, { x: -13.5, y: -40 } )
      ], rotation: -Math.PI / 2
    } );

    const launcherTypeIconContainer = new Node( {
      x: -0.71 * BARREL_LENGTH_BEFORE_ORIGIN,
      y: 0,
      children: [ launcherTypeIcon, pressureNeedleNode ],
      visibleProperty: isLauncherCustomProperty,
      scale: 0.18,
      rotation: Math.PI / 2
    } );

    this.launcherBarrel.addChild( launcherTypeIconContainer );

    // Add the launch angle limiter - the piece sticking out of the back of the launcher.
    const launchAngleLimiter = new Rectangle( -BARREL_LENGTH_BEFORE_ORIGIN - LAUNCH_ANGLE_LIMITER_LENGTH, -0.5 * LAUNCH_ANGLE_LIMITER_WIDTH,
      LAUNCH_ANGLE_LIMITER_LENGTH, LAUNCH_ANGLE_LIMITER_WIDTH, {
        visibleProperty: isLauncherCustomProperty,
        fill: PDLColors.mysteryLauncherColorProfiles[ 6 ].frameFillProperty,
        stroke: PDLColors.launcherStrokeProperty,
        cornerRadius: 2
      } );
    this.launcherBarrel.addChild( launchAngleLimiter );

    const customLauncherFrameFront = new Node( {
      visibleProperty: isLauncherCustomProperty
    } );
    const customLauncherFrameFrontGraphics = this.launcherFrameFrontGraphicsForType( 7, GUIDE_RAIL_OUTER_CUTOFF );
    customLauncherFrameFrontGraphics.forEach( graphic => customLauncherFrameFront.addChild( graphic ) );
    this.addChild( customLauncherFrameFront );

    this.addChild( this.angleStabilizersContainer );
    this.angleStabilizersContainer.moveToBack();
    this.angleStabilizersContainer.addChild( this.getAngleStabilizers( launcherOrientationProperty.value,
      ANGLE_STABILIZER_NUM_STANDARD_DEVIATIONS * standardDeviationAngleProperty.value ) );

    const gearImageScale = 0.075;
    const gearAngleInset = Utils.toRadians( 6 );
    const gearTopAngle = GUIDE_RAIL_MAX_ANGLE - gearAngleInset;
    const gearBottomAngle = GUIDE_RAIL_MIN_ANGLE + gearAngleInset;
    const gearToOriginDistance = GUIDE_RAIL_OUTER_RADIUS - 1.5 * GUIDE_RAIL_OUTER_CUTOFF;

    const gearTop = new Image( gear_svg, { centerX: 0, centerY: 0, scale: gearImageScale } );
    const gearBottom = new Image( gear_svg, { centerX: 0, centerY: 0, scale: gearImageScale } );

    const gearTopContainer = new Node( {
      visibleProperty: isLauncherCustomProperty,
      x: gearToOriginDistance * Math.cos( gearTopAngle ),
      y: gearToOriginDistance * Math.sin( gearTopAngle ),
      children: [ gearTop ]
    } );
    const gearBottomContainer = new Node( {
      visibleProperty: isLauncherCustomProperty,
      x: gearToOriginDistance * Math.cos( gearBottomAngle ),
      y: gearToOriginDistance * Math.sin( gearBottomAngle ),
      children: [ gearBottom ]
    } );

    this.addChild( gearTopContainer );
    this.addChild( gearBottomContainer );

    Multilink.multilink( [ launcherOrientationProperty, standardDeviationAngleProperty ],
      ( launcherOrientation, standardDeviationAngle ) => {
        const launcherAngle = MEAN_LAUNCH_ANGLES[ launcherOrientation ];
        const rotationFactor = 0.4;
        gearTopContainer.rotation = rotationFactor * ( launcherAngle + standardDeviationAngle );
        gearBottomContainer.rotation = rotationFactor * ( launcherAngle - standardDeviationAngle );
        this.angleStabilizersContainer.children = [ this.getAngleStabilizers( launcherOrientation,
          ANGLE_STABILIZER_NUM_STANDARD_DEVIATIONS * standardDeviationAngle ) ];
      } );

    Multilink.multilink( [ mysteryOrCustomProperty, mysteryLauncherProperty ], ( mysteryOrCustom, mysteryLauncher ) => {

      // The color array is 0-indexed and the custom launcher is listed last
      this.updateMysteryLauncher( mysteryOrCustom === 'custom' ? 7 : mysteryLauncher.launcherNumber );
      this.launcherFrameFront.opacity = mysteryOrCustom === 'custom' ? 0.2 : 1; // Do not set invisible because of 60 degree launch.

      // Only show the label node for mystery launchers
      this.labelNode.visible = mysteryOrCustom === 'mystery';
    } );

    launcherMechanismProperty.link( launcherType => {
      launcherTypeIcon.image = CustomLauncherNode.getImageKeyForCustomLauncherMechanism( launcherType );
      launcherTypeIcon.rotation = launcherType === LauncherMechanism.SPRING ? 0 : -Math.PI / 2;
      launcherTypeIcon.centerX = 0;
      launcherTypeIcon.centerY = 0;

      pressureNeedleNode.visible = launcherType === LauncherMechanism.PRESSURE;
    } );

    latestLaunchSpeedProperty.lazyLink( launchSpeed => {

      // Do not update the pressure needle when latestLaunchSpeedProperty is reset or if the mechanism is not pressure.
      if ( launchSpeed > 0 && launcherMechanismProperty.value === LauncherMechanism.PRESSURE ) {

        // Give the needle a rotation independent of the speed standard deviation, to prevent the needle from rotating too much.
        const needleDeltaAnglePerSD = 5; // degrees
        const meanSpeed = launcherMechanismProperty.value.speedMeanProperty.value;
        const needleDeltaAngle = ( launchSpeed - meanSpeed ) / launcherMechanismProperty.value.speedStandardDeviationProperty.value * needleDeltaAnglePerSD;
        pressureNeedleNode.rotation = Utils.toRadians( needleDeltaAngle ) - Math.PI / 2;
      }
    } );
  }

  private getAngleStabilizers( launcherOrientation: LauncherOrientation, separationWidth: number ): Node {

    // Subtract the angle of the launcher from 180 to get the central angle of the angle stabilizer.
    const centralAngle = Utils.toRadians( 180 - MEAN_LAUNCH_ANGLES[ launcherOrientation ] );

    // The minimum gap is angle of an arc length LAUNCH_ANGLE_LIMITER_WIDTH at radius GUIDE_RAIL_OUTER_RADIUS
    const minimumStabilizerGap = LAUNCH_ANGLE_LIMITER_WIDTH / GUIDE_RAIL_OUTER_RADIUS;
    const angleOffsetRadians = 0.6 * minimumStabilizerGap + Utils.toRadians( separationWidth );
    const topInnerAngle = centralAngle + angleOffsetRadians;
    const bottomInnerAngle = centralAngle - angleOffsetRadians;

    const topInnerArc = new Shape().arc( 0, 0, GUIDE_RAIL_OUTER_RADIUS - GUIDE_RAIL_OUTER_CUTOFF, topInnerAngle, GUIDE_RAIL_MAX_ANGLE )
      .lineTo( 0, 0 ).close();
    const topOuterArc = new Shape().arc( 0, 0, GUIDE_RAIL_OUTER_RADIUS, topInnerAngle, GUIDE_RAIL_MAX_ANGLE )
      .lineTo( 0, 0 ).close();
    const topArc = topOuterArc.shapeDifference( topInnerArc );

    const bottomInnerArc = new Shape().arc( 0, 0, GUIDE_RAIL_OUTER_RADIUS - GUIDE_RAIL_OUTER_CUTOFF, GUIDE_RAIL_MIN_ANGLE, bottomInnerAngle )
      .lineTo( 0, 0 ).close();
    const bottomOuterArc = new Shape().arc( 0, 0, GUIDE_RAIL_OUTER_RADIUS, GUIDE_RAIL_MIN_ANGLE, bottomInnerAngle )
      .lineTo( 0, 0 ).close();
    const bottomArc = bottomOuterArc.shapeDifference( bottomInnerArc );

    const angleStabilizerTop = new Path( topArc, { fill: 'black' } );
    const angleStabilizerBottom = new Path( bottomArc, { fill: 'black' } );
    return new Node( { children: [ angleStabilizerTop, angleStabilizerBottom ] } );
  }

  private static getImageKeyForCustomLauncherMechanism( customLauncherType: LauncherMechanism ): HTMLImageElement {
    return customLauncherType === LauncherMechanism.SPRING ? spring_svg :
           customLauncherType === LauncherMechanism.PRESSURE ? pressureWithoutNeedle_png :
           explosion_svg;
  }
}

projectileDataLab.register( 'CustomLauncherNode', CustomLauncherNode );