// Copyright 2023-2025, University of Colorado Boulder

/**
 * The Field is the area where projectiles are launched and land. Each Field manages its own orientation, sequencing,
 * and projectiles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import optionize from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Color from '../../../../scenery/js/util/Color.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import PhetioIDUtils from '../../../../tandem/js/PhetioIDUtils.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceArrayIO from '../../../../tandem/js/types/ReferenceArrayIO.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import launch_mp3 from '../../../sounds/launch_mp3.js';
import projectileDataLab from '../../projectileDataLab.js';
import PDLConstants from '../PDLConstants.js';
import PDLPreferences from '../PDLPreferences.js';
import Launcher from './Launcher.js';
import { LauncherOrientation, LauncherOrientationValues, MEAN_LAUNCH_ANGLES } from './LauncherOrientation.js';
import Projectile from './Projectile.js';
import ProjectileType, { CANNONBALL, PIANO, PUMPKIN } from './ProjectileType.js';
import { screenIdentifierForScreenTandemName } from './ScreenIdentifier.js';

const launchSoundClip = new SoundClip( launch_mp3, { initialOutputLevel: 0.2 } );
soundManager.addSoundGenerator( launchSoundClip );

type SelfOptions = {

  // Only instrument the launcher orientation Property in VSM screens.
  isLauncherOrientationPhetioInstrumented: boolean;

  // Only instrument the projectile type Property in VSM screens.
  isProjectileTypePhetioInstrumented: boolean;

  // Only instrument the launch height Property in VSM screens.
  isLaunchHeightPhetioInstrumented: boolean;
};
export type FieldOptions = SelfOptions & WithRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class Field extends PhetioObject {

  // Indicates which LauncherOrientation is currently in effect. Please see LauncherOrientation for more details.
  public readonly launcherOrientationProperty: Property<LauncherOrientation>;

  // Specifies the type of projectile being used.
  public readonly projectileTypeProperty: Property<ProjectileType>;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // These values are DynamicProperties that are determined by the Launcher, see Launcher.ts and implementation-notes.md

  // Specifies the average speed of launched projectiles
  public readonly meanSpeedProperty: TReadOnlyProperty<number>;

  // Specifies the speed standard deviation for launched projectiles.
  public readonly standardDeviationSpeedProperty: TReadOnlyProperty<number>;

  // Indicates the current value for the standard deviation of the angle of launch.
  public readonly standardDeviationAngleProperty: TReadOnlyProperty<number>;

  // Indicates the current value for the angle stabilizer.
  public readonly angleStabilityProperty: DynamicProperty<number, number, Launcher>;

  // End of DynamicProperties
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Launcher angle average is the configured number of degrees between the launcher and the horizontal axis.
  public readonly meanAngleProperty: TReadOnlyProperty<number>;

  // Launcher height is the vertical distance between the launch point and the origin, in field units.
  public readonly launchHeightProperty: TReadOnlyProperty<number>;

  // True if the continuous mode is set to launching or false if not launching
  public readonly isContinuousLaunchingProperty: Property<boolean>;

  // An array of projectiles that are currently in the air. Note: No projectile should be in the airborneProjectiles and landedProjectiles array simultaneously.
  public readonly airborneProjectiles: Projectile[] = [];

  // An array of projectiles that have landed.
  public readonly landedProjectiles: Projectile[] = [];

  // Broad Emitter for when the projectiles have changed.
  public readonly projectilesChangedEmitter = new Emitter();

  // Emitter for when a projectile has landed.
  public readonly projectileLandedEmitter: Emitter<[ Projectile ]>;

  // Emitter for when projectiles have been cleared.
  public readonly projectilesClearedEmitter: Emitter;

  // Property for the selected sample number.
  protected readonly abstract selectedSampleNumberProperty: NumberProperty;

  // Are there any landed projectiles in the field? This is used for the data indicator on the field selector panel.
  public readonly isContainingDataProperty = new BooleanProperty( false );

  // Unique identifier for the Field
  protected readonly abstract identifier: string;

  protected constructor(
    //
    // The launchers available to be used on this Field
    public readonly launchers: readonly Launcher[],
    //
    // Property that indicates the active Launcher
    public readonly launcherProperty: Property<Launcher>,
    //
    // The color associated with this Field. Shown on the grass and in the sign.
    public readonly color: Color,
    providedOptions: FieldOptions ) {
    const options = optionize<FieldOptions, SelfOptions, PhetioObjectOptions>()( {
      phetioType: Field.FieldIO,
      phetioState: true
    }, providedOptions );

    super( options );

    this.projectileLandedEmitter = new Emitter<[ Projectile ]>( {
      parameters: [ {
        name: 'projectile',
        valueType: Projectile,
        phetioType: Projectile.ProjectileIO
      } ],
      tandem: options.tandem.createTandem( 'projectileLandedEmitter' ),

      // We must update the arrays before anything else, see below.
      hasListenerOrderDependencies: true
    } );

    const updateIsContainingDataProperty = () => {
      this.isContainingDataProperty.value = this.landedProjectiles.length > 0;
    };

    this.projectileLandedEmitter.addListener( projectile => {

      assert && assert( this.airborneProjectiles.includes( projectile ), 'projectile should be in airborneProjectiles' );
      assert && assert( !this.landedProjectiles.includes( projectile ), 'projectile should be in airborneProjectiles' );

      arrayRemove( this.airborneProjectiles, projectile );
      this.landedProjectiles.push( projectile );

      updateIsContainingDataProperty();
    } );

    // Update after phet-io state set
    phetioStateSetEmitter.addListener( updateIsContainingDataProperty );

    this.projectilesClearedEmitter = new Emitter();

    this.projectilesClearedEmitter.addListener( updateIsContainingDataProperty );

    const launcherOrientationOptions = options.isLauncherOrientationPhetioInstrumented ? {
      validValues: LauncherOrientationValues,
      tandem: providedOptions.tandem.createTandem( 'launcherOrientationProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property configures the height and mean launch angle of the launcher.',
      phetioValueType: StringUnionIO( LauncherOrientationValues )
    } : { validValues: [ 'angle30' ] } as const;

    this.launcherOrientationProperty = new StringUnionProperty<LauncherOrientation>( 'angle30', launcherOrientationOptions );

    const projectileTypeOptions = options.isProjectileTypePhetioInstrumented ? {
      validValues: [ CANNONBALL, PUMPKIN, PIANO ],
      tandem: providedOptions.tandem.createTandem( 'projectileTypeProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property configures the type of projectile.',
      phetioValueType: ProjectileType.ProjectileTypeIO
    } : { validValues: [ CANNONBALL ] } as const;

    this.projectileTypeProperty = new Property<ProjectileType>( CANNONBALL, projectileTypeOptions );

    this.meanAngleProperty = new DerivedProperty( [ this.launcherOrientationProperty ],
      orientation => MEAN_LAUNCH_ANGLES[ orientation ] );

    this.meanSpeedProperty = new DynamicProperty<number, number, Launcher>( this.launcherProperty, {
      bidirectional: true,
      derive: launcher => launcher.meanLaunchSpeedProperty
    } );

    this.standardDeviationSpeedProperty = new DynamicProperty<number, number, Launcher>( this.launcherProperty, {
      bidirectional: true,
      derive: launcher => launcher.standardDeviationSpeedProperty
    } );

    this.angleStabilityProperty = new DynamicProperty<number, number, Launcher>( this.launcherProperty, {
      bidirectional: true,
      derive: launcher => launcher.angleStabilityProperty
    } );

    this.standardDeviationAngleProperty = new DynamicProperty<number, number, Launcher>( this.launcherProperty, {
      derive: launcher => launcher.standardDeviationAngleProperty
    } );

    this.launchHeightProperty = new DerivedProperty( [ this.launcherOrientationProperty ], orientation => {
      return orientation === 'angle0Raised' ? PDLConstants.RAISED_LAUNCHER_HEIGHT : 0;
    }, {
      tandem: providedOptions.isLaunchHeightPhetioInstrumented ? providedOptions.tandem.createTandem( 'launchHeightProperty' ) : Tandem.OPT_OUT,
      phetioDocumentation: 'This Property is the initial height of launched projectiles in meters.',
      phetioValueType: NumberIO,
      units: 'm'
    } );

    this.isContinuousLaunchingProperty = new BooleanProperty( false, {
      tandem: providedOptions.tandem.createTandem( 'isContinuousLaunchingProperty' ),
      phetioReadOnly: true
    } );

    // On startup and when the auto-generate data preference is changed, make sure that continuous launching is off.
    PDLPreferences.autoGenerateDataProperty.link( () => {
      this.isContinuousLaunchingProperty.value = false;
    } );
  }

  protected getTotalProjectileCount(): number {
    return this.airborneProjectiles.length + this.landedProjectiles.length;
  }

  public getAllProjectiles(): Projectile[] {
    return [ ...this.airborneProjectiles, ...this.landedProjectiles ];
  }

  public reset(): void {
    this.isContinuousLaunchingProperty.reset();

    this.launcherOrientationProperty.reset();
    this.projectileTypeProperty.reset();

    this.angleStabilityProperty.reset();
    this.launcherProperty.reset();

    this.clearProjectiles();
  }

  public clearProjectiles(): void {
    this.airborneProjectiles.length = 0;
    this.landedProjectiles.length = 0;

    this.projectilesChangedEmitter.emit();
    this.projectilesClearedEmitter.emit();

    this.selectedSampleNumberProperty.reset();
  }

  /**
   * Generates a new Projectile object with calculated launch parameters and randomized properties.
   *
   * @param sampleNumber - The number (1-indexed) of the sample that the Projectile will belong to.
   * @param playLaunchSound - Determines if a launch sound should be played. Note that no sound is played if the data is being auto-generated.
   * @returns The newly created Projectile object.
   */
  protected createProjectile( sampleNumber: number, playLaunchSound: boolean ): Projectile {
    const chooseRandomizedLaunchAngle = () => {
      const angleDeviation = dotRandom.nextGaussian() * this.standardDeviationAngleProperty.value;
      return this.meanAngleProperty.value + angleDeviation;
    };

    let launchAngle = chooseRandomizedLaunchAngle();

    // If the launcher is raised, we allow negative angles, and the probability of an angle above 90 degrees is negligible.
    if ( this.launcherOrientationProperty.value !== 'angle0Raised' ) {

      // Do not allow more than 100 iterations to avoid an infinite loop if something changes in the future.
      let iterationCount = 0;

      // Do not allow angles greater than 90 degrees or negative angles
      while ( iterationCount < 100 && ( launchAngle <= 0 || launchAngle >= 90 ) ) {
        launchAngle = chooseRandomizedLaunchAngle();
        iterationCount++;
      }
    }

    const speedMultiplier = PDLPreferences.projectileTypeAffectsSpeedProperty.value ? this.projectileTypeProperty.value.speedMultiplierProperty.value : 1;

    const meanLaunchSpeed = speedMultiplier * this.meanSpeedProperty.value;

    let launchSpeed = meanLaunchSpeed + dotRandom.nextGaussian() * this.standardDeviationSpeedProperty.value;

    // Do not allow negative speeds
    while ( launchSpeed <= 0 ) {
      launchSpeed = meanLaunchSpeed + dotRandom.nextGaussian() * this.standardDeviationSpeedProperty.value;
    }

    const landedImageIndex = dotRandom.nextInt( 3 );

    // If the projectile type is not a cannonball, set isFlippedHorizontally randomly
    const isFlippedHorizontally = this.projectileTypeProperty.value === CANNONBALL ? false : dotRandom.nextBoolean();

    const screenPhetioID = PhetioIDUtils.getScreenID( this.phetioID )!;
    const screenTandemName = PhetioIDUtils.getComponentName( screenPhetioID );
    const screenIdentifier = screenIdentifierForScreenTandemName( screenTandemName );

    const launcher = this.launcherProperty.value;

    const launchSoundStrategy = PDLPreferences.launchSoundStrategyProperty.value;

    if ( playLaunchSound && launchSoundStrategy !== 'none' && !PDLPreferences.autoGenerateDataProperty.value ) {

      const playbackRateForLaunchSpeed = Utils.linear( 20, 30, 0.3, 1, launchSpeed );
      const playbackRateForLaunchAngle = Utils.linear( -30, 90, 0.25, 1.2, launchAngle );

      const playbackRate = launchSoundStrategy === 'speed' ? playbackRateForLaunchSpeed : playbackRateForLaunchAngle;
      const playbackRateClamped = Utils.clamp( playbackRate, 0.3, 1.2 );

      launchSoundClip.setPlaybackRate( playbackRateClamped );
      launchSoundClip.play();
    }

    return new Projectile(
      screenIdentifier,
      this.identifier,
      sampleNumber,
      this.launcherOrientationProperty.value,
      launcher,
      launcher.launcherMechanismProperty.value,
      this.standardDeviationAngleProperty.value,
      0,
      this.launchHeightProperty.value,
      this.projectileTypeProperty.value,
      isFlippedHorizontally,
      landedImageIndex,
      0,
      launchAngle,
      launchSpeed,
      this.launchHeightProperty.value );
  }

  protected stepAirborneProjectiles( dt: number ): void {

    // If any projectiles were airborne at the beginning of the step, repaint the canvas at the end
    const numInitialAirborneProjectiles = this.airborneProjectiles.length;

    this.airborneProjectiles.forEach( projectile => {
      projectile.step( this, dt );
    } );

    // Repaint if any projectiles were airborne at the beginning of the step
    if ( numInitialAirborneProjectiles ) {
      this.projectilesChangedEmitter.emit();
    }
  }

  /**
   * For serialization, the FieldIO uses reference type serialization. That is, each Field exists for the life of the
   * simulation, and when we save the state of the simulation, we save the current state of the Field.
   *
   * The Field serves as a composite container of ParticleIO instances. They are divided into airborneProjectiles and
   * landedProjectiles, each an array of ProjectileIO. The Projectiles are serialized using data-type serialization.
   * For deserialization, the Projectiles are deserialized (again, using data-type serialization) and applied to the
   * Field in its applyState method.
   *
   * In this simulation, the data and statistical measures are computed solely based on the landedProjectiles, so the
   * serialization separates the projectiles into the airborne vs landed projectiles.
   *
   * Please see https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * for more information on the different serialization types.
   */
  public static readonly FieldIO = new IOType<Field, IntentionalAny>( 'FieldIO', {
    valueType: Field,
    documentation: 'A field in the Projectile Data Lab. This contains the state for the projectiles, separated into airborne and landed projectiles.',
    stateSchema: {
      airborneProjectiles: ReferenceArrayIO( Projectile.ProjectileIO ),
      landedProjectiles: ReferenceArrayIO( Projectile.ProjectileIO )
    }
  } );
}

projectileDataLab.register( 'Field', Field );