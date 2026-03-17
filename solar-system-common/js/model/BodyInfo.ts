// Copyright 2023-2024, University of Colorado Boulder

/**
 * BodyInfo is a data structure that describes the configuration of an orbital body.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { NumberPropertyOptions } from '../../../axon/js/NumberProperty.js';
import Range, { RangeStateObject } from '../../../dot/js/Range.js';
import Vector2, { Vector2StateObject } from '../../../dot/js/Vector2.js';
import { Vector2PropertyOptions } from '../../../dot/js/Vector2Property.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = {
  isActive: boolean;
  mass: number;
  massPropertyOptions?: NumberPropertyOptions; // no PhET-iO serialization needed because all Body instances are created at startup
  massRange?: Range;
  position: Vector2;
  positionPropertyOptions?: Vector2PropertyOptions; // no PhET-iO serialization needed because all Body instances are created at startup
  velocity: Vector2;
  velocityPropertyOptions?: Vector2PropertyOptions; // no PhET-iO serialization needed because all Body instances are created at startup
  tandemName?: string | null;
};

export type BodyInfoOptions = SelfOptions;

// The serialized state of BodyInfo. For PhET-iO serialization, fields must have types that are JSON-compatible.
export type BodyInfoStateObject = {
  isActive: boolean;
  mass: number;
  massRange: RangeStateObject;
  position: Vector2StateObject;
  velocity: Vector2StateObject;
  tandemName: string | null;
};

export default class BodyInfo {

  public readonly isActive: boolean;
  public readonly mass: number;
  public readonly massPropertyOptions?: NumberPropertyOptions;
  public readonly massRange: Range;
  public readonly position: Vector2;
  public readonly positionPropertyOptions?: Vector2PropertyOptions;
  public readonly velocity: Vector2;
  public readonly velocityPropertyOptions?: Vector2PropertyOptions;
  public readonly tandemName: string | null;

  public constructor( providedOptions: BodyInfoOptions ) {
    this.isActive = providedOptions.isActive;
    this.mass = providedOptions.mass;
    this.massPropertyOptions = providedOptions.massPropertyOptions;
    this.massRange = providedOptions.massRange || SolarSystemCommonConstants.DEFAULT_MASS_RANGE;
    this.position = providedOptions.position;
    this.positionPropertyOptions = providedOptions.positionPropertyOptions;
    this.velocity = providedOptions.velocity;
    this.velocityPropertyOptions = providedOptions.velocityPropertyOptions;
    this.tandemName = providedOptions.tandemName || null;
  }

  private static fromStateObject( stateObject: BodyInfoStateObject ): BodyInfo {
    return new BodyInfo( {
      isActive: stateObject.isActive,
      mass: stateObject.mass,
      massRange: Range.fromStateObject( stateObject.massRange ),
      position: Vector2.fromStateObject( stateObject.position ),
      velocity: Vector2.fromStateObject( stateObject.velocity ),
      tandemName: stateObject.tandemName || undefined
    } );
  }

  /**
   * BodyInfoIO implements 'Data type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * Data type serialization is appropriate because BodyInfo is a data type for a Property.
   */
  public static readonly BodyInfoIO = new IOType<BodyInfo, BodyInfoStateObject>( 'BodyInfoIO', {
    valueType: BodyInfo,
    stateSchema: {
      isActive: BooleanIO,
      mass: NumberIO,
      massRange: Range.RangeIO,
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      tandemName: NullableIO( StringIO )
    },
    // toStateObject: The default works fine here.
    fromStateObject: stateObject => BodyInfo.fromStateObject( stateObject )
  } );
}

solarSystemCommon.register( 'BodyInfo', BodyInfo );