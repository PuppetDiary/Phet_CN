/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//tAxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAMAAAJSAAVFRUVFRUVFSoqKioqKioqQEBAQEBAQEBVVVVVVVVVVVVqampqampqaoCAgICAgICAlZWVlZWVlZWVqqqqqqqqqqrAwMDAwMDAwNXV1dXV1dXV1erq6urq6urq//////////8AAAA8TEFNRTMuOTlyAZYAAAAAAAAAABQ4JAPrQgAAOAAACUgTtjA9AAAAAAD/+0DEAAAEjDbI1BGAARyKp8M9kAAAwlSABDGOACL+BzQASuBvE7xBn5z8MLD8vIFJ9QYeIHCf8vIclZgugKmEoJsYKQO5hBCUS9l5ivBcGA6BmaXxFpgmBX3+GCaBOvowJQBTAUAXt6HBDMAAPixv58Or04mNWpv//qRepy2JeXUkMUAALghmCECCYHgE5YBOMMUVoyITPjZNiMMqQbswoAGwCCMYRoXBhBhBGDOCQYFYCSEUpv/7QsQaggmsNSp97AAxBoWlqa5ohkjvL6MKgEMDRZLNQ9aDbUiURCUNf+e/8kVTls8lpa5fKcxcUxIQy2s29Ozgw1DPwBHiOAAuSdMSmXak1PLXerv6HEjKwI0CEwigXHNG+d/2IV+6j//5L//tkgAArc2/34GJVNB+clyipNlA9yrNA+1Tak8Am2UtHofpaPIjE/Uhdjr6//9tH/RzITwAGlkgQ1pqsNw2wcyyxNHC2bzK54BYGP/7QsQkAgXsHSNGYeJwr4Mg9rYQBrbv//nFiy2dn7v3VdP6tP++y+eVAAAAIFAsFClb8n2+3Hsg0Sr2BgNManU2C3zEIwJgGYPCY0OzVY5PHxGHLACBDKzdZbMZg83cZAmwOBAQDPIvtK5XNAMuE4DnrbAz6Q2r+AEPwxaBgcBhx/+8wIARAZsn06MeH5k+ca/T904+oZ9m15N8gGPTrjf/+OKAAbThte8oEAAAA4HAMbCkykjV2P/7QsRHAA8weT+5yrQRsoxq9zmyCkIpdERhA8PNjhLAM0L8xwCTR/QDI8brVhqFKCQxbOAiMzUxpLNSxpCTDV1W0B15k5wDh4ICKvGS/5bIwQHMlHjEwrN6oP5+v+rclVKd9YiPf////1av//UqIAACSm3+8lwCByPz1l7QEAUhDBJaMPds9k/TSqGMujQDDJ212uq/DtP8tiaXDkBInRs2q7zhOa7Vfzv+JQ7//7v+V/nkfzywAP/7QsQkgEjwPze9xgAw7ITkaY3kjgHUu91qLrpyDzgR432SMjcTuLMigjshIRlnxCX3rtnT5IrKncFQ1gq789qBp+wS/7f89////uEX8O0e6nMjAZEDBUgYFYwGgGDBWCSMGADsBBnm1P/YZKBIREJkYYgcxgBgVAoEUBATo9r+YhOBABv/vtn2dXjqHX/3If+36tz2f29frT17O9ACAADDqUc8mDmlH+/w9aMhcRGHhiFEUZ7ZoP/7QsQ0AAm8KNpV4QAB9I8ptzm2QpDa1DOY7NXkM2o9CNxyzMxAJC+5r5tmIDVzpkIqAg8abTjwr+8ZOJB6xDYGA5McMMD/5/rTg5rcDmCGxgQ6OAwIGO//+yeOTksxLRPe6NDFe/ELKe7G/wIhtKDv7t/s/0//6UQAAqQpd9bam67rgpiyYvsYRExkM8AdHmuzYY7EQQGoLa7IXCca+bolwprzQrAiZPfLs2mZ2tazpienzz+V1f/7QsQfgAlsX0m9xgAxMoejja9wjv4NP/r/1f6nf1f//UBK4k2aEoiuAAwBFmYTG1wmCME4YoZp5y4VSmb+EKdoQJp0XGSgaYZBgQIS/S1W3maa73Okn0TWozFPeNP+Xu19v+Q/yH//2f6/87/tAAAIS/Ca4RTW4qackcQkJogaazMDCwLqjPA3OVhcaxFuET2e8qo8uJfEriJN6////2/4T//+e/yYEAAAAER//sLdDv/zPOVxM//7QMQkgAcUJR9Gb0Kwr4OifrQQBhcdlTqRix5PmAfPyaHI/v6fq0bF///9///b+QVoICITN1yyR9jgAAAAAsAIOBqY5gMaUR0YPA6OhkYUgaYdgWaFFsdhs+Yh4EdXlIYgBwYFgmbNlMZ8DwAAvDgtCAvQAHx7JHOy4BYAxwEI3+zGAHjidtzP0MzB0gjGcREOduL4eYfBcYSgMPA4XbMDgD46SaXP//S/dZxKClnaXAsawOQ9//tCxEKAEKx1QbnegBEhC+jruLAGMgBcrX73Xs7jLsrtnE0jAYOMQjgyzSDXBUMSgxPJcrEZC0pxr6o7TvuNhuDIHJ1rTv/tr4Nh3DcSTV3939bv//U7/O//+tv8shAG5d3okmfqw19QBh6mBaM6DDfPsPIRExkDmnwbAUOtnfinCR5k7Hw4pcNuhFGfd36nf1/6/9X+v//6/+4AACGL/9h0a4MaEFeKSXGAg4NKOIoGgl+FEWSu//tCxCyAB6A7MUzwxvDehGNo/Iie8AwoaWZ49P0egexyZpfj3/sv/dv/X//+IvopTQAAATLdv/ruAnnKkECP4PrKLocAl90ANAZB6tSG+mjqqRqTO00o5I0/p9//Xt+/6WINuW1hOKgCN2/8beyi4SBY8/4IKXyB0kNIVg8FK4VRM+LAVr+sidR+wZxRaNX/0mRV6a//3fs7lQok43QAALAAFEioZU1gqxbb/////Wdln5KePdBw//tCxEMCBtQZFaGbBDDGg+M0bCSONTOmvjS8Zm1MphTTjGanFuaVzvRqjsqqTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tCxF+Bw3wE/6EEQDBiAcAB73gEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
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