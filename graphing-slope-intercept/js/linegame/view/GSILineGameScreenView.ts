// Copyright 2017-2024, University of Colorado Boulder

/**
 * View for the 'Line Game' screen in the 'Graphing Slope-Intercept' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BaseGameScreenView from '../../../../graphing-lines/js/linegame/view/BaseGameScreenView.js';
import GLRewardNode from '../../../../graphing-lines/js/linegame/view/GLRewardNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GraphingSlopeInterceptImages from '../../GraphingSlopeInterceptImages.js';
import GSIQueryParameters, { NUMBER_OF_GAME_LEVELS } from '../../GSIQueryParameters.js';
import GSILineGameModel from '../model/GSILineGameModel.js';

export default class GSILineGameScreenView extends BaseGameScreenView {

  public constructor( model: GSILineGameModel, tandem: Tandem ) {

    // Images for the level-selection buttons, ordered by level
    const levelImageProperties = [
      GraphingSlopeInterceptImages.level1ImageProperty,
      GraphingSlopeInterceptImages.level2ImageProperty,
      GraphingSlopeInterceptImages.level3ImageProperty,
      GraphingSlopeInterceptImages.level4ImageProperty
    ];

    // functions that create nodes for the game reward, ordered by level
    const rewardNodeFunctions = [
      GLRewardNode.createGraphNodes,
      GLRewardNode.createPointToolNodes,
      GLRewardNode.createPaperAirplaneNodes,
      GLRewardNode.createSmileyFaceNodes
    ];
    assert && assert( rewardNodeFunctions.length === NUMBER_OF_GAME_LEVELS );

    super( model, GSIQueryParameters.gameLevels, levelImageProperties, rewardNodeFunctions, tandem );
  }
}

graphingSlopeIntercept.register( 'GSILineGameScreenView', GSILineGameScreenView );