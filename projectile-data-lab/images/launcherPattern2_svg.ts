/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="153.86" height="69.29" viewBox="0 0 153.86 69.29"><defs><clipPath id="a"><path d="M153.86 56.09V13.28L33.81 0C14.96-.41 0 17.26 0 34.97S15.63 69.8 34.48 69.28z" style="fill:none;stroke-width:0"/></clipPath></defs><g style="clip-path:url(#a)"><circle cx="78.27" cy="35.29" r="13.14" style="fill:#aedbb8;stroke-width:0"/><circle cx="139.73" cy="51.2" r="12.72" style="fill:#aedbb8;stroke-width:0"/><circle cx="18.11" cy="71.3" r="17.24" style="fill:#aedbb8;stroke-width:0"/><circle cx="105.2" cy="61.46" r="11.65" style="fill:#aedbb8;stroke-width:0"/><circle cx="98.57" cy="2.65" r="10.31" style="fill:#aedbb8;stroke-width:0"/><circle cx="149.31" cy="5.57" r="19.25" style="fill:#aedbb8;stroke-width:0"/><circle cx="64.12" cy="65.68" r="10.31" style="fill:#aedbb8;stroke-width:0"/><circle cx="11.49" cy="13.05" r="16.07" style="fill:#aedbb8;stroke-width:0"/><circle cx="114.14" cy="29.92" r="9.2" style="fill:#aedbb8;stroke-width:0"/><circle cx="41.73" cy="40.23" r="9.2" style="fill:#aedbb8;stroke-width:0"/><circle cx="57.38" cy="-4.72" r="17.68" style="fill:#aedbb8;stroke-width:0"/><circle cx="11.63" cy="72.71" r="7.29" style="fill:#aedbb8;stroke-width:0"/></g></svg>')}`;
export default image;