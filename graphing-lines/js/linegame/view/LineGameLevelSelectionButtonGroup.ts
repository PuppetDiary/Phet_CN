// Copyright 2013-2025, University of Colorado Boulder

/**
 * LineGameLevelSelectionButtonGroup is the group of level-selection buttons for the 'Line Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import LocalizedImageProperty from '../../../../joist/js/i18n/LocalizedImageProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import LevelSelectionButtonGroup, { LevelSelectionButtonGroupItem } from '../../../../vegas/js/LevelSelectionButtonGroup.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import GamePhase from '../model/GamePhase.js';
import LineGameModel from '../model/LineGameModel.js';

const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 250;

// Layout of buttons
const X_SPACING = 25;
const Y_SPACING = 25;

export default class LineGameLevelSelectionButtonGroup extends LevelSelectionButtonGroup {

  /**
   * @param model
   * @param levelImageProperties - images for the level-selection buttons, ordered by level
   * @param gameLevels - show buttons for these game levels
   * @param tandem
   */
  public constructor( model: LineGameModel, levelImageProperties: LocalizedImageProperty[], gameLevels: number[], tandem: Tandem ) {
    assert && assert( levelImageProperties.length === model.numberOfLevels, 'one image is required for each game level' );

    // To give all button icons the same effective size
    const iconAlignGroup = new AlignGroup();

    // Descriptions of LevelSelectionButtons
    const levelSelectionButtonItems: LevelSelectionButtonGroupItem[] = [];
    for ( let level = 0; level < model.numberOfLevels; level++ ) {
      levelSelectionButtonItems.push( {
        icon: createLevelSelectionButtonIcon( level, levelImageProperties[ level ], iconAlignGroup ),
        scoreProperty: model.bestScoreProperties[ level ],
        buttonListener: () => {
          model.levelProperty.value = level;
          model.setGamePhase( GamePhase.PLAY );
        },
        options: {
          bestTimeForScoreProperty: model.bestTimeProperties[ level ],
          createScoreDisplay: scoreProperty => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: model.challengesPerGameProperty.value,
            perfectScore: model.getPerfectScore()
          } ),
          soundPlayerIndex: level
        }
      } );
    }

    const buttonsPerRow = ( gameLevels.length <= 4 ) ? 4 : 3;

    super( levelSelectionButtonItems, {

      // LevelSelectionButtonGroupOptions
      isDisposable: false,
      levelSelectionButtonOptions: {
        baseColor: 'rgb( 180, 205, 255 )',
        vBoxOptions: { spacing: 5 }
      },
      groupButtonWidth: BUTTON_WIDTH,
      groupButtonHeight: BUTTON_HEIGHT,

      // A maximum number of buttons per row, wrapping to a new row
      flowBoxOptions: {
        spacing: X_SPACING, // horizontal spacing
        lineSpacing: Y_SPACING, // vertical spacing
        preferredWidth: buttonsPerRow * ( BUTTON_WIDTH + X_SPACING ),
        wrap: true, // start a new row when preferredWidth is reached
        justify: 'center' // horizontal justification
      },
      gameLevels: gameLevels,
      tandem: tandem
    } );
  }
}

/**
 * Creates an icon for a LevelSelectionButton.
 */
function createLevelSelectionButtonIcon( level: number, imageProperty: LocalizedImageProperty, iconAlignGroup: AlignGroup ): Node {

  // Level N
  const stringProperty = new DerivedStringProperty( [ GraphingLinesStrings.pattern_Level_0StringProperty ],
    pattern => StringUtils.format( pattern, level + 1 ) );
  const text = new Text( stringProperty, {
    font: new PhetFont( 40 ),
    maxWidth: 100
  } );

  const image = new Image( imageProperty, { scale: 0.54 } );

  const alignBox = new AlignBox( image, {
    group: iconAlignGroup
  } );

  // 'Level N' centered above image
  return new VBox( {
    isDisposable: false,
    spacing: 5,
    children: [ text, alignBox ]
  } );
}

graphingLines.register( 'LineGameLevelSelectionButtonGroup', LineGameLevelSelectionButtonGroup );