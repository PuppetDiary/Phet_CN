// Copyright 2023-2024, University of Colorado Boulder

/**
 * Module in charge of controlling the sounds of the bodies in the simulation.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Bodies_Collide_Absorb_2_to_1_mp3 from '../../sounds/Bodies_Collide_Absorb_2_to_1_mp3.js';
import Bodies_Collide_Absorb_3_to_2_mp3 from '../../sounds/Bodies_Collide_Absorb_3_to_2_mp3.js';
import Bodies_Collide_Absorb_4_to_3_mp3 from '../../sounds/Bodies_Collide_Absorb_4_to_3_mp3.js';
import Collision_Sound_mp3 from '../../sounds/Collision_Sound_mp3.js';
import Mass_Selection_1_mp3 from '../../sounds/Mass_Selection_1_mp3.js';
import Mass_Selection_2_mp3 from '../../sounds/Mass_Selection_2_mp3.js';
import Mass_Selection_3_mp3 from '../../sounds/Mass_Selection_3_mp3.js';
import Mass_Selection_4_mp3 from '../../sounds/Mass_Selection_4_mp3.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

const bodyNumberSounds = [
  Mass_Selection_1_mp3,
  Mass_Selection_2_mp3,
  Mass_Selection_3_mp3,
  Mass_Selection_4_mp3
];

// Sounds for when the bodies are reduced from the number control
const removalSounds = [
  Bodies_Collide_Absorb_2_to_1_mp3,
  Bodies_Collide_Absorb_3_to_2_mp3,
  Bodies_Collide_Absorb_4_to_3_mp3
];

export default class BodySoundManager {

  private readonly model: SolarSystemCommonModel;

  // Sounds for when a body is added to the current orbital system
  private readonly bodyAddedSoundClips: SoundClip[];

  // Sounds for when a body is removed from the current orbital system
  private readonly bodyRemovedSoundClips: SoundClip[];

  // Played when a body collides
  private readonly bodyCollidedSoundClip: SoundClip;

  public constructor( model: SolarSystemCommonModel ) {
    this.model = model;

    this.bodyAddedSoundClips = bodyNumberSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    } ) );

    this.bodyRemovedSoundClips = removalSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    } ) );

    this.bodyCollidedSoundClip = new SoundClip( Collision_Sound_mp3, {
      initialOutputLevel: 10 // louder than the other sounds
    } );

    this.bodyAddedSoundClips.forEach( soundClip => soundManager.addSoundGenerator( soundClip ) );
    this.bodyRemovedSoundClips.forEach( soundClip => soundManager.addSoundGenerator( soundClip ) );
    soundManager.addSoundGenerator( this.bodyCollidedSoundClip );
  }

  public playBodyAddedSound( numberOfBodies: number ): void {
    const soundClip = this.bodyAddedSoundClips[ numberOfBodies - 1 ];
    assert && assert( soundClip, `No soundClip found for numberOfBodies ${numberOfBodies}` );
    soundClip.play();
  }

  public playBodyRemovedSound( numberOfBodies: number ): void {
    const soundClip = this.bodyRemovedSoundClips[ numberOfBodies - 1 ];
    assert && assert( soundClip, `No soundClip found for numberOfBodies ${numberOfBodies}` );
    soundClip.play();
  }

  public playBodyCollidedSound(): void {
    this.bodyCollidedSoundClip.play();
  }
}


solarSystemCommon.register( 'BodySoundManager', BodySoundManager );