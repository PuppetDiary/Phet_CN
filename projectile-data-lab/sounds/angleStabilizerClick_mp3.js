/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;