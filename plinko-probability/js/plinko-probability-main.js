// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Plinko Probability' sim.
 *
 * @author Martin Veillette (Berea College)
 */

import Sim from '../../joist/js/Sim.js';
import audioManager from '../../joist/js/audioManager.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Sound from '../../vibe/js/Sound.js';
import IntroScreen from './intro/IntroScreen.js';
import LabScreen from './lab/LabScreen.js';
import PlinkoProbabilityStrings from './PlinkoProbabilityStrings.js';

const plinkoProbabilityTitleStringProperty = PlinkoProbabilityStrings[ 'plinko-probability' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Amanda McGarry',
    softwareDevelopment: 'Martin Veillette, Denzell Barnett, Chris Malley (PixelZoom, Inc.), Guillermo Ramos-Macias',
    team: 'Karina K. Hensberry, Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Alex Dornan, Bryce Griebenow, Ben Roberts'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( plinkoProbabilityTitleStringProperty, [ new IntroScreen(), new LabScreen() ], simOptions );

  // This sim still uses legacy vibe/Sound for peg-hit effects. Sync it with the global audio switch so that
  // turning audio on/off from the navigation bar (or preferences) always affects these sounds.
  Sound.audioEnabledProperty.value = audioManager.audioEnabledProperty.value;
  audioManager.audioEnabledProperty.link( enabled => {
    Sound.audioEnabledProperty.value = enabled;
  } );

  sim.start();
} );
