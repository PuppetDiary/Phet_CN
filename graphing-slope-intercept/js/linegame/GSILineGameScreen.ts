// Copyright 2017-2025, University of Colorado Boulder

/**
 * The 'Line Game' screen in the 'Graphing Slope-Intercept' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GLIconFactory from '../../../graphing-lines/js/common/view/GLIconFactory.js';
import GraphingLinesStrings from '../../../graphing-lines/js/GraphingLinesStrings.js';
import Screen from '../../../joist/js/Screen.js';
import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import graphingSlopeIntercept from '../graphingSlopeIntercept.js';
import GSILineGameModel from './model/GSILineGameModel.js';
import GSILineGameScreenView from './view/GSILineGameScreenView.js';

export default class GSILineGameScreen extends Screen<GSILineGameModel, GSILineGameScreenView> {

  public constructor( tandem: Tandem, backgroundColorProperty: ProfileColorProperty ) {

    const options = {
      name: GraphingLinesStrings.screen.lineGameStringProperty,
      backgroundColorProperty: backgroundColorProperty,
      homeScreenIcon: GLIconFactory.createGameScreenIcon(),
      tandem: tandem
    };

    super(
      () => new GSILineGameModel( tandem.createTandem( 'model' ) ),
      model => new GSILineGameScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

graphingSlopeIntercept.register( 'GSILineGameScreen', GSILineGameScreen );