// Copyright 2017-2026, University of Colorado Boulder

/**
 * ScreenView for game screens
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../../../sun/js/Panel.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import LevelSelectionButtonGroup from '../../../../vegas/js/LevelSelectionButtonGroup.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import ScoreDisplayLabeledStars from '../../../../vegas/js/ScoreDisplayLabeledStars.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonGlobals from '../../common/AreaModelCommonGlobals.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import GenericFactorsNode from '../../generic/view/GenericFactorsNode.js';
import Entry from '../model/Entry.js';
import EntryDisplayType from '../model/EntryDisplayType.js';
import GameAreaDisplay from '../model/GameAreaDisplay.js';
import GameAreaModel from '../model/GameAreaModel.js';
import GameState from '../model/GameState.js';
import GameAreaDisplayNode from './GameAreaDisplayNode.js';
import GameAudio from './GameAudio.js';
import GameEditableLabelNode from './GameEditableLabelNode.js';
import PolynomialEditNode from './PolynomialEditNode.js';

const BUTTON_WIDTH = 150;
const BUTTON_HEIGHT = 150;

class GameAreaScreenView extends ScreenView {
  /**
   * @extends {ScreenView}
   *
   * @param {GameAreaModel} model
   * @param {Array<LocalizedImageProperty>} imageProperties - localized images
   * @param {number[]} gameLevels
   */
  constructor( model, imageProperties, gameLevels ) {
    assert && assert( model instanceof GameAreaModel );

    super();

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();

    // @private {Node} - The "right" half of the sliding layer, will slide into view when the user selects a level
    this.challengeLayer = new Node();

    // @private {GameAudio} - Responsible for all audio
    this.audio = new GameAudio( model );

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode( this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      useBoundsClip: false, // better performance without the clipping
      cachedNodes: [ this.levelSelectionLayer, this.challengeLayer ]
    } );
    this.addChild( this.transitionNode );
    model.currentLevelProperty.lazyLink( level => {
      if ( level ) {
        this.transitionNode.slideLeftTo( this.challengeLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        } );
      }
      else {
        this.transitionNode.dissolveTo( this.levelSelectionLayer, {
          duration: 0.4,
          gamma: 2.2,
          targetOptions: {
            easing: Easing.LINEAR
          }
        } );
      }
    } );

    const levelIcons = imageProperties.map( localizedImage => new Image( localizedImage ) );

    const buttonSpacing = 30;
    const levelButtons = model.levels.map( ( level, index ) => {
      return {
        icon: levelIcons[ index ],
        scoreProperty: level.scoreProperty,
        buttonListener: () => {
          model.selectLevel( level );
        },
        options: {
          createScoreDisplay: scoreProperty => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: AreaModelCommonConstants.NUM_CHALLENGES,
            perfectScore: AreaModelCommonConstants.PERFECT_SCORE
          } ),
          baseColor: level.colorProperty,
          soundPlayerIndex: index
        }
      };
    } );

    const buttonsPerRow = ( gameLevels.length <= 4 ) ? 4 : 3;

    const levelSelectionButtonGroup = new LevelSelectionButtonGroup( levelButtons, {
      groupButtonWidth: BUTTON_WIDTH,
      groupButtonHeight: BUTTON_HEIGHT,
      flowBoxOptions: {
        spacing: buttonSpacing, // horizontal spacing
        lineSpacing: buttonSpacing, // vertical spacing
        preferredWidth: buttonsPerRow * ( BUTTON_WIDTH + buttonSpacing ),
        wrap: true, // start a new row when preferredWidth is reached
        justify: 'center' // horizontal justification
      },
      gameLevels: gameLevels,
      center: this.layoutBounds.center
    } );

    const chooseYourLevelText = new Text( VegasStrings.chooseYourLevelStringProperty, {
      font: new PhetFont( 30 ),
      maxWidth: 550
    } );
    chooseYourLevelText.boundsProperty.link( () => {
      chooseYourLevelText.centerX = levelSelectionButtonGroup.centerX;
      chooseYourLevelText.bottom = levelSelectionButtonGroup.top - 55;
    } );

    this.levelSelectionLayer.addChild( chooseYourLevelText );
    this.levelSelectionLayer.addChild( levelSelectionButtonGroup );

    // Status bar
    let lastKnownLevel = null;
    // Create a property that holds the "last known" level, so that we don't change the view when we are switching
    // away from the current level back to the level selection.
    const lastLevelProperty = new DerivedProperty( [ model.currentLevelProperty ], level => {
      level = level || lastKnownLevel;
      lastKnownLevel = level;
      return level;
    } );
    const scoreProperty = new DynamicProperty( lastLevelProperty, {
      derive: 'scoreProperty'
    } );
    const statusBar = new FiniteStatusBar( this.layoutBounds, this.visibleBoundsProperty, scoreProperty, {
      challengeNumberProperty: new DynamicProperty( lastLevelProperty, {
        derive: 'challengeNumberProperty',
        defaultValue: 1
      } ),
      numberOfChallengesProperty: new NumberProperty( AreaModelCommonConstants.NUM_CHALLENGES ),
      levelProperty: new DerivedProperty( [ lastLevelProperty ], level => level ? level.number : 1 ),
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledStars( scoreProperty, {
        scoreDisplayStarsOptions: {
          numberOfStars: AreaModelCommonConstants.NUM_CHALLENGES,
          perfectScore: AreaModelCommonConstants.PERFECT_SCORE
        },
        font: AreaModelCommonConstants.GAME_STATUS_BAR_NON_BOLD_FONT
      } ),
      startOverButtonOptions: {
        listener: () => {
          // Reset the level on "Start Over", see https://github.com/phetsims/area-model-common/issues/87
          model.currentLevelProperty.value.startOver();
          model.currentLevelProperty.value = null;
        }
      },
      font: AreaModelCommonConstants.GAME_STATUS_BAR_NON_BOLD_FONT,
      levelTextOptions: {
        font: AreaModelCommonConstants.GAME_STATUS_BAR_BOLD_FONT
      },
      floatToTop: true,
      barFill: new DynamicProperty( lastLevelProperty, {
        derive: 'colorProperty',
        defaultValue: 'black'
      } ),
      yMargin: 18.25 // empirically determined to match published version 1.2.13
    } );
    this.challengeLayer.addChild( statusBar );

    // Prompt
    const promptText = new Text( ' ', {
      font: AreaModelCommonConstants.GAME_STATUS_BAR_PROMPT_FONT,
      pickable: false,
      maxWidth: 600,
      top: this.layoutBounds.top + statusBar.height + 20
    } );
    this.challengeLayer.addChild( promptText );
    new DynamicProperty( model.currentLevelProperty, {
      derive: 'currentChallengeProperty'
    } ).link( challenge => {
      // Could be null
      if ( challenge ) {
        promptText.stringProperty = challenge.description.getPromptStringProperty();
      }
    } );
    promptText.stringProperty.link( () => {
      // Center around the area's center.
      promptText.centerX = this.layoutBounds.left + AreaModelCommonConstants.GAME_AREA_OFFSET.x + AreaModelCommonConstants.AREA_SIZE / 2;
      // Don't let it go off the left side of the screen
      promptText.left = Math.max( promptText.left, this.layoutBounds.left + 20 );
    } );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
      },
      right: this.layoutBounds.right - AreaModelCommonConstants.LAYOUT_SPACING,
      bottom: this.layoutBounds.bottom - AreaModelCommonConstants.LAYOUT_SPACING
    } );
    this.levelSelectionLayer.addChild( resetAllButton );

    /*---------------------------------------------------------------------------*
    * Area display
    *----------------------------------------------------------------------------*/

    // @private {GameAreaDisplay}
    this.areaDisplay = new GameAreaDisplay( model.currentChallengeProperty );

    const gameAreaNode = new GameAreaDisplayNode( this.areaDisplay, model.activeEntryProperty, model.stateProperty, term => {
      model.setActiveTerm( term );
    } );
    this.challengeLayer.addChild( gameAreaNode );
    gameAreaNode.translation = this.layoutBounds.leftTop.plus( AreaModelCommonConstants.GAME_AREA_OFFSET );

    /*---------------------------------------------------------------------------*
    * Panels
    *----------------------------------------------------------------------------*/

    const panelAlignGroup = AreaModelCommonGlobals.panelAlignGroup;

    const factorsNode = new GenericFactorsNode( this.areaDisplay.totalProperties, this.areaDisplay.allowExponentsProperty );
    const factorsContent = this.createPanel( AreaModelCommonStrings.dimensionsStringProperty, panelAlignGroup, factorsNode );

    // If we have a polynomial, don't use this editable property (use the polynomial editor component instead)
    const totalTermEntryProperty = new DerivedProperty( [ this.areaDisplay.totalEntriesProperty ], totalEntries => totalEntries.length === 1 ? totalEntries[ 0 ] : new Entry( null ) );

    const totalNode = new GameEditableLabelNode( {
      entryProperty: totalTermEntryProperty,
      gameStateProperty: model.stateProperty,
      activeEntryProperty: model.activeEntryProperty,
      colorProperty: AreaModelCommonColors.totalEditableProperty,
      allowExponentsProperty: this.areaDisplay.allowExponentsProperty,
      orientation: Orientation.HORIZONTAL,
      labelFont: AreaModelCommonConstants.GAME_TOTAL_FONT,
      editFont: AreaModelCommonConstants.GAME_TOTAL_FONT
    } );
    const polynomialEditNode = new PolynomialEditNode( this.areaDisplay.totalProperty, this.areaDisplay.totalEntriesProperty, () => {
      if ( model.stateProperty.value === GameState.WRONG_FIRST_ANSWER ) {
        model.stateProperty.value = GameState.SECOND_ATTEMPT;
      }
    } );
    const polynomialReadoutText = new RichText( '?', {
      font: AreaModelCommonConstants.TOTAL_AREA_LABEL_FONT,
      maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX
    } );
    this.areaDisplay.totalProperty.link( total => {
      if ( total ) {
        polynomialReadoutText.string = total.toRichString( false );
      }
    } );

    const totalContainer = new Node();
    Multilink.multilink(
      [ this.areaDisplay.totalEntriesProperty, model.stateProperty ],
      ( totalEntries, gameState ) => {
        if ( totalEntries.length > 1 ) {
          if ( totalEntries[ 0 ].displayType === EntryDisplayType.EDITABLE &&
               gameState !== GameState.CORRECT_ANSWER &&
               gameState !== GameState.SHOW_SOLUTION ) {
            totalContainer.children = [ polynomialEditNode ];
          }
          else {
            totalContainer.children = [ polynomialReadoutText ];
          }
        }
        else {
          totalContainer.children = [ totalNode ];
        }
      } );

    const productContent = this.createPanel( AreaModelCommonStrings.totalAreaOfModelStringProperty, panelAlignGroup, totalContainer );

    const panelBox = new VBox( {
      children: [
        factorsContent,
        productContent
      ],
      spacing: AreaModelCommonConstants.LAYOUT_SPACING
    } );
    this.challengeLayer.addChild( new AlignBox( panelBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      topMargin: gameAreaNode.y,
      rightMargin: AreaModelCommonConstants.LAYOUT_SPACING
    } ) );

    /**
     * Creates a game-style button that may be enabled via a property
     *
     * @param {TReadOnlyProperty<string>} label
     * @param {function} listener - The callback for when the button is pressed
     * @param {Property.<boolean>} [enabledProperty]
     */
    const createGameButton = ( label, listener, enabledProperty ) => {
      const button = new RectangularPushButton( {
        content: new Text( label, {
          font: AreaModelCommonConstants.BUTTON_FONT,
          maxWidth: 200
        } ),
        touchAreaXDilation: 10,
        touchAreaYDilation: 10,
        listener: listener,
        baseColor: AreaModelCommonColors.gameButtonBackgroundProperty,
        top: panelBox.bottom + 80
      } );
      button.localBoundsProperty.link( () => {
        button.centerX = panelBox.centerX;
      } );
      enabledProperty && enabledProperty.link( enabled => {
        button.enabled = enabled;
      } );
      this.challengeLayer.addChild( button );
      return button;
    };

    const checkButton = createGameButton( VegasStrings.checkStringProperty, () => {
      model.check();
    }, model.allowCheckingProperty );

    const tryAgainButton = createGameButton( VegasStrings.tryAgainStringProperty, () => {
      model.tryAgain();
    } );

    const nextButton = createGameButton( VegasStrings.nextStringProperty, () => {
      model.next();
    } );

    const showAnswerButton = createGameButton( VegasStrings.showAnswerStringProperty, () => {
      model.showAnswer();
    } );

    let cheatButton = null;

    // Cheat button, see https://github.com/phetsims/area-model-common/issues/116 and
    // https://github.com/phetsims/area-model-common/issues/163
    if ( phet.chipper.queryParameters.showAnswers ) {
      cheatButton = new RectangularPushButton( {
        content: new FaceNode( 40 ),
        top: showAnswerButton.bottom + 10,
        centerX: showAnswerButton.centerX,
        listener: () => model.cheat()
      } );
      this.challengeLayer.addChild( cheatButton );
    }

    const faceScoreNode = new FaceWithPointsNode( {
      faceDiameter: 90,
      pointsAlignment: 'rightBottom',
      pointsFont: AreaModelCommonConstants.SCORE_INCREASE_FONT,
      spacing: 10,
      centerX: showAnswerButton.centerX, // a bit unclean, since the text hasn't been positioned yet.
      top: showAnswerButton.bottom + 10
    } );
    this.challengeLayer.addChild( faceScoreNode );

    const levelCompleteContainer = new Node();
    this.challengeLayer.addChild( levelCompleteContainer );

    // @private {RewardNode|null} - We need to step it when there is one
    this.rewardNode = null;

    const rewardNodes = RewardNode.createRandomNodes( [
      new FaceNode( 40, { headStroke: 'black', headLineWidth: 1.5 } ),
      new StarNode()
    ], 100 );
    Orientation.enumeration.values.forEach( orientation => {
      const colorProperty = AreaModelCommonColors.genericColorProperties.get( orientation );

      _.range( 1, 10 ).forEach( digit => {
        [ -1, 1 ].forEach( sign => {
          const powers = model.hasExponents ? [ 0, 1, 2 ] : [ 0, 0, 0 ];
          powers.forEach( power => {
            rewardNodes.push( new RichText( new Term( sign * digit, power ).toRichString( false ), {
              font: AreaModelCommonConstants.REWARD_NODE_FONT,
              fill: colorProperty
            } ) );
          } );
        } );
      } );
    } );

    let levelCompletedNode = null;

    model.stateProperty.link( ( state, oldState ) => {
      // When we switch back to level selection, try to leave things as they were.
      if ( state !== null ) {
        gameAreaNode.visible = state !== GameState.LEVEL_COMPLETE;
        panelBox.visible = state !== GameState.LEVEL_COMPLETE;
        statusBar.visible = state !== GameState.LEVEL_COMPLETE;
        promptText.visible = state !== GameState.LEVEL_COMPLETE;
        levelCompleteContainer.visible = state === GameState.LEVEL_COMPLETE;
        checkButton.visible = state === GameState.FIRST_ATTEMPT ||
                              state === GameState.SECOND_ATTEMPT;
        tryAgainButton.visible = state === GameState.WRONG_FIRST_ANSWER;
        nextButton.visible = state === GameState.CORRECT_ANSWER ||
                             state === GameState.SHOW_SOLUTION;
        showAnswerButton.visible = state === GameState.WRONG_SECOND_ANSWER;
        faceScoreNode.visible = state === GameState.CORRECT_ANSWER ||
                                state === GameState.WRONG_FIRST_ANSWER ||
                                state === GameState.WRONG_SECOND_ANSWER;
        if ( cheatButton ) {
          cheatButton.visible = state === GameState.FIRST_ATTEMPT ||
                                state === GameState.SECOND_ATTEMPT;
        }
      }
      if ( state === GameState.CORRECT_ANSWER ) {
        faceScoreNode.smile();
        faceScoreNode.setPoints( oldState === GameState.FIRST_ATTEMPT ? 2 : 1 );
      }
      else if ( state === GameState.WRONG_FIRST_ANSWER || state === GameState.WRONG_SECOND_ANSWER ) {
        faceScoreNode.frown();
      }
      if ( state === GameState.LEVEL_COMPLETE ) {
        const level = model.currentLevelProperty.value;

        levelCompletedNode && levelCompletedNode.dispose();
        levelCompletedNode = new LevelCompletedNode(
          level.number,
          level.scoreProperty.value,
          AreaModelCommonConstants.PERFECT_SCORE,
          AreaModelCommonConstants.NUM_CHALLENGES,
          false, 0, 0, 0,
          () => model.moveToLevelSelection(), {
            cornerRadius: 8,
            center: this.layoutBounds.center,
            fill: level.colorProperty,
            contentMaxWidth: 400
          } );

        levelCompleteContainer.children = [
          levelCompletedNode
        ];

        if ( level.scoreProperty.value === AreaModelCommonConstants.PERFECT_SCORE ) {
          this.rewardNode = new RewardNode( {
            nodes: rewardNodes
          } );
          levelCompleteContainer.insertChild( 0, this.rewardNode );
        }
      }
      else {
        if ( this.rewardNode ) {
          this.rewardNode.detach();
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
      }
    } );
  }

  /**
   * Creates a panel interior with the title left-aligned, and the content somewhat offset from the left with a
   * guaranteed margin.
   * @private
   *
   * @param {TReadOnlyProperty<string>} titleStringProperty
   * @param {AlignGroup} panelAlignGroup
   * @param {Node} content
   */
  createPanel( titleStringProperty, panelAlignGroup, content ) {
    const panelContent = new VBox( {
      children: [
        new AlignBox( new Text( titleStringProperty, {
          font: AreaModelCommonConstants.TITLE_FONT,
          maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX
        } ), {
          group: panelAlignGroup,
          xAlign: 'left'
        } ),
        new AlignBox( content, {
          group: panelAlignGroup,
          xAlign: 'center'
        } )
      ],
      spacing: 10
    } );
    return new Panel( panelContent, {
      xMargin: 15,
      yMargin: 10,
      fill: AreaModelCommonColors.panelBackgroundProperty,
      stroke: AreaModelCommonColors.panelBorderProperty,
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS
    } );
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.transitionNode.step( dt );

    this.rewardNode && this.rewardNode.step( dt );
  }
}

areaModelCommon.register( 'GameAreaScreenView', GameAreaScreenView );

export default GameAreaScreenView;