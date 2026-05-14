// Copyright 2015-2025, University of Colorado Boulder

/**
 * Displays a partial addition formula (or fragments), like "7 + 2 =", where parts can be filled in, and layout
 * automatically adjusts.
 *
 * @author Sharfudeen Ashraf
 */

import Multilink from '../../../../../axon/js/Multilink.js';
import MathSymbols from '../../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import makeATen from '../../../makeATen.js';
import ActiveTerm from '../../adding/model/ActiveTerm.js';
import MakeATenConstants from '../MakeATenConstants.js';

// constants
const EQUATION_FONT = new PhetFont( { size: 45, weight: 'bold' } );
const STROKE_COLOR = '#000';
const LAYOUT_MULTIPLIER = 1 / 4; // Fraction offset of the text from the background's border (25px)

class AdditionTermsNode extends Node {
  /**
   * @param {AdditionTerms} additionTerms - Our model, contains information about the left/right and active terms
   * @param {boolean} highlightBorders - Whether there should be highlighted borders around the active term.
   */
  constructor( additionTerms, highlightBorders ) {
    super();

    const leftTermText = new Text( '', { font: EQUATION_FONT, fill: MakeATenConstants.EQUATION_FILL } );
    const rightTermText = new Text( '', { font: EQUATION_FONT, fill: MakeATenConstants.EQUATION_FILL } );

    const plusText = new Text( MathSymbols.PLUS, { font: EQUATION_FONT, fill: MakeATenConstants.EQUATION_FILL } );
    const equalsSignText = new Text( MathSymbols.EQUAL_TO, {
      font: EQUATION_FONT,
      fill: MakeATenConstants.EQUATION_FILL
    } );

    // Game screen formula in the upper-left ("a + b ="):
    // keep it in a simple horizontal layout, matching the explore screen behavior.
    if ( !highlightBorders ) {
      this.addChild( new HBox( {
        children: [ leftTermText, plusText, rightTermText, equalsSignText ],
        spacing: 15
      } ) );

      additionTerms.leftTermProperty.link( term => {
        leftTermText.string = term ? term : '';
      } );

      additionTerms.rightTermProperty.link( term => {
        rightTermText.string = term ? term : '';
      } );

      // @public
      this.getLeftAlignment = () => leftTermText.right;
      this.getRightAlignment = () => rightTermText.left;
      return;
    }

    const backgroundOptions = {
      stroke: STROKE_COLOR,
      lineDash: [ 5, 5 ],
      lineWidth: 2,
      visible: highlightBorders
    };

    const leftNumberDisplayBackground = new Rectangle( 0, 0, 100, 78, 10, 10, backgroundOptions );
    const rightNumberDisplayBackground = new Rectangle( 0, 0, 100, 78, 10, 10, backgroundOptions );

    const numberDisplayBox = new HBox( {
      children: [ leftNumberDisplayBackground, plusText, rightNumberDisplayBackground ],
      spacing: 20,
      resize: false // since we toggle the stroke
    } );

    this.addChild( numberDisplayBox );
    this.addChild( leftTermText );
    this.addChild( rightTermText );
    this.addChild( equalsSignText );

    // Center everything vertically first
    const centerY = numberDisplayBox.centerY;
    leftTermText.centerY = centerY;
    rightTermText.centerY = centerY;
    equalsSignText.centerY = centerY;

    // Position the text nodes relative to their background boxes
    const updateLayout = () => {
      // Right term: positioned inside right background box
      rightTermText.left = rightNumberDisplayBackground.left + rightNumberDisplayBackground.width * LAYOUT_MULTIPLIER;

      // Left term: positioned inside left background box
      leftTermText.right = leftNumberDisplayBackground.right - leftNumberDisplayBackground.width * LAYOUT_MULTIPLIER;

      // Equals sign: positioned after right term
      if ( !rightTermText.bounds.isEmpty() ) {
        equalsSignText.left = rightTermText.right + 20;
      }
    };

    additionTerms.leftTermProperty.link( term => {
      leftTermText.string = term ? term : '';
      updateLayout();
    } );

    additionTerms.rightTermProperty.link( term => {
      rightTermText.string = term ? term : '';
      updateLayout();
    } );

    // Add highlights if applicable
    if ( highlightBorders ) {
      Multilink.multilink( [ additionTerms.leftTermProperty, additionTerms.activeTermProperty ], ( leftTerm, activeTerm ) => {
        leftNumberDisplayBackground.stroke = ( leftTerm === 0 || activeTerm === ActiveTerm.LEFT ) ? STROKE_COLOR : null;
        leftNumberDisplayBackground.fill = activeTerm === ActiveTerm.LEFT ? 'white' : null;
      } );
      Multilink.multilink( [ additionTerms.rightTermProperty, additionTerms.activeTermProperty ], ( rightTerm, activeTerm ) => {
        rightNumberDisplayBackground.stroke = ( rightTerm === 0 || activeTerm === ActiveTerm.RIGHT ) ? STROKE_COLOR : null;
        rightNumberDisplayBackground.fill = activeTerm === ActiveTerm.RIGHT ? 'white' : null;
      } );

      Multilink.multilink( [ additionTerms.leftTermProperty, additionTerms.rightTermProperty, additionTerms.activeTermProperty ], () => {
        equalsSignText.visible = additionTerms.hasBothTerms();
      } );
    }

    // @public
    this.getLeftAlignment = () => leftTermText.right;
    this.getRightAlignment = () => rightTermText.left;
  }
}

makeATen.register( 'AdditionTermsNode', AdditionTermsNode );

export default AdditionTermsNode;
