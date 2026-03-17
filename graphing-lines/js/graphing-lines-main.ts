// Copyright 2013-2024, University of Colorado Boulder

/**
 * Main entry point for the 'Graphing Lines' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GraphingLinesStrings from './GraphingLinesStrings.js';
import LineGameScreen from './linegame/LineGameScreen.js';
import PointSlopeScreen from './pointslope/PointSlopeScreen.js';
import SlopeScreen from './slope/SlopeScreen.js';
import SlopeInterceptScreen from './slopeintercept/SlopeInterceptScreen.js';

simLauncher.launch( () => {

  const titleStringProperty = GraphingLinesStrings[ 'graphing-lines' ].titleStringProperty;

  const screens = [
    new SlopeScreen( Tandem.ROOT.createTandem( 'slopeScreen' ) ),
    new SlopeInterceptScreen( Tandem.ROOT.createTandem( 'slopeInterceptScreen' ) ),
    new PointSlopeScreen( Tandem.ROOT.createTandem( 'pointSlopeScreen' ) ),
    new LineGameScreen( Tandem.ROOT.createTandem( 'lineGameScreen' ) )
  ];

  const options = {
    credits: {
      leadDesign: 'Ariel Paul',
      softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
      team: 'Bryce Gruneich, Karina K. R. Hensberry, Patricia Loeblein, Amanda McGarry, Kathy Perkins',
      graphicArts: 'Mariah Hermsmeyer, Megan Lai, Sharon Siman-Tov',
      qualityAssurance: 'Steele Dalton, ' +
                        'Jaron Droder, ' +
                        'Bryce Griebenow, ' +
                        'Clifford Hardin, ' +
                        'Elise Morgan, ' +
                        'Liam Mulhall, ' +
                        'Oliver Orejola ' +
                        'Laura Rea, ' +
                        'Benjamin Roberts, ' +
                        'Jacob Romero, ' +
                        'Nancy Salpepi, ' +
                        'Kathryn Woessner, ' +
                        'Bryan Yoelin'
    }
  };

  const sim = new Sim( titleStringProperty, screens, options );
  sim.start();
} );