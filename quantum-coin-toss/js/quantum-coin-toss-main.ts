// Copyright 2025, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import CoinsScreen from '../../quantum-measurement/js/coins/CoinsScreen.js';
import QuantumMeasurementPreferences from '../../quantum-measurement/js/common/model/QuantumMeasurementPreferences.js';
import QuantumMeasurementConstants from '../../quantum-measurement/js/common/QuantumMeasurementConstants.js';
import QuantumMeasurementPreferencesNode from '../../quantum-measurement/js/common/view/QuantumMeasurementPreferencesNode.js';
import Tandem from '../../tandem/js/Tandem.js';
import QuantumCoinTossStrings from './QuantumCoinTossStrings.js';

// Initialize the preferences.  This supports variations of the sim with different preference configurations.
QuantumMeasurementPreferences.initialize( false );

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch( () => {

  const titleStringProperty = QuantumCoinTossStrings[ 'quantum-coin-toss' ].titleStringProperty;

  const screens = [
    new CoinsScreen( Tandem.ROOT.createTandem( 'coinsScreen' ) )
  ];

  const options: SimOptions = {
    credits: QuantumMeasurementConstants.CREDITS,
    preferencesModel: new PreferencesModel( {
      simulationOptions: {
        customPreferences: [ {
          createContent: tandem => new QuantumMeasurementPreferencesNode( {
            tandem: tandem.createTandem( 'simPreferences' ),
            hasBlochSphereNumericalEquation: false
          } )
        } ]
      }
    } ),

    phetioDesigned: true
  };

  const sim = new Sim( titleStringProperty, screens, options );
  sim.start();
} );