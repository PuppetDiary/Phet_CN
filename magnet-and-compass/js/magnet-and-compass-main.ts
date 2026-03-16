// Copyright 2024-2025, University of Colorado Boulder

/**
 * Main entry point for the 'Magnet and Compass' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BarMagnetScreen from '../../faradays-electromagnetic-lab/js/bar-magnet/BarMagnetScreen.js';
import FELQueryParameters from '../../faradays-electromagnetic-lab/js/common/FELQueryParameters.js';
import FELSim from '../../faradays-electromagnetic-lab/js/common/FELSim.js';
import FELPreferences from '../../faradays-electromagnetic-lab/js/common/model/FELPreferences.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { QueryStringMachine } from '../../query-string-machine/js/QueryStringMachineModule.js';
import Tandem from '../../tandem/js/Tandem.js';
import MagnetAndCompassStrings from './MagnetAndCompassStrings.js';

// The 'Earth' checkbox should be visible by default, unless specified otherwise in the URL.
// See https://github.com/phetsims/faradays-electromagnetic-lab/issues/23
const addEarthCheckbox = QueryStringMachine.containsKey( 'addEarthCheckbox' ) ? FELQueryParameters.addEarthCheckbox : true;

simLauncher.launch( () => {
  const titleStringProperty = MagnetAndCompassStrings[ 'magnet-and-compass' ].titleStringProperty;
  const preferences = new FELPreferences( {
    hasCurrentFlowFeature: false,
    addEarthCheckbox: addEarthCheckbox
  } );
  const screens = [
    new BarMagnetScreen( preferences, Tandem.ROOT.createTandem( 'barMagnetScreen' ) )
  ];
  const sim = new FELSim( titleStringProperty, screens, preferences );
  sim.start();
} );