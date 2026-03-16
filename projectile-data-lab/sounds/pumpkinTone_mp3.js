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