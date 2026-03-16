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