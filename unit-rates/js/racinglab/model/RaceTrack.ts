// Copyright 2017-2024, University of Colorado Boulder

/**
 * Model of a race track in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';

type SelfOptions = {
  length?: number; // initial distance between start and finish line, in miles
  maxLength?: number; // maximum distance between start and finish line, in miles
  markerSpacing?: number; // track markers are spaced at this interval, in miles
};

type RaceTrackOptions = SelfOptions;

export default class RaceTrack {

  public readonly maxLength: number;
  public readonly markerSpacing: number;
  public readonly lengthProperty: NumberProperty;

  public constructor( providedOptions?: RaceTrackOptions ) {

    const options = optionize<RaceTrackOptions, SelfOptions>()( {

      // SelfOptions
      length: 200,
      maxLength: 200,
      markerSpacing: 50
    }, providedOptions );

    this.maxLength = options.maxLength;
    this.markerSpacing = options.markerSpacing;
    this.lengthProperty = new NumberProperty( options.length, {
      isValidValue: length => ( length >= 0 && length <= options.maxLength )
    } );
  }

  public reset(): void {
    this.lengthProperty.reset();
  }
}

unitRates.register( 'RaceTrack', RaceTrack );