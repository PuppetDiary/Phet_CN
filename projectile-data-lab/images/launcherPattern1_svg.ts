/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="152.71" height="68.09" viewBox="0 0 152.71 68.09"><path d="M152.71 12.32v43.51l-41.6 4.22 31.61-8.61-43.56-1.17 40.67-10.49-51.96-6.95 51.65-5.59L99.17 16.5 140 14.87 113.14 8.3z" style="fill:#ffe300;stroke-width:0"/><path d="M152.71 55.71V12.38L32.5 0C12.97-.41 0 14.82 0 33.62S12.97 68.6 32.5 68.08z" style="fill:none;stroke-width:0"/></svg>')}`;
export default image;