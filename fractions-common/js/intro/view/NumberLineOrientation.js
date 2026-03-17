// Copyright 2018-2026, University of Colorado Boulder

/**
 * Represents the orientation of a number line.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const NumberLineOrientation = EnumerationDeprecated.byKeys( [
  'HORIZONTAL',
  'VERTICAL'
] );
fractionsCommon.register( 'NumberLineOrientation', NumberLineOrientation );
export default NumberLineOrientation;