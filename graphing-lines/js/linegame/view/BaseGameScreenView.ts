// Copyright 2013-2025, University of Colorado Boulder

/**
 * The base type for the 'Line Game' view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import LocalizedImageProperty from '../../../../joist/js/i18n/LocalizedImageProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import GLConstants from '../../common/GLConstants.js';
import graphingLines from '../../graphingLines.js';
import BaseGameModel from '../model/BaseGameModel.js';
import GamePhase from '../model/GamePhase.js';
import PlayNode from './PlayNode.js';
import ResultsNode, { RewardNodeFunction } from './ResultsNode.js';
import SettingsNode from './SettingsNode.js';

export default class BaseGameScreenView extends ScreenView {

  // a node for each 'phase' of the game
  private readonly settingsNode: SettingsNode;
  private readonly playNode: PlayNode;
  private readonly resultsNode: ResultsNode;

  /**
   * @param model
   * @param gameLevels - show buttons for these game levels
   * @param levelImageProperties - images for the level-selection buttons, ordered by level
   * @param rewardNodeFunctions - functions that create nodes for the game reward, ordered by level
   * @param tandem
   */
  public constructor( model: BaseGameModel,
                      gameLevels: number[],
                      levelImageProperties: LocalizedImageProperty[],
                      rewardNodeFunctions: RewardNodeFunction[],
                      tandem: Tandem ) {

    super( {
      layoutBounds: GLConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    } );

    // sounds
    const audioPlayer = new GameAudioPlayer();

    this.settingsNode = new SettingsNode( model, this.layoutBounds, levelImageProperties, gameLevels, tandem.createTandem( 'settingsNode' ) );
    this.playNode = new PlayNode( model, this.layoutBounds, this.visibleBoundsProperty, audioPlayer );
    this.resultsNode = new ResultsNode( model, this.layoutBounds, audioPlayer, rewardNodeFunctions );

    // game 'phase' changes
    // unlink unnecessary because BaseGameScreenView exists for the lifetime of the sim.
    model.gamePhaseProperty.link( gamePhase => {
      this.settingsNode.visible = ( gamePhase === GamePhase.SETTINGS );
      this.playNode.visible = ( gamePhase === GamePhase.PLAY );
      this.resultsNode.visible = ( gamePhase === GamePhase.RESULTS );
    } );

    const screenViewRootNode = new Node( {
      children: [
        this.resultsNode,
        this.playNode,
        this.settingsNode
      ]
    } );
    this.addChild( screenViewRootNode );
  }

  public override step( dt: number ): void {
    if ( this.resultsNode.visible ) {
      this.resultsNode.step( dt );
    }
    super.step( dt );
  }
}

graphingLines.register( 'BaseGameScreenView', BaseGameScreenView );