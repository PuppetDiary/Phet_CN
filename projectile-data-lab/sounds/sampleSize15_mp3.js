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