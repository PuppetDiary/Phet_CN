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