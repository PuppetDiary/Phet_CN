// Copyright 2013-2025, University of Colorado Boulder

/**
 * Portion of the scene graph that corresponds to the 'settings' game phase. (See GamePhase.SETTINGS)
 * The displays a panel with controls used to configure a game.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import LocalizedImageProperty from '../../../../joist/js/i18n/LocalizedImageProperty.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GLConstants from '../../common/GLConstants.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import LineGameModel from '../model/LineGameModel.js';
import LineGameLevelSelectionButtonGroup from './LineGameLevelSelectionButtonGroup.js';

export default class SettingsNode extends Node {

  /**
   * @param model
   * @param layoutBounds
   * @param levelImageProperties - images for the level-selection buttons, ordered by level
   * @param gameLevels - show buttons for these game levels
   * @param tandem
   */
  public constructor( model: LineGameModel, layoutBounds: Bounds2, levelImageProperties: LocalizedImageProperty[],
                      gameLevels: number[], tandem: Tandem ) {

    assert && assert( levelImageProperties.length === model.numberOfLevels, 'one image is required for each game level' );

    // Title
    const titleText = new Text( GraphingLinesStrings.chooseYourLevelStringProperty, {
      font: new PhetFont( 40 ),
      maxWidth: 0.85 * layoutBounds.width
    } );

    // Group of LevelSelectionButtons
    const levelSelectionButtonGroup = new LineGameLevelSelectionButtonGroup( model, levelImageProperties, gameLevels,
      tandem.createTandem( 'levelSelectionButtonGroup' ) );

    // title is centered on level-selection buttons
    const vBox = new VBox( {
      children: [ titleText, levelSelectionButtonGroup ],
      align: 'center',
      spacing: 50
    } );
    vBox.boundsProperty.link( () => {
      vBox.center = layoutBounds.center;
    } );

    // Timer and Sound controls
    const timerToggleButton = new TimerToggleButton( model.timerEnabledProperty, {
      stroke: 'gray',
      scale: 1.3,
      left: GLConstants.SCREEN_X_MARGIN,
      bottom: layoutBounds.height - GLConstants.SCREEN_Y_MARGIN
    } );

    // Reset All button, at rightBottom
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
      },
      scale: GLConstants.RESET_ALL_BUTTON_SCALE,
      right: layoutBounds.width - GLConstants.SCREEN_X_MARGIN,
      bottom: layoutBounds.height - GLConstants.SCREEN_Y_MARGIN
    } );

    super( {
      isDisposable: false,
      children: [ vBox, timerToggleButton, resetAllButton ],
      tandem: tandem
    } );
  }
}

graphingLines.register( 'SettingsNode', SettingsNode );