// Copyright 2023-2024, University of Colorado Boulder

/**
 * Projectile is the model for a projectile in the Projectile Data Lab. It contains information about a projectile's
 * projectile type, launch angle, launch speed, initial height. This data structure was developed with PhET-iO in mind,
 * note that Projectile itself does not extend PhetioObject, but rather is serialized in Field.ts. We chose a flat
 * data structure for the Projectile model to keep the PhET-iO usages sites simpler. Note that many Projectile instances
 * are created during a simulation runtime and performance is important. Note that disposal is not necessary because
 * the instances are not long-lived, and do not add listeners to the outside object graph. This uses data type
 * serialization.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import projectileDataLab from '../../projectileDataLab.js';
import PDLConstants from '../PDLConstants.js';
import PDLPreferences from '../PDLPreferences.js';
import Field from './Field.js';
import Launcher from './Launcher.js';
import { LauncherOrientation, LauncherOrientationValues } from './LauncherOrientation.js';
import ProjectileSound from './ProjectileSound.js';
import ProjectileType from './ProjectileType.js';
import { ScreenIdentifier, ScreenIdentifierValues } from './ScreenIdentifier.js';

export default class Projectile {

  // PhET-iO Clients need a way to distinguish between different screens that a Projectile can be launched on, so the
  // ScreenIdentifier is tracked as an intrinsic part of the Projectile model, rather than something that must be
  // tracked extrinsically.
  private screenIdentifier: ScreenIdentifier;

  private fieldIdentifier: string;

  public launcherOrientation: LauncherOrientation;

  public launcherStandardDeviationAngle: number;
  public launcherMechanism: LauncherMechanism;

  public launcher: Launcher;

  // The x and y coordinates of the projectile relative to the launch position, in meters
  public x: number;
  public y: number;

  // timeAirborne is the time the projectile has been airborne since launch, in seconds
  public timeAirborne: number;

  // The type of the projectile - cannonball, pumpkin or piano
  public type: ProjectileType;

  // Initial angle of the projectile in degrees
  public launchAngle: number;

  // Initial speed of the projectile in meters per second
  public launchSpeed: number;

  // Initial height of the projectile in meters
  public launchHeight: number;

  // The sample number associated with this projectile
  public sampleNumber: number;

  // The horizontal scale of the projectile, 1 for un-flipped, -1 for flipped
  public isFlippedHorizontally: boolean;

  // The index of the image to display when the projectile has landed
  public landedImageIndex: number;

  public constructor(
    screenIdentifier: ScreenIdentifier,
    fieldIdentifier: string,
    sampleNumber: number,
    launcherOrientation: LauncherOrientation,
    launcher: Launcher,
    launcherMechanism: LauncherMechanism,
    launcherStandardDeviationAngle: number,
    x: number,
    y: number,
    type: ProjectileType,
    isFlippedHorizontally: boolean,
    landedImageIndex: number,
    timeAirborne: number,
    launchAngle: number,
    launchSpeed: number,
    launchHeight: number
  ) {

    assert && assert( sampleNumber >= 1, `Invalid sampleNumber: ${sampleNumber}` );

    this.screenIdentifier = screenIdentifier;
    this.fieldIdentifier = fieldIdentifier;
    this.sampleNumber = sampleNumber;
    this.launcherOrientation = launcherOrientation;
    this.launcher = launcher;
    this.launcherStandardDeviationAngle = launcherStandardDeviationAngle;
    this.launcherMechanism = launcherMechanism;
    this.x = x;
    this.y = y;
    this.type = type;
    this.isFlippedHorizontally = isFlippedHorizontally;
    this.landedImageIndex = landedImageIndex;
    this.timeAirborne = timeAirborne;
    this.launchAngle = launchAngle;
    this.launchSpeed = launchSpeed;
    this.launchHeight = launchHeight;
  }

  public step( field: Field, dt: number ): void {
    this.timeAirborne += dt;

    this.x = Projectile.getProjectileX( this.launchSpeed, this.launchAngle, this.timeAirborne );
    this.y = Projectile.getProjectileY( this.launchSpeed, this.launchAngle, this.launchHeight, this.timeAirborne )!;

    if ( this.y <= 0 ) {
      this.setLanded();
      field.projectileLandedEmitter.emit( this );

      if ( PDLPreferences.playLandingSoundProperty.value ) {
        ProjectileSound.play( this.type, this.x, true );
      }
    }
  }

  public setLanded(): void {
    this.timeAirborne = Projectile.getTotalFlightTime( this.launchSpeed, this.launchAngle, this.launchHeight );
    this.x = Projectile.getHorizontalRange( this.launchSpeed, this.launchAngle, this.launchHeight );
    this.y = 0;
  }

  /**
   * Individual Projectile instances are not PhET-iO Instrumented. Instead, the Field that contains the Projectiles
   * calls ProjectileIO.toStateObject to serialize the Projectile instances. FieldIO uses reference type serialization
   * as a composite of the Projectiles, which use data type serialization.
   *
   * Please see https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * for more information on the different serialization types.
   */
  public static readonly ProjectileIO = new IOType<Projectile, ProjectileStateObject>( 'ProjectileIO', {
    valueType: Projectile,
    stateSchema: {
      screenIdentifier: StringUnionIO( ScreenIdentifierValues ),
      fieldIdentifier: StringIO,
      sampleNumber: NumberIO,
      launcherOrientation: StringUnionIO( LauncherOrientationValues ),
      launcher: ReferenceIO( IOType.ObjectIO ),
      launcherMechanism: LauncherMechanism.LauncherMechanismIO,
      launcherStandardDeviationAngle: NumberIO,
      x: NumberIO,
      y: NumberIO,
      type: ProjectileType.ProjectileTypeIO,
      isFlippedHorizontally: BooleanIO,
      landedImageIndex: NumberIO,
      timeAirborne: NumberIO,
      launchAngle: NumberIO,
      launchSpeed: NumberIO,
      launchHeight: NumberIO
    },
    fromStateObject: ( stateObject: ProjectileStateObject ) => {
      return new Projectile(
        stateObject.screenIdentifier,
        stateObject.fieldIdentifier,
        stateObject.sampleNumber,
        stateObject.launcherOrientation,
        ReferenceIO( IOType.ObjectIO ).fromStateObject( stateObject.launcher ) as Launcher,
        LauncherMechanism.LauncherMechanismIO.fromStateObject( stateObject.launcherMechanism ),
        stateObject.launcherStandardDeviationAngle,
        stateObject.x,
        stateObject.y,
        ProjectileType.ProjectileTypeIO.fromStateObject( stateObject.type ),
        stateObject.isFlippedHorizontally,
        stateObject.landedImageIndex,
        stateObject.timeAirborne,
        stateObject.launchAngle,
        stateObject.launchSpeed,
        stateObject.launchHeight
      );
    }
  } );

  /** Physics functions - The PDL sim does not have air resistance, so 2D kinematics is sufficient to model the motion **/

  public static getProjectileX( launchSpeed: number, launchAngle: number, timeAirborne: number ): number {
    return launchSpeed * Math.cos( Utils.toRadians( launchAngle ) ) * timeAirborne;
  }

  public static getProjectileY( launchSpeed: number, launchAngle: number, launchHeight: number, timeAirborne: number ): number {
    return launchHeight + launchSpeed * Math.sin( Utils.toRadians( launchAngle ) ) * timeAirborne
           - 0.5 * PDLConstants.FREEFALL_ACCELERATION * timeAirborne * timeAirborne;
  }

  private static getHorizontalRange( launchSpeed: number, launchAngle: number, launchHeight: number ): number {
    const g = PDLConstants.FREEFALL_ACCELERATION;
    const v0 = launchSpeed;
    const launchAngleRadians = Utils.toRadians( launchAngle );
    const sinTheta = Math.sin( launchAngleRadians );
    const cosTheta = Math.cos( launchAngleRadians );

    return ( v0 * cosTheta / g ) * ( v0 * sinTheta + Math.sqrt( v0 * v0 * sinTheta * sinTheta + 2 * g * launchHeight ) );
  }

  private static getTotalFlightTime( launchSpeed: number, launchAngle: number, launchHeight: number ): number {
    const g = PDLConstants.FREEFALL_ACCELERATION;
    const v0 = launchSpeed;
    const sinTheta = Math.sin( Utils.toRadians( launchAngle ) );
    return ( v0 * sinTheta / g ) + Math.sqrt( ( v0 * sinTheta / g ) * ( v0 * sinTheta / g ) + 2 * launchHeight / g );
  }
}

export type ProjectileStateObject = {
  screenIdentifier: ScreenIdentifier;
  fieldIdentifier: string;
  sampleNumber: number;
  launcherOrientation: LauncherOrientation;
  launcher: ReferenceIOState;
  launcherMechanism: LauncherMechanism;
  launcherStandardDeviationAngle: number;
  x: number;
  y: number;
  type: ProjectileType;
  isFlippedHorizontally: boolean;
  landedImageIndex: number;
  timeAirborne: number;
  launchAngle: number;
  launchSpeed: number;
  launchHeight: number;
};

projectileDataLab.register( 'Projectile', Projectile );