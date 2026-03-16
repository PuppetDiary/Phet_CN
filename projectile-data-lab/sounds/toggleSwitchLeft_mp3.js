/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//tAxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAALAAAIkQAXFxcXFxcXFxcuLi4uLi4uLi5FRUVFRUVFRUVdXV1dXV1dXV10dHR0dHR0dHSLi4uLi4uLi4uioqKioqKioqK6urq6urq6urrR0dHR0dHR0dHo6Ojo6Ojo6Oj///////////8AAAA8TEFNRTMuOTlyAZYAAAAAAAAAABQ4JAL8QgAAOAAACJHWXcjjAAAAAAD/+0DEAAAIZFFUdYMAEVMZL/cegAIAAue+NxuG3bZ2ztx48kIYxmMJaNIticP9qWCZNO7u//ZMBhabQgTJp2D4PorD6gfD/8H+n/+GPL8EAQBA4UOf/gh1y4AJJkIlsNhwSCgYAAIYUCKFeVBzpAhDOX90dyek7bnuINg754QiEJpE3CnhwKGUUcV/5jHi5Ichz//nmVohJQNgbL//mH3y9+qx//+YGP/wuaiABvQCwDluAAYM4P/7QsQEgAook09dt4ARI40o9aeVbsCs5jycyXyVyNRVFD3lUxoJLetNqLuhUpVTa9gwYtPvD5PBDlVGtv/Wrev9ZdQpUNJ6lIWawXtc1k3jW/76zqWM8TLCp5+HJJNgAyNJuyTb440VHArJoyW6CCQX0HfPhgYTE6laGqNFmq+i7YYun3zZckFJo0zb/KnqUz5hoFcWBofhICu11q/7f/837v3f//dVGAP5MSWbDIFiGxqoMzCAkP/7QsQIAAeUQzVDbSMxCYbgzPwkahCRmModzDApPTUfukAGQN7FpzbF1/6VJaAjUARqfp+OaY9Lmfv/7H78Jlv8qCWJN+iz4MsrFnF8TCQAVEOiGwVSXARXUEXWyxx38ECNlacHxWEZkJapoVa/gmZCQskW/+L9f/2/X6yLnKdxTp+r6QsAAP9APuAAOK7nfzdF2n//Vp+/6iKurbElAHv80nTN84AmI7wgAcJm39//4jHBCGWAwv/7QsQZgAKgBPWnhEAgyYmmKphgBtPYJpgQMJ+hb/znLv///////z/9KmBiMhyOh0ORmBACAAADBIVMCgyTCMBRFQ86MwjS5PMmkVBIY3BipgKFDEQGSuTngFBIfrUa5KnmgSV3IDurzuNjBAXcai2GOv7DgONnDWmTAr3cKBr8jf+NRGOLeLYM0SIXRP9vWM6k9ZpcJyKV+2NczvU+PbdrHL//////5zn0dzv6ND2yCAACS3XAyv/7QsRGgBCstWW5zQARdoxqK7bwAp+p9NEtyYYRmlcoQzPvAyeqQqAUvCXdQCmAAZaEsRmgRXLNaPnz2Lh8zWtBe2+P/hiZtYhWBoGnh3gqCoKgqNOwaBoNf8Gqng08Glg1iUFuWBUFXFgZpEk5OWSXd2otm05lpjUPNhSDDQYtBF1XMNUtC4sQu7qNeniOkfL+nIikyk5z0uF41I12wOBkFb/ZFTElqurr4UrmtMPh08U9Zr///v/7QsQmAAoMo0lMbMVxPIzkjd0g4s//V/3hFJW4F/VlDoAlgBASG4jII4F+w9DOQxSMWNm0sh0QmFOq0qLMmklSjaS8rCoqpESgfbMHVsH4a+IQOja1oYBRC2RgJ795H/ZqZU3V1f88mgChHJ402RUSgACJnQxmFLRwaIYglhx2B2gETO4OpnarjBKJagVdWQ5Geyb/W79uR2u9T/zLv+v/+JaWXirhzVsNlsjuoloEoDLSJVoFSv/7QsQnAAgIIxhtbwRQhIBkNBCMBpbs7d9dblScqdtf//6n/4FlluLVCbkkdskjAABUOGjRsWApYcVsEhsi6eEvaKuscGvX3JtklASJgXJBaA4Lhn8WTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVf/7QMRHAcPwAPOghGcwNgGakMSMBlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVV//tCxIEDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tCxK6DwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tCxK6DwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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