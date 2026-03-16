/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="136.14" height="136.14" viewBox="0 0 136.14 136.14"><defs><clipPath id="a"><path d="M5.11 12.44h121.68v107.69H5.11z" style="fill:none;stroke-width:0"/></clipPath></defs><path d="M0 0h136.14v136.14H0z" style="fill:#fff;stroke-width:0"/><path d="M62.12 95.71c4.09 7.2 6.43 15.53 6.43 24.41" style="fill:#fff;stroke:#595959;stroke-miterlimit:10;stroke-width:4px"/><g style="clip-path:url(#a)"><path d="m16.01 121.87 72.05-40.88" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:8px"/><path d="m90.92 93.13 12.12-20.64-23.93-.18z" style="stroke-width:0"/></g><path d="M121.66 119.92H14.02" style="fill:none;stroke:#919191;stroke-miterlimit:10;stroke-width:4px"/></svg>')}`;
export default image;