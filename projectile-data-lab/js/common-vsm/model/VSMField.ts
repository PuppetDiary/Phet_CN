// Copyright 2023-2025, University of Colorado Boulder

/**
 * The VSMField is an extension of the Field class that adds fields for the VSM models. It contains the model properties
 * and methods to support the launcher, continuous launch timing, speed tool, angle tool, and projectile selector on the associated field.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import Field, { FieldOptions } from '../../common/model/Field.js';
import Launcher from '../../common/model/Launcher.js';
import PDLEventTimer from '../../common/model/PDLEventTimer.js';
import Projectile from '../../common/model/Projectile.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLQueryParameters from '../../common/PDLQueryParameters.js';
import PDLUtils from '../../common/PDLUtils.js';
import projectileDataLab from '../../projectileDataLab.js';
import { VSMFieldIdentifier, VSMFieldIdentifierValues } from './VSMFieldIdentifier.js';

type SelfOptions = {

  // On the Measures screen, the launcher Property is read-only, because the value is determined by the combination
  // of the mysteryOrCustomProperty and mysteryLauncherProperty.
  isLauncherPropertyPhetioReadOnly: boolean;
};
export type VSMFieldOptions = SelfOptions & StrictOmit<FieldOptions, 'isLauncherOrientationPhetioInstrumented' | 'isProjectileTypePhetioInstrumented' | 'isLaunchHeightPhetioInstrumented'>;

export default class VSMField extends Field {

  // The most recent launch angle on this field, in degrees
  public readonly latestLaunchAngleProperty: Property<number>;

  // The most recent speed of a projectile launched by the launcher, in meters per second
  public readonly latestLaunchSpeedProperty: Property<number>;

  public readonly continuousLaunchTimer;

  public readonly selectedProjectileNumberProperty: NumberProperty;
  public readonly selectedProjectileProperty: TReadOnlyProperty<Projectile | null>;

  public readonly projectileLaunchedEmitter = new Emitter<[ Projectile ]>( {
    parameters: [ {
      name: 'projectile',
      valueType: Projectile
    } ]
  } );
  public readonly numberOfLandedProjectilesProperty: NumberProperty;
  public readonly totalProjectileCountProperty: NumberProperty;

  protected override selectedSampleNumberProperty = new NumberProperty( 1 );

  public constructor( launchers: readonly Launcher[], protected readonly identifier: VSMFieldIdentifier, providedOptions: VSMFieldOptions ) {

    const options = optionize<VSMFieldOptions, SelfOptions, FieldOptions>()( {
      isLauncherOrientationPhetioInstrumented: true,
      isProjectileTypePhetioInstrumented: true,
      isLaunchHeightPhetioInstrumented: true
    }, providedOptions );

    const launcherProperty = new Property( launchers[ 0 ], {
      validValues: launchers,
      tandem: launchers.length === 1 ? Tandem.OPT_OUT : options.tandem.createTandem( 'launcherProperty' ),
      phetioFeatured: true,
      phetioReadOnly: options.isLauncherPropertyPhetioReadOnly,
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    super( launchers, launcherProperty, PDLUtils.colorForFieldIndex( VSMFieldIdentifierValues.indexOf( identifier ) ), options );
    this.continuousLaunchTimer = new PDLEventTimer( PDLConstants.MINIMUM_TIME_BETWEEN_LAUNCHES, options.tandem.createTandem( 'continuousLaunchTimer' ) );

    this.latestLaunchAngleProperty = new NumberProperty( this.meanAngleProperty.value, {
      tandem: providedOptions.tandem.createTandem( 'latestLaunchAngleProperty' ),
      phetioReadOnly: true,
      units: '\u00B0',
      phetioDocumentation: 'This Property is the current angle of the launcher, in degrees. When a projectile is launched, this property is set to the launch angle.'
                           + ' When the launcher orientation or angle stabilizer changes, this Property is set to the configured launch angle.',
      phetioFeatured: true
    } );

    this.latestLaunchSpeedProperty = new NumberProperty( 0, {
      tandem: providedOptions.tandem.createTandem( 'latestLaunchSpeedProperty' ),
      phetioReadOnly: true,
      units: 'm/s',
      phetioDocumentation: 'This Property is the latest launch speed, in meters per second. When a projectile is launched, this is set to the launch speed.',
      phetioFeatured: true
    } );

    this.selectedProjectileNumberProperty = new NumberProperty( 0, {
      phetioFeatured: true,
      tandem: providedOptions.tandem.createTandem( 'selectedProjectileNumberProperty' ),
      range: new Range( 0, PDLQueryParameters.maxProjectilesVSMField ),
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberType: 'Integer',
      phetioDocumentation: 'This Property is the number of the selected projectile, in order of landing. This number is 1-indexed, and 0 means no projectile is selected.'
    } );

    this.selectedProjectileProperty = new DerivedProperty( [ this.selectedProjectileNumberProperty ],
      highlightedProjectileNumber => {
        return this.landedProjectiles[ highlightedProjectileNumber - 1 ] || null;
      } );

    // A projectile is counted if it is landed or if it goes below y=0 meters (beyond the 100m mark horizontally)
    this.numberOfLandedProjectilesProperty = new NumberProperty( 0, {
      phetioFeatured: true,
      phetioDocumentation: 'This Property represents the number of projectiles that have landed.',
      tandem: options.tandem.createTandem( 'numberOfLandedProjectilesProperty' ),
      phetioReadOnly: true,
      phetioState: false,
      range: new Range( 0, PDLQueryParameters.maxProjectilesVSMField ),
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberType: 'Integer'
    } );
    this.totalProjectileCountProperty = new NumberProperty( 0 );

    this.projectileLandedEmitter.addListener( projectile => {

      // After a projectile lands, update the selected projectile number and the number of landed projectiles
      this.selectedProjectileNumberProperty.value = this.landedProjectiles.indexOf( projectile ) + 1;

      this.numberOfLandedProjectilesProperty.value = this.landedProjectiles.length;
    } );

    this.projectileLaunchedEmitter.addListener( () => {
      this.totalProjectileCountProperty.value = this.getTotalProjectileCount();
    } );

    phetioStateSetEmitter.addListener( () => {
      this.updateProjectileCounts();
    } );

    // If the selected projectile is changed, repaint the canvas even if time is paused
    this.selectedProjectileProperty.lazyLink( () => {
      this.projectilesChangedEmitter.emit();
    } );

    // If the launcher orientation is changed, re-center the launcher.
    this.meanAngleProperty.lazyLink( configuredLaunchAngle => {
      this.latestLaunchAngleProperty.value = configuredLaunchAngle;
    } );

    // If the angle standard deviation is changed, re-center the launcher so that there is no overlap between the two.
    this.standardDeviationAngleProperty.lazyLink( () => {
      this.latestLaunchAngleProperty.value = this.meanAngleProperty.value;
    } );
  }

  private updateProjectileCounts(): void {
    this.numberOfLandedProjectilesProperty.value = this.landedProjectiles.length;
    this.totalProjectileCountProperty.value = this.getTotalProjectileCount();
  }

  public launchProjectile(): void {
    if ( this.getTotalProjectileCount() >= PDLQueryParameters.maxProjectilesVSMField ) {
      return;
    }

    const projectile = this.createProjectile( 1, true );
    this.airborneProjectiles.push( projectile );

    this.latestLaunchAngleProperty.value = projectile.launchAngle;
    this.latestLaunchSpeedProperty.value = projectile.launchSpeed;

    this.projectileLaunchedEmitter.emit( projectile );
  }

  public createLandedProjectile(): void {

    const projectile = this.createProjectile( 1, false );

    this.airborneProjectiles.push( projectile );

    this.latestLaunchAngleProperty.value = projectile.launchAngle;
    this.latestLaunchSpeedProperty.value = projectile.launchSpeed;

    this.projectileLaunchedEmitter.emit( projectile );

    projectile.setLanded();

    this.projectileLandedEmitter.emit( projectile );
  }

  public step( dt: number ): void {
    this.stepAirborneProjectiles( dt );
  }

  public override reset(): void {
    super.reset();

    this.angleStabilityProperty.reset();
    this.continuousLaunchTimer.reset();
  }

  public override clearProjectiles(): void {
    super.clearProjectiles();

    // Reset the time elapsed since the last launch so that continuous mode can immediately launch a projectile
    this.continuousLaunchTimer.setZeroTimeRemaining();

    this.selectedProjectileNumberProperty.reset();

    this.numberOfLandedProjectilesProperty.reset();
    this.totalProjectileCountProperty.reset();

    this.latestLaunchAngleProperty.value = this.meanAngleProperty.value;
    this.latestLaunchSpeedProperty.reset();
  }
}

projectileDataLab.register( 'VSMField', VSMField );