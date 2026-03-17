// Copyright 2023-2024, University of Colorado Boulder

/**
 * SolarSystemCommonMeasuringTape is the model for the measuring tape.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import solarSystemCommon from '../solarSystemCommon.js';

type SelfOptions = {
  basePosition?: Vector2;
  tipPosition?: Vector2;
};

type SolarSystemCommonMeasuringTapeOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SolarSystemCommonMeasuringTape extends PhetioObject {

  public readonly basePositionProperty: Property<Vector2>;
  public readonly tipPositionProperty: Property<Vector2>;

  public constructor( providedOptions: SolarSystemCommonMeasuringTapeOptions ) {

    const options = optionize<SolarSystemCommonMeasuringTapeOptions, SelfOptions, PhetioObjectOptions>()( {

      // SelfOptions
      basePosition: new Vector2( 0, 0 ),
      tipPosition: new Vector2( 0, 0 ),

      // PhetioObjectOptions
      phetioState: false,
      phetioFeatured: true
    }, providedOptions );

    super( options );

    this.basePositionProperty = new Vector2Property( options.basePosition, {
      units: 'AU',
      tandem: options.tandem.createTandem( 'basePositionProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Position of the measuring tape\'s base, or body'
    } );

    this.tipPositionProperty = new Vector2Property( options.tipPosition, {
      units: 'AU',
      tandem: options.tandem.createTandem( 'tipPositionProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Position of the tip of the measuring tape\'s retractable tape'
    } );
  }

  public reset(): void {
    this.basePositionProperty.reset();
    this.tipPositionProperty.reset();
  }
}

solarSystemCommon.register( 'SolarSystemCommonMeasuringTape', SolarSystemCommonMeasuringTape );