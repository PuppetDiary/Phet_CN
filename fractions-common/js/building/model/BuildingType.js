// Copyright 2018-2026, University of Colorado Boulder

/**
 * In a building situation, whether shapes or numbers are included.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const BuildingType = EnumerationDeprecated.byKeys( [
  'SHAPE',
  'NUMBER'
] );
fractionsCommon.register( 'BuildingType', BuildingType );
export default BuildingType;