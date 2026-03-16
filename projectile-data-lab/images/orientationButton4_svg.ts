/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="136.14" height="136.14" viewBox="0 0 136.14 136.14"><path d="M0 0h136.14v136.14H0z" style="fill:#fff;stroke-width:0"/><path d="M36.28 119.92h86.68" style="fill:none;stroke:#919191;stroke-miterlimit:10;stroke-width:4px"/><path d="M21.42 119.95v-84.3" style="fill:none;stroke:#595959;stroke-miterlimit:10;stroke-width:4px"/><path d="M13.62 118.75h15.6v2.4h-15.6zm0-84.3h15.6v2.4h-15.6z" style="fill:#595959;stroke-width:0"/><path d="M36.28 35.22h66.28" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:8px"/><path d="m99.06 47.19 20.73-11.97-20.73-11.96z" style="stroke-width:0"/></svg>')}`;
export default image;