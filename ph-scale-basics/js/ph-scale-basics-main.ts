// Copyright 2013-2025, University of Colorado Boulder

/**
 * Main entry point for the 'pH Scale: Basics' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import PHScaleConstants from '../../ph-scale/js/common/PHScaleConstants.js';
import PHScaleQueryParameters from '../../ph-scale/js/common/PHScaleQueryParameters.js';
import MacroScreen from '../../ph-scale/js/macro/MacroScreen.js';
import { QueryStringMachine } from '../../query-string-machine/js/QueryStringMachineModule.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhScaleBasicsStrings from './PhScaleBasicsStrings.js';
import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import PHScalePreferencesNode from '../../ph-scale/js/common/view/PHScalePreferencesNode.js';
import PHScalePreferences from '../../ph-scale/js/common/model/PHScalePreferences.js';

// If autofill query parameter was not in the URL, change the default.
if ( !QueryStringMachine.containsKey( 'autofill' ) ) {
  PHScaleQueryParameters.autofill = false;
  PHScalePreferences.autoFillEnabledProperty.setInitialValue( false );
  PHScalePreferences.autoFillEnabledProperty.reset();
}

const preferencesModel = new PreferencesModel( {
  simulationOptions: {
    customPreferences: [ {
      createContent: ( tandem: Tandem ) => new PHScalePreferencesNode( tandem.createTandem( 'preferencesNode' ) )
    } ]
  }
} );

simLauncher.launch( () => {
  const screens = [
    new MacroScreen( Tandem.ROOT.createTandem( 'macroScreen' ) )
  ];

  const sim = new Sim( PhScaleBasicsStrings[ 'ph-scale-basics' ].titleStringProperty, screens, {
    credits: PHScaleConstants.CREDITS,
    phetioDesigned: true,
    preferencesModel: preferencesModel
  } );

  sim.start();
} );