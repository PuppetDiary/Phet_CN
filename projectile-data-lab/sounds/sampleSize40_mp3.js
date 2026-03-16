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