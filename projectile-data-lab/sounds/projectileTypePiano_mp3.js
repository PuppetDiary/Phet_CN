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