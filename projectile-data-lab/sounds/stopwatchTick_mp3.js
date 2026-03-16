/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//tAxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAAE/wAqKioqKioqKioqKioqKioqVVVVVVVVVVVVVVVVVVVVVVWAgICAgICAgICAgICAgICAqqqqqqqqqqqqqqqqqqqqqqrV1dXV1dXV1dXV1dXV1dXV1f////////////////////8AAAA8TEFNRTMuOTlyAZYAAAAAAAAAABQ4JAJPQgAAOAAABP+jtnmkAAAAAAD/+0DEAAAIJDNrVGMAEV6aLesw0AL0AAQA1P/4zt4gwgAwGAwvTAAAAgLJkyZNOz4nXE4OAgCAIAgD4f/u5cP85/qBAEAQBN/1AgCYP8HwfB95R3/+CH8IEytDEYFAwFAADLVpPHNynblAH/r5+lBsHRYouqUzgE2BJiqdUE+Dmjhkk9cOSPYYIimNa/E+BbhLiRJH6HcepkXjal/+MMJ6PFG6P/+7sSS2CP/iIGWJAAACnRwNO//7QsQEAUocp0VdlgARKRFmiaSOie7DY5S0iHGlw03RpCRYxIUYh0IOZEhUiQLG22+z6ROvRQ23+gXUtirX8fo59a035nn67uf2d+WyFa1OP8/39XFsibfIkf/lajYF7dFpCkqzRIu2JMlRcvYYgCDDZlhpkoxlTIIDzzFlpQzAsXblDL0QOm7AbN5UjFeKshB7UDh48cZqm7OZcX9yvXtMX0RMl7+HBipgAADmAHw6ra01lNllUv/7QsQHAYpIjTDtJFSBNpRkwaSOkBXW9yihMaMcIPc7CgMSkIVoHtfTHedmT9NPlrOG7K5ZKqKbAMfKRLNtoEicVsAyDapH+01ny2XWlleyCwAFB40J63/6dQ1Hs4AmoiyhQRXDD2WhYqc8GNdDKsjglC3aNTN3yWBiELampqXulCxUvpYNgQkcRgBQh4CphlAcR2OnkL2ql8L8/6z1og4lwQ4QriVXAJBmA5hkJqlhyIchYXgCqP/7QsQIAwp0eR5n6SlRMgyiSY0lKlAJjFhq7xsJwNIlkzMoEVk52yN2hb+s1fyOMOXy7rLZahYPpAeBRMuqzE+DTD5OKoMjOrZj6aYbvLPtyz/+17nVdCSQAOBdbAwdYr7P4gOY2TFEhq8Q3Co46oozoEKowyqpexBlClsOtday/TjtmRkS7jkMBYChHhkuWS06kWRwIUI6H4CNYse5FMbEg/Z/9SoAlPcC0OxaZSGwuArkodAXdP/7QsQIgwiIZxRk4SjRQQyfTY2lYhARkMdQyt5UsOQG6oiREJgHhgJRWImoT6sIu8WrSQTLItZ1a5IqwQyxI0Sp/0lEnaKRKsAAGUCs7V5lTrUSVSplvTwCCADGKJZ0CKamdGLhJoROnyXmTCYlTtxVhf5U0BsGeJ84shTUmhkTimSQCxcaWzs2RaVLB2E3LcHZ2SWxn/f+ugATAAMZTOOU/1HYi0M3XoMdg24jtYBl59QpIKDAif/7QsQPAEhIZOxssM6QtoyedGMk5xBGWrR6PzFSSVhO84SqvTsaYFUSW8Udq5UFToizxLKgrWNARLXSNS3bYBxpxagbSJIGEjCT5yRdlCTG2HoREUNuauMXCoaRntg8lIhk6gbdrFVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
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