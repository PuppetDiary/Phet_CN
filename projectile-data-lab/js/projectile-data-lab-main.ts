// Copyright 2023-2025, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import AudioPreferencesContentNode from './common/view/AudioPreferencesContentNode.js';
import SimulationPreferencesContentNode from './common/view/SimulationPreferencesContentNode.js';
import MeasuresScreen from './measures/MeasuresScreen.js';
import ProjectileDataLabStrings from './ProjectileDataLabStrings.js';
import './common/PDLQueryParameters.js';
import SamplingScreen from './sampling/SamplingScreen.js';
import SourcesScreen from './sources/SourcesScreen.js';
import VariabilityScreen from './variability/VariabilityScreen.js';

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch( () => {

  const titleStringProperty = ProjectileDataLabStrings[ 'projectile-data-lab' ].titleStringProperty;

  const preferencesModel = new PreferencesModel( {
    simulationOptions: {
      customPreferences: [ {
        createContent: tandem => new SimulationPreferencesContentNode( tandem )
      } ]
    },
    audioOptions: {
      customPreferences: [
        {

          // Due to the layout considerations in the Preferences Dialog, it has 2 columns. Our entry for the left column
          // is blank. See https://github.com/phetsims/joist/issues/956
          createContent: () => new Node()
        },
        {
          createContent: tandem => new AudioPreferencesContentNode( tandem )
        } ]
    }
  } );

  const screens = [
    new VariabilityScreen( { tandem: Tandem.ROOT.createTandem( 'variabilityScreen' ) } ),
    new SourcesScreen( { tandem: Tandem.ROOT.createTandem( 'sourcesScreen' ) } ),
    new MeasuresScreen( { tandem: Tandem.ROOT.createTandem( 'measuresScreen' ) } ),
    new SamplingScreen( { tandem: Tandem.ROOT.createTandem( 'samplingScreen' ) } )
  ];

  const sim = new Sim( titleStringProperty, screens, {
    credits: {
      leadDesign: 'Matthew Blackman',
      softwareDevelopment: 'Matthew Blackman, Sam Reid',
      team: 'Cathy Carter, Ariel Paul, Kathy Perkins, Amy Rouinfar',
      contributors: 'Kelly Findley',
      qualityAssurance: 'Kathryn Woessner, Nancy Salpepi, Jaron Droder, Clifford Hardin, Luisa Vargas',
      graphicArts: 'Mariah Hermsmeyer',
      soundDesign: 'Ashton Morris',
      thanks: 'Bill Finzer, Gayle Geschwind, Heather Lewandowski, Joey Liu'
    },
    preferencesModel: preferencesModel,
    phetioDesigned: true
  } );
  sim.start();
} );