// Copyright 2024, University of Colorado Boulder

/**
 * Main entry point for the 'Generator' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FELSim from '../../faradays-electromagnetic-lab/js/common/FELSim.js';
import FELPreferences from '../../faradays-electromagnetic-lab/js/common/model/FELPreferences.js';
import GeneratorScreen from '../../faradays-electromagnetic-lab/js/generator/GeneratorScreen.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GeneratorStrings from './GeneratorStrings.js';

simLauncher.launch( () => {
  const titleStringProperty = GeneratorStrings.generator.titleStringProperty;
  const preferences = new FELPreferences( {
    hasEarthFeature: false
  } );
  const screens = [
    new GeneratorScreen( preferences, Tandem.ROOT.createTandem( 'generatorScreen' ) )
  ];
  const sim = new FELSim( titleStringProperty, screens, preferences );
  sim.start();
} );