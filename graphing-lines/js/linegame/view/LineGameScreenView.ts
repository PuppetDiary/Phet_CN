// Copyright 2013-2024, University of Colorado Boulder

/**
 * View for the 'Line Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GLQueryParameters, { NUMBER_OF_GAME_LEVELS } from '../../common/GLQueryParameters.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesImages from '../../GraphingLinesImages.js';
import LineGameModel from '../model/LineGameModel.js';
import BaseGameScreenView from './BaseGameScreenView.js';
import GLRewardNode from './GLRewardNode.js';

export default class LineGameScreenView extends BaseGameScreenView {

  public constructor( model: LineGameModel, tandem: Tandem ) {

    // Images for the level-selection buttons, ordered by level
    const levelImageProperties = [
      GraphingLinesImages.level1ImageProperty,
      GraphingLinesImages.level2ImageProperty,
      GraphingLinesImages.level3ImageProperty,
      GraphingLinesImages.level4ImageProperty,
      GraphingLinesImages.level5ImageProperty,
      GraphingLinesImages.level6ImageProperty
    ];

    // functions that create nodes for the game reward, ordered by level
    const rewardNodeFunctions = [
      GLRewardNode.createEquationNodes,
      GLRewardNode.createGraphNodes,
      GLRewardNode.createPointToolNodes,
      GLRewardNode.createSmileyFaceNodes,
      GLRewardNode.createPaperAirplaneNodes,
      GLRewardNode.createAssortedNodes
    ];
    assert && assert( rewardNodeFunctions.length === NUMBER_OF_GAME_LEVELS );

    super( model, GLQueryParameters.gameLevels, levelImageProperties, rewardNodeFunctions, tandem );
  }
}

graphingLines.register( 'LineGameScreenView', LineGameScreenView );