// Copyright 2016-2025, University of Colorado Boulder

/**
 * Displays a question and associated answer in the Shopping screen.
 * Values are entered via a keypad.
 * Layout is specified in https://github.com/phetsims/unit-rates/issues/152
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import TColor from '../../../../scenery/js/util/TColor.js';
import checkSolidShape from '../../../../sherpa/js/fontawesome-5/checkSolidShape.js';
import editRegularShape from '../../../../sherpa/js/fontawesome-5/editRegularShape.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URUtils from '../../common/URUtils.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import KeypadPanel from '../../common/view/KeypadPanel.js';
import unitRates from '../../unitRates.js';
import ShoppingQuestion from '../model/ShoppingQuestion.js';

type SelfOptions = {
  valueBoxWidth?: number; // width of the value field, height determined by valueFont
  denominatorVisible?: boolean; // is the denominator visible before the answer is visible?
  neutralColor?: TColor; // color for UI elements that are agnostic about whether the guess is correct
  questionFont?: PhetFont; // font for the question
  valueFont?: PhetFont; // font for the value
  valueYMargin?: number; // vertical margin inside the value box
  xSpacing?: number; // horizontal spacing between UI elements
  ySpacing?: number;  // vertical spacing between UI elements
  fractionYSpacing?: number; // vertical space above and below fraction line
};

type ShoppingQuestionNodeOptions = SelfOptions;

export default class ShoppingQuestionNode extends Node {

  private readonly disposeShoppingQuestionNode: () => void;

  /**
   * @param question - model element for the question
   * @param questionsAccordionBox - accordion box that contains the question, for positioning the keypad
   * @param keypadLayer - layer that manages the keypad
   * @param [providedOptions]
   */
  public constructor( question: ShoppingQuestion, questionsAccordionBox: AccordionBox, keypadLayer: KeypadLayer,
                      providedOptions?: ShoppingQuestionNodeOptions ) {

    const options = optionize<ShoppingQuestionNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      valueBoxWidth: 70,
      denominatorVisible: false,
      neutralColor: 'black',
      questionFont: new PhetFont( 14 ),
      valueFont: new PhetFont( 14 ),
      valueYMargin: 1,
      xSpacing: 25,
      ySpacing: 5,
      fractionYSpacing: 3
    }, providedOptions );

    super();

    // local vars to improve readability
    const answer = question.answer;
    const answerAxis = question.answerAxis;

    // box that is either empty or displays an incorrect value
    const valueBoxWidth = options.valueBoxWidth;
    const valueBoxHeight = new Text( '0', { font: options.valueFont } ).height + ( 2 * options.valueYMargin );
    const valueBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight, {
      stroke: 'black',
      fill: 'white',
      cursor: 'pointer'
    } );
    this.addChild( valueBox );
    valueBox.touchArea = valueBox.localBounds.dilatedXY( 5, 5 );

    // edit button, to the right of the box
    const editButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButtonColorProperty,
      left: valueBox.right + options.xSpacing,
      centerY: valueBox.centerY
    } );
    this.addChild( editButton );
    editButton.touchArea = editButton.localBounds.dilatedXY( 10, 10 );

    // strut to the left of the box, same width as editButton
    // See layout specification in https://github.com/phetsims/unit-rates/issues/152
    const strut = new HStrut( editButton.width, {
      right: valueBox.left - options.xSpacing,
      centerY: valueBox.centerY
    } );
    this.addChild( strut );

    // check mark to right of box, to indicate that the question has been correctly answered
    const checkMarkNode = new Path( checkSolidShape, {
      scale: 0.06,
      fill: URColors.checkMarkColorProperty,
      left: valueBox.right + options.xSpacing,
      centerY: valueBox.centerY,
      visible: false
    } );
    this.addChild( checkMarkNode );

    // the question, centered above the box
    const questionText = new Text( question.questionStringProperty, {
      font: options.questionFont,
      maxWidth: 180 // i18n, determined empirically
    } );
    this.addChild( questionText );
    questionText.localBoundsProperty.link( () => {
      questionText.centerX = valueBox.centerX;
      questionText.bottom = valueBox.top - options.ySpacing;
    } );

    // the user's guess, as entered via the keypad, appears centered in the box
    const guessNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in valueBox to open keypad
      fill: options.neutralColor,
      font: options.valueFont,
      maxWidth: 0.8 * valueBoxWidth
    } );
    this.addChild( guessNode );
    guessNode.localBoundsProperty.link( () => {
      guessNode.center = valueBox.center;
    } );

    // numerator in the revealed answer, replaces the box when the answer is correct
    const numeratorText = new Text( question.numeratorStringProperty, {
      fill: URColors.correctQuestionColorProperty,
      font: options.valueFont,
      visible: false,
      maxWidth: 100 // i18n, determined empirically
    } );
    this.addChild( numeratorText );
    numeratorText.localBoundsProperty.link( () => {
      numeratorText.center = valueBox.center;
    } );

    // fraction line in the revealed answer
    const fractionLineNode = new Line( 0, 0, 1.1 * valueBox.width, 0, {
      stroke: options.neutralColor,
      lineWidth: 1,
      centerX: valueBox.centerX,
      top: valueBox.bottom + options.fractionYSpacing,
      visible: options.denominatorVisible
    } );
    this.addChild( fractionLineNode );

    // denominator in the revealed answer
    const denominatorText = new Text( question.denominatorStringProperty, {
      fill: options.neutralColor,
      font: options.valueFont,
      visible: options.denominatorVisible,
      maxWidth: 100 // i18n, determined empirically
    } );
    this.addChild( denominatorText );
    denominatorText.localBoundsProperty.link( () => {
      denominatorText.centerX = valueBox.centerX;
      denominatorText.top = fractionLineNode.bottom + options.fractionYSpacing;
    } );

    this.mutate( options );

    // Update when the guess changes
    const multilink = new Multilink( [ question.guessProperty, answerAxis.valueFormatStringProperty ],
      ( guess, valueFormat ) => {

        // compare guess to answer using the desired number of decimal places
        const correct = ( guess === answer );

        // update the guess
        if ( guess !== null ) {
          guessNode.string = URUtils.formatNumber( valueFormat, guess, answerAxis.maxDecimals, answerAxis.trimZeros );
          guessNode.fill = correct ? URColors.correctQuestionColorProperty : URColors.incorrectQuestionColorProperty;
        }
        else if ( phet.chipper.queryParameters.showAnswers ) {

          // show the answer, if query parameter is set
          guessNode.string = URUtils.formatNumber( valueFormat, answer, answerAxis.maxDecimals, answerAxis.trimZeros );
          guessNode.fill = URColors.showAnswers;
        }
        else {
          guessNode.string = '';
        }
        guessNode.visible = !correct;
        guessNode.center = valueBox.center; // center guess in box

        // update other UI elements
        editButton.visible = !correct;
        valueBox.visible = !correct;
        checkMarkNode.visible = correct;
        numeratorText.visible = correct;
        fractionLineNode.stroke = denominatorText.fill = ( correct ? URColors.correctQuestionColorProperty : options.neutralColor );

        // The denominator is sometimes visible at all times (e.g. for the 'Unit Rate?' question).
        // If it's not visible at all times, make it visible when the answer is revealed.
        if ( !options.denominatorVisible ) {
          fractionLineNode.visible = denominatorText.visible = correct;
        }
      } );

    // highlight the value box to indicate that an edit is in progress
    const onBeginEdit = () => {
      valueBox.fill = URColors.edit;
    };

    // clear highlight to indicate that the edit is completed
    const onEndEdit = () => {
      valueBox.fill = 'white';
    };

    // position the keypad relative to the Questions panel
    const setKeypadPanelPosition = ( keypadPanel: KeypadPanel ) => {
      const questionsAccordionBoxBounds = keypadPanel.globalToParentBounds( questionsAccordionBox.localToGlobalBounds( questionsAccordionBox.localBounds ) );
      keypadPanel.right = questionsAccordionBoxBounds.left - 10;
      keypadPanel.bottom = questionsAccordionBoxBounds.bottom;
    };

    // opens a keypad to edit the user's guess
    const editValue = () => {
      keypadLayer.beginEdit( question.guessProperty, {
        onBeginEdit: onBeginEdit,
        onEndEdit: onEndEdit,
        setKeypadPanelPosition: setKeypadPanelPosition,
        maxDigits: answerAxis.maxDigits,
        maxDecimals: answerAxis.maxDecimals
      } );
    };

    // Press on editButton or in valueBox to begin editing
    editButton.addListener( editValue ); // no removeListener required
    valueBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editValue
    } ) );

    this.disposeShoppingQuestionNode = () => {
      editButton.dispose();
      checkMarkNode.dispose();
      questionText.dispose();
      guessNode.dispose();
      numeratorText.dispose();
      fractionLineNode.dispose();
      denominatorText.dispose();
      multilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeShoppingQuestionNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingQuestionNode', ShoppingQuestionNode );