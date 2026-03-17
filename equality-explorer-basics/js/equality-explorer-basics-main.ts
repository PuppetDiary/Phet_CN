// Copyright 2018-2024, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BasicsScreen from '../../equality-explorer/js/basics/BasicsScreen.js';
import EqualityExplorerConstants from '../../equality-explorer/js/common/EqualityExplorerConstants.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import EqualityExplorerBasicsStrings from './EqualityExplorerBasicsStrings.js';
import LabScreen from './lab/LabScreen.js';

simLauncher.launch( () => {

  const titleStringProperty = EqualityExplorerBasicsStrings[ 'equality-explorer-basics' ].titleStringProperty;

  const screens = [
    new BasicsScreen( { tandem: Tandem.ROOT.createTandem( 'basicsScreen' ) } ),
    new LabScreen( { tandem: Tandem.ROOT.createTandem( 'labScreen' ) } )
  ];

  const sim = new Sim( titleStringProperty, screens, {
    credits: EqualityExplorerConstants.CREDITS
  } );

  sim.start();
} );