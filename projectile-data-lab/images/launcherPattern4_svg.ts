/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="152.96" height="67.95" viewBox="0 0 152.96 67.95"><defs><clipPath id="a"><path d="M152.96 55.59V12.36L36.9.01C18.05-.4 0 9.84 0 33.55s18.05 34.9 36.9 34.38l116.05-12.34Z" style="fill:none;stroke-width:0"/></clipPath></defs><g style="clip-path:url(#a)"><path d="m95.41 2.7-15.8 16.9 15.9 15.19-15.8 16.89 15.9 15.19M115.34 2.7l-15.8 16.9 15.9 15.19-15.8 16.89 15.9 15.19M135.29 2.7 119.5 19.6l15.89 15.19-15.79 16.89 15.89 15.19" style="fill:none;stroke:#8de7ff;stroke-miterlimit:10;stroke-width:7.13px"/></g></svg>')}`;
export default image;