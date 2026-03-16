// Copyright 2023, University of Colorado Boulder

/**
 * NLD Preferences is the model that simulation specific preferences Properties.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import Property from '../../../../axon/js/Property.js';
import numberLineDistance from '../../numberLineDistance.js';
import NLDQueryParameters from '../NLDQueryParameters.js';

/**
 *
 * @type { {terminologyProperty: Property<'directedDistance' | 'displacement'>} }
 */
const NLDPreferences = {
  terminologyProperty: new Property( NLDQueryParameters.terminology )
};

export default NLDPreferences;
numberLineDistance.register( 'NLDPreferences', NLDPreferences );