// Copyright 2018-2026, University of Colorado Boulder

/**
 * Enumeration for area-model partition line choices.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import areaModelCommon from '../../areaModelCommon.js';

const PartitionLineChoice = EnumerationDeprecated.byKeys( [
  'NONE', // No partition lines
  'ONE', // One at a time (toggles between the two)
  'BOTH' // Both partition lines available at all times
] );

areaModelCommon.register( 'PartitionLineChoice', PartitionLineChoice );
export default PartitionLineChoice;