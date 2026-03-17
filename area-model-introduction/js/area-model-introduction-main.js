// Copyright 2018-2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import MultiplyScreen from '../../area-model-common/js/screens/MultiplyScreen.js';
import PartitionScreen from '../../area-model-common/js/screens/PartitionScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import AreaModelIntroductionStrings from './AreaModelIntroductionStrings.js';

const areaModelIntroductionTitleStringProperty = AreaModelIntroductionStrings[ 'area-model-introduction' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amy Hanson, Amanda McGarry',
    softwareDevelopment: 'Jonathan Olson, Luisa Vargas',
    team: 'Karina Hensberry, Susan Miller, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Jaron Droder, Bryce Griebenow, Ethan Johnson, Liam Mulhall, Ben Roberts, Jacob Romero, Nancy Salpepi, Ethan Ward, Clara Wilson, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer, Amanda McGarry, Diana L\u00f3pez Tavares'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( areaModelIntroductionTitleStringProperty, [
    new MultiplyScreen(),
    new PartitionScreen()
  ], simOptions );
  sim.start();
} );