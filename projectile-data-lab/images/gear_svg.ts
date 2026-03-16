/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="277.17" height="269.32" viewBox="0 0 277.17 269.32"><path d="M138.59 33.65c-7.6 0-15 .85-22.13 2.44L95.97 5 47.56 32.96l16.7 33.3c-9.98 10.83-17.62 23.85-22.11 38.25L5 106.7v55.91l37.15 2.19c4.5 14.4 12.14 27.42 22.11 38.25l-16.7 33.3 48.41 27.97 20.49-31.09a101.5 101.5 0 0 0 44.26 0l20.49 31.09 48.41-27.96-16.7-33.3c9.98-10.83 17.62-23.85 22.11-38.25l37.15-2.19v-55.91l-37.15-2.19c-4.5-14.4-12.14-27.42-22.11-38.25l16.7-33.3L181.21 5l-20.49 31.09c-7.12-1.59-14.53-2.44-22.13-2.44Z" style="fill:#939393;stroke:#000;stroke-linejoin:round;stroke-width:10px"/><circle cx="138.59" cy="134.66" r="66.06" style="fill:#b5b5b5;stroke:#000;stroke-miterlimit:10;stroke-width:10px"/><circle cx="138.59" cy="134.66" r="27.95" style="stroke-width:0"/></svg>')}`;
export default image;