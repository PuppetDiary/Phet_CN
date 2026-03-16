/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="197.98" height="190.18" viewBox="0 0 197.98 190.18"><path d="m121.29 150.79 41.26 10.81-22.59-35.37 39.62-24.56-40.28-9.83 9.83-43.55-33.41 16.37-17.03-43.55-16.04 47.81-36.03-8.19 12.45 33.73-38.65 12.45 41.59 18.01-19.65 44.21 41.92-20.09 18.34 28.28z" style="fill:none;stroke:#f31823;stroke-miterlimit:10;stroke-width:14.41px"/><path d="m121.29 150.79 41.26 10.81-22.59-35.37 39.62-24.56-40.28-9.83 9.83-43.55-33.41 16.37-17.03-43.55-16.04 47.81-36.03-8.19 12.45 33.73-38.65 12.45 41.59 18.01-19.65 44.21 41.92-20.09 18.34 28.28z" style="fill:#ff8c19;stroke-width:0"/><path d="M89.84 84.17 100 52.67l10.57 26.02 23.58-7.1-6.91 29.05 26.82 8.94-26.01 15.44 12.19 23.99-26.82-9.35-10.57 21.4-15.86-19.78-28.45 11.38 15.45-29.67-26.83-12.19 27.23-7.73-13.41-26.01z" style="fill:#ffff20;stroke-width:0"/></svg>')}`;
export default image;