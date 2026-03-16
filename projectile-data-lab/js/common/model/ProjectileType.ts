// Copyright 2023-2025, University of Colorado Boulder

/**
 * Type that describes the projectile object, which affects the speed multiplier for the launch of the projectile.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import projectileDataLab from '../../projectileDataLab.js';

export default class ProjectileType extends PhetioObject {
  public readonly speedMultiplierProperty: NumberProperty;

  public constructor( tandem: Tandem, speedMultiplier: number ) {

    super( {
      tandem: tandem,
      phetioType: ProjectileType.ProjectileTypeIO,
      phetioState: false
    } );

    this.speedMultiplierProperty = new NumberProperty( speedMultiplier, {
      tandem: tandem.createTandem( 'speedMultiplierProperty' ),
      phetioFeatured: true,
      range: new Range( 0.5, 1.2 ),
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      phetioDocumentation: 'The multiplier for the mean launch speed for this projectile type'
    } );
  }

  /**
   * ProjectileTypeIO handles PhET-iO serialization of the ProjectileType. Since all ProjectileTypes are created
   * at startup and exist for the lifetime of the simulation, it implements 'Reference type serialization', as described in the
   * Serialization section of https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  public static readonly ProjectileTypeIO = new IOType<ProjectileType, IntentionalAny>( 'ProjectileTypeIO', {
    valueType: ProjectileType,
    documentation: 'The type of object being launched.',
    supertype: ReferenceIO( IOType.ObjectIO )
  } );
}

projectileDataLab.register( 'ProjectileType', ProjectileType );

export const CANNONBALL = new ProjectileType( Tandem.GLOBAL_MODEL.createTandem( 'projectileTypes' ).createTandem( 'cannonball' ), 1 );
export const PUMPKIN = new ProjectileType( Tandem.GLOBAL_MODEL.createTandem( 'projectileTypes' ).createTandem( 'pumpkin' ), 1.1 );
export const PIANO = new ProjectileType( Tandem.GLOBAL_MODEL.createTandem( 'projectileTypes' ).createTandem( 'piano' ), 0.9 );