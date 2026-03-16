// Copyright 2023-2024, University of Colorado Boulder

/**
 * The MeasuresField is an extension of the Field class that adds fields for the Measures model.
 * These fields will keep track of the average distance and standard deviation of distance for landed projectiles.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import SMField, { SMFieldOptions } from '../../common-vsm/model/SMField.js';
import { VSMFieldIdentifier } from '../../common-vsm/model/VSMFieldIdentifier.js';
import Launcher, { MYSTERY_LAUNCHERS } from '../../common/model/Launcher.js';
import { MysteryOrCustom, MysteryOrCustomValues } from '../../common/model/MysteryOrCustom.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
export type MeasuresFieldOptions = SelfOptions & StrictOmit<SMFieldOptions, 'isLauncherPropertyPhetioReadOnly'>;

export default class MeasuresField extends SMField {

  // This Property represents the average distance (horizontal displacement) of landed projectiles.
  // If it is null, it means there is not enough data to compute the value.
  public readonly meanDistanceProperty: Property<number | null>;

  // This Property represents the standard deviation of the distance (horizontal displacement) of landed projectiles.
  // If it is null, it means there is not enough data to compute the value.
  public readonly standardDeviationDistanceProperty: Property<number | null>;

  // This Property represents the standard error of the mean distance (horizontal displacement) of landed projectiles.
  // If it is null, it means there is not enough data to compute the value.
  public readonly standardErrorDistanceProperty: Property<number | null>;

  // This Property represents whether the launcher is custom or mystery.
  public readonly mysteryOrCustomProperty: Property<MysteryOrCustom>;

  // This Property represents the mystery launcher.
  public readonly mysteryLauncherProperty: Property<Launcher>;

  public constructor( launchers: readonly Launcher[], identifier: VSMFieldIdentifier, providedOptions: MeasuresFieldOptions ) {
    const options = optionize<MeasuresFieldOptions, SelfOptions, SMFieldOptions>()( {
      isLauncherPropertyPhetioReadOnly: true
    }, providedOptions );

    super( launchers, identifier, options );

    this.mysteryOrCustomProperty = new StringUnionProperty<MysteryOrCustom>( 'mystery', {
      tandem: providedOptions.tandem.createTandem( 'mysteryOrCustomProperty' ),
      phetioDocumentation: 'This Property represents whether the launcher is a mystery or custom launcher.',
      validValues: MysteryOrCustomValues,
      phetioFeatured: true
    } );

    this.mysteryLauncherProperty = new Property( MYSTERY_LAUNCHERS[ 0 ], {
      tandem: providedOptions.tandem.createTandem( 'mysteryLauncherProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO ),
      validValues: MYSTERY_LAUNCHERS,
      phetioFeatured: true
    } );

    this.meanDistanceProperty = new Property<number | null>( null, {
      tandem: providedOptions.tandem.createTandem( 'meanDistanceProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.standardDeviationDistanceProperty = new Property<number | null>( null, {
      tandem: providedOptions.tandem.createTandem( 'standardDeviationDistanceProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.standardErrorDistanceProperty = new Property<number | null>( null, {
      tandem: providedOptions.tandem.createTandem( 'standardErrorDistanceProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.projectileLandedEmitter.addListener( () => {
      this.meanDistanceProperty.value = _.mean( this.landedProjectiles.map( landedProjectile => landedProjectile.x ) );
      const standardDeviation = this.getStandardDeviationDistance();
      this.standardDeviationDistanceProperty.value = standardDeviation;
      this.standardErrorDistanceProperty.value = standardDeviation === null ? null : standardDeviation / Math.sqrt( this.landedProjectiles.length );
    } );

    // if the user changes the mystery launcher, set the launcher Property to the corresponding launcher
    Multilink.multilink( [ this.mysteryLauncherProperty, this.mysteryOrCustomProperty ], ( mysteryLauncher, mysteryOrCustom ) => {

      this.launcherProperty.value = this.launchers.find( launcher => {

        // There is only one custom launcher per field, so we can safely take the first match in that case
        if ( mysteryOrCustom === 'custom' ) {
          return launcher.mysteryOrCustom === 'custom';
        }
        else {
          return launcher === mysteryLauncher;
        }
      } )!;
    } );
  }

  private getStandardDeviationDistance(): number | null {
    let sum = 0;
    let count = 0;
    const average = _.mean( this.landedProjectiles.map( landedProjectile => landedProjectile.x ) );
    this.landedProjectiles.forEach( landedProjectile => {
      assert && assert( average !== null, 'average should not be null' );
      sum += Math.pow( landedProjectile.x - average, 2 );
      count++;
    } );
    return count > 1 ? Math.sqrt( sum / ( count - 1 ) ) : null;
  }

  public override clearProjectiles(): void {
    super.clearProjectiles();
    this.meanDistanceProperty.value = null;
    this.standardDeviationDistanceProperty.value = null;
    this.standardErrorDistanceProperty.value = null;
  }

  public override reset(): void {
    super.reset();

    //Reset all launchers
    this.launchers.forEach( launcher => launcher.reset() );

    this.mysteryOrCustomProperty.reset();
    this.mysteryLauncherProperty.reset();
  }
}

projectileDataLab.register( 'MeasuresField', MeasuresField );