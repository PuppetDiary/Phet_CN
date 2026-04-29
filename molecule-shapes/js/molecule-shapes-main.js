// Copyright 2014-2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import adaptedFromPhetLogoOnWhite_png from '../../brand/adapted-from-phet/images/logoOnWhite_png.js';
import CanvasWarningNode from '../../scenery-phet/js/CanvasWarningNode.js';
import Tandem from '../../tandem/js/Tandem.js';
import MoleculeShapesGlobals from './common/MoleculeShapesGlobals.js';
import SimulationPreferencesContentNode from './common/view/SimulationPreferencesContentNode.js';
import ModelMoleculesScreen from './model/ModelMoleculesScreen.js';
import MoleculeShapesStrings from './MoleculeShapesStrings.js';
import RealMoleculesScreen from './real/RealMoleculesScreen.js';

const isBasicsVersion = false;

const simOptions = {
  credits: {
    leadDesign: 'Emily B. Moore',
    softwareDevelopment: 'Jonathan Olson',
    team: 'Julia Chamberlain, Kelly Lancaster, Ariel Paul, Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Steele Dalton, Jaron Droder, Bryce Griebenow, Clifford Hardin, Brooklyn Lash, Emily Miller, Elise Morgan, Liam Mulhall, Oliver Orejola, Jacob Romero, Nancy Salpepi, Kathryn Woessner, Bryan Yoelin'
  },
  webgl: true,
  preferencesModel: new PreferencesModel( {
    visualOptions: {
      supportsProjectorMode: true
    },
    simulationOptions: {
      customPreferences: [ {
        createContent: tandem => new SimulationPreferencesContentNode( isBasicsVersion, tandem.createTandem( 'simPreferences' ) )
      } ]
    }
  } ),

  homeScreenWarningNode: MoleculeShapesGlobals.useWebGLProperty.value ? null : new CanvasWarningNode(),

  // phet-io options
  phetioDesigned: true
};

// Molecule Shapes home screen uses a light navigation bar.
// For adapted-from-phet builds, force the black-text GKX logo so it remains visible on white backgrounds.
if ( phet.chipper.brand === 'adapted-from-phet' ) {
  simOptions.navigationBarBrand = {
    logoOnBlackBackground: adaptedFromPhetLogoOnWhite_png,
    logoOnWhiteBackground: adaptedFromPhetLogoOnWhite_png
  };
}

// NOTE: ?webgl=false will trigger Canvas rendering with a reduced poly-count

simLauncher.launch( () => {
  const sim = new Sim( MoleculeShapesStrings[ 'molecule-shapes' ].titleStringProperty, [
    new ModelMoleculesScreen( isBasicsVersion, Tandem.ROOT.createTandem( 'modelScreen' ) ),
    new RealMoleculesScreen( isBasicsVersion, Tandem.ROOT.createTandem( 'realMoleculesScreen' ) )
  ], simOptions );
  sim.start();
} );
