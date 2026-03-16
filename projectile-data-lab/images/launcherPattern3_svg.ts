/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="153.48" height="67.8" viewBox="0 0 153.48 67.8"><defs><clipPath id="a"><path d="M153.48 55.47V12.33L37.43.01C18.58-.4 0 8.06 0 33.47s18.58 34.82 37.43 34.31z" style="fill:none;stroke-width:0"/></clipPath></defs><g style="clip-path:url(#a)"><path d="M91.6 2.95s-5.81 9.34-5.81 31.87 5.81 32.15 5.81 32.15" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:7.12px"/><path d="M106.5 4.88s-4.83 8.77-4.83 29.94 4.83 30.21 4.83 30.21" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:6.9px"/><path d="M120.77 7.5s-3.72 5.73-3.72 27.21 3.72 27.7 3.72 27.7" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:6.6px"/></g></svg>')}`;
export default image;