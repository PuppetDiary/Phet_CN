// Copyright 2024-2025, University of Colorado Boulder

/**
 * Play the landing sound at a given x position.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import cannonballLand_mp3 from '../../../sounds/cannonballLand_mp3.js';
import cannonballTone_mp3 from '../../../sounds/cannonballTone_mp3.js';
import pianoLand_mp3 from '../../../sounds/pianoLand_mp3.js';
import pianoTone_mp3 from '../../../sounds/pianoTone_mp3.js';
import pumpkinLand_mp3 from '../../../sounds/pumpkinLand_mp3.js';
import pumpkinTone_mp3 from '../../../sounds/pumpkinTone_mp3.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileType, { CANNONBALL, PIANO, PUMPKIN } from './ProjectileType.js';

// Convert projectileSoundsConfig to a Map
const projectileSoundsConfig = new Map( [
  [ CANNONBALL, {
    toneSoundClip: new SoundClip( cannonballTone_mp3, { initialOutputLevel: 0.1 } ),
    landSoundClip: new SoundClip( cannonballLand_mp3, { initialOutputLevel: 0.06 } ),
    rateRange: new Range( 0.8, 1.2 )
  } ],
  [ PUMPKIN, {
    toneSoundClip: new SoundClip( pumpkinTone_mp3, { initialOutputLevel: 0.1 } ),
    landSoundClip: new SoundClip( pumpkinLand_mp3, { initialOutputLevel: 0.1 } ),
    rateRange: new Range( 0.8, 1.3 )
  } ],
  [ PIANO, {
    toneSoundClip: new SoundClip( pianoTone_mp3, { initialOutputLevel: 0.1 } ),
    landSoundClip: new SoundClip( pianoLand_mp3, { initialOutputLevel: 0.02 } ),
    rateRange: new Range( 0.9, 1.2 )
  } ]
] );

// Add sound clips to sound manager
projectileSoundsConfig.forEach( config => {
  soundManager.addSoundGenerator( config.toneSoundClip );
  soundManager.addSoundGenerator( config.landSoundClip );
} );

export const playbackRateForPosition = ( x: number ): number => {
  return Utils.linear( 0, 100, 0.2, 3.5, x );
};

export default class ProjectileSound {

  public static play( projectileType: ProjectileType, x: number, isLanding: boolean ): void {

    const config = projectileSoundsConfig.get( projectileType )!;

    assert && assert( config, `Projectile type configuration not found for ${projectileType.phetioID}` );

    const playbackRate = playbackRateForPosition( x );

    config.toneSoundClip.setPlaybackRate( playbackRate );
    config.toneSoundClip.play();

    if ( isLanding ) {
      config.landSoundClip.setPlaybackRate( dotRandom.nextDoubleBetween( config.rateRange.min, config.rateRange.max ) );
      config.landSoundClip.play();
    }
  }
}

projectileDataLab.register( 'ProjectileSound', ProjectileSound );