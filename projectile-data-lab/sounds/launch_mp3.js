/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//tAxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAOAAAKtgASEhISEhISJCQkJCQkJDY2NjY2NjZJSUlJSUlJW1tbW1tbW21tbW1tbW2AgICAgICAkpKSkpKSkpKkpKSkpKSktra2tra2tsnJycnJycnb29vb29vb7e3t7e3t7f////////8AAAA8TEFNRTMuOTlyAZYAAAAAAAAAABQ4JAMbQgAAOAAACraI3f0nAAAAAAD/+0DEAAAEYAE1tAGAMdMYZrcw8AAMUSOSyMCgYSkbBBwP0xOHy5+J4P1RJ//9Gfg//////WfKHCBAaTQMSwqyyZGEgAAJY7aXCvhkokqFv3Hm9qKnT3We8DbOi6x1GqVyYOg6BSxay+DVQakQpRm1EOPv1YzS4ZVlZONYztwjLplV8KFI4JGI61ApRzgTKT9i03srBBg1iX+4+9Pn1NwIcR9FiRLj/SRhueFVJSAkCT2IQ0Gg0P/7QsQEgAnMb2G5hIABUhSta7CQBqhmAKAJ+65NgKSBeLeovbddv6/dSrcYsg7QAw27rxjgbCArb9YlCtNhh2wr+FZnZPi5IvWSWXCwx2J+wQAMH3+3wg7/8oFLgoKJIMrZLQiicCD0XFkl+7IpmlgWOyb8X1JpItgsiRb4xjFXFWVRZEqzQWXi+AVFLqo1GvpUlZlHP/H2k0krnrYPx8iz3YiNkRDwpDXp//9X/xpAS7ORptyOAP/7QsQEAAn4oWesPQNxPZpsdYYVP86TGdkZiNWcrFWP1IqE5lY9ILqRiNOklBCOiOIrngOqoNiZpoWgmjrX5iv4YoWb/Fh9HQTVEoLMLB8OxDnQrGD0qCxJ3vI4dQEt0kjsjkAFAxZ6QQl18HnfiGnGBAYoxCHDXBDJK48jPG38ZY77wOTo8wKkxERq34z3jTpcYo1ncceysx0FL1o16Wj5XHfd6oy1QMHb3lLVAETbSVVUBYbi4f/7QsQFAAoQ01mMJMfxQ5DnqbYYsBCYoVeb6c0qSLoViJdgNPV7JEB6AmVKTQ0TFxzpKgAcRR1AcNB4vDFm+q+opOhf+9xWkWbErVjd37tua+d//+1en9LeeL6AO/QABCgHTITrCgOQSACjn9JAJgocgwZdgHq58DU7Q3KoRO7qIlTm4qjzGykng08klX2qX9xwry38YYwfQw+sMTp4itoVBhowInL5/f////0qADKpQAABUA6c6f/7QsQFAAoY2TutpGsBR5qmaaMKGCy9TEIpAI47EJHMOzQOsQAiCpx4NE+kSNERQenpI+O1EkbAJoJD5ooWHl22NDjVvPKGVu+hGun/UnSLyLn5+wJlVB7///+oBVIAAUWB5MzAzBM3d4NoN+7NaHH4gfm78B9pnhiOUfqQGN34tckSzrOPRkvSlzQEZTOV02B1eok3ZUC4pwQFDKamoav2TZDFuDaL6n////9nVWDttrbLLIwAO//7QsQEgAjEnVWnpGzxNxWnNaeMdAOA7yjErY5Thbz0L+1QH5ZhBQjIdQ4TJdnUJuC0thhAQMLSTdVoPRjrEdBfG5gJE5O2YbBgAyWqzzHTedeANtvXG5HER1pM+Cgc2EsgsAozUJ6ly4tr1nWDJQxPPbMFRIDGQTRI9jOEotbkaq5sy0UgWT2Muc6ZXp5knDr7B416T4tElmpCPb///9AgTWyWKWSIgM6ZOSJPDyt9EHyGcAeITf/7QsQLgAjkizesMGWhFY6kWbSMsTbF7MFh2kCyFp6gfCrQdyrKFRiMFAb+G9WKpM788wctH0HwqEw6QcZJrFiTlvyL9YBVJAALAws1FQYNLqAy2cUibWDcjPkk5E+aCaBEy10aNiHYHuK3PDsb2n+S8DihCmdprUoWf+9WFBBoq5//z/07Tyi3uWpCSSWyyStkAIkfLWSAkR9jEsCE92YMpGRiVyyKj+pA7sk6xF/LppvNS9ZX/P/7QMQWAAiQk0WnvMBw8YrndMeMRNwKUSRxLsUBRvvpkzi1vkRs8NYcS5tblrIjku2//9qcAkmR8NI1HNjTf6lCVXNaZnoKEGzUwopFLEDiVIBFgTaLmIGYUSmgyKPOPCy13BimM9nX/9EAJRKIAjP2Aj4ShDvShJ2Nz7f2grgM3l4qh3IG9dyWiAWyYlZkRQi7lDyyU2XyaQHDIq5gPhEhCwiSWTXsdb/////ywDbsu3uusTnj//tCxCYACGydIuwYZQDqk6c09YxETPhZghZHzl6Ru+jHfLcQHmM+wOUwa9TQ79/9yzuZ85lxYY6g6+dQbzVye72f/Hs9/+8AIwRmeGu3sTgtDijhNqyeGFHKCNEhJCdAjMDxluLzN3KexmriXv2wmIBCfMjhcgBTzQC5sNJmVCmEnC96kv9v7PZ6AFE5Jdd82RBKpLBUm5Sqm2a0S9uSmPApAyEaUFH2FgkQx8GBjAKlzLmOouc7//tCxDgACGhbOeeFJKDaDWa0sIyslDlIar+tv//rqQMAAagC4CZiqUkarVwdgZvkapF9Bb2k/y/hha0lQwYTkAr0fdSHDNjb9ywZQuhHmT3Gsb//1+31gHONJt2xAGCjz4WIM9W5vrI9XyE3lJixlAxCHByFZjmz6HmzTqQ2P///9Fv/97l1KgPvJTaKQoGWUQEccE1suoVvorKBh4T1MuZ/v06OhXd///vpAaoYpFEKQGMJIuU9//tCxEwABwSFHywEZcDADaW0wIz8rKuuPdSq8X9303/2f//+r+ldF/9dIUEojZQCIM5Q0e+t2p79+RQh3//0/R//8r/1ej/5VOpBgWhyfnIAnALQpeWpbHPUH6vf/rU8q7/Z/1JMQU1FMy45OS41qqqqqqqqAyaVWEAC4OqyVom2BrrO9awVO7z3/4ifIfkfsAAPwBgAUCDz/xbX/1VMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVV//tCxGiABGAJI0SYQACCgSRoIwQCVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tCxJeABAAJHaCMICBqgGPwEYQGVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tCxMMAQ1AC+SCEQDA4gJr0YIQGVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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