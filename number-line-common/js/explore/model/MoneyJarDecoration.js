// Copyright 2020-2023, University of Colorado Boulder

/**
 * enum of possible decoration values for the piggy banks
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineCommon from '../../numberLineCommon.js';

const MoneyJarDecoration = EnumerationDeprecated.byKeys( [ 'NONE', 'LIGHTNING', 'FLOWERS' ] );
numberLineCommon.register( 'MoneyJarDecoration', MoneyJarDecoration );
export default MoneyJarDecoration;