// Copyright 2016-2025, University of Colorado Boulder

/**
 * Displays questions in an accordion box, with a refresh button.
 * Layout is specified in https://github.com/phetsims/unit-rates/issues/152
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingQuestion from '../model/ShoppingQuestion.js';
import ShoppingScene from '../model/ShoppingScene.js';
import ShoppingQuestionNode from './ShoppingQuestionNode.js';

type SelfOptions = {
  vBoxSpacing?: number; // vertical spacing between UI elements in the accordion box's content
};

type ShoppingQuestionsAccordionBoxOptions = SelfOptions & PickRequired<AccordionBox, 'expandedProperty'>;

export default class ShoppingQuestionsAccordionBox extends AccordionBox {

  public constructor( shoppingScene: ShoppingScene, keypadLayer: KeypadLayer, providedOptions?: ShoppingQuestionsAccordionBoxOptions ) {

    const options = optionize4<ShoppingQuestionsAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()(
      {}, URConstants.ACCORDION_BOX_OPTIONS, {

        // SelfOptions
        vBoxSpacing: 12,

        // AccordionBoxOptions
        // tight vertical margins and spacing, see https://github.com/phetsims/unit-rates/issues/140
        isDisposable: false,
        titleYMargin: 0,
        contentXMargin: 10,
        contentYMargin: 6,
        contentYSpacing: 2,
        titleNode: new Text( UnitRatesStrings.questionsStringProperty, {
          font: URConstants.ACCORDION_BOX_TITLE_FONT,
          maxWidth: 100
        } )
      }, providedOptions );

    // Refresh button, advances to the next question set
    const refreshButton = new RefreshButton( {
      iconHeight: 14,
      xMargin: 10,
      yMargin: 5,
      baseColor: URColors.refreshButtonColorProperty,
      listener: () => shoppingScene.nextQuestionSet()
    } );
    refreshButton.touchArea = refreshButton.localBounds.dilatedXY( 5, 5 );

    const questionsVBox = new VBox( {
      spacing: options.vBoxSpacing,
      align: 'right'
    } );

    // AccordionBox content
    const contentNode = new VBox( {
      spacing: 0, // no space here, we want refreshButton snug against bottom question
      align: 'left',
      children: [
        questionsVBox,
        refreshButton
      ]
    } );

    super( contentNode, options );

    // 'Unit Rate?' question, which does not change when the refresh button is pressed.
    const unitRateQuestionNode = new ShoppingQuestionNode( shoppingScene.unitRateQuestion, this, keypadLayer, {
      denominatorVisible: true
    } );

    // Below the 'Unit Rate?' question is a set of questions that change when the refresh button is pressed.
    const dynamicQuestionNodes: ShoppingQuestionNode[] = [];
    const questionSetObserver = ( questionSet: ShoppingQuestion[] ) => {

      // remove previous questions
      dynamicQuestionNodes.forEach( node => node.dispose() );
      dynamicQuestionNodes.length = 0;

      // add new questions, dispose required
      for ( let i = 0; i < questionSet.length; i++ ) {
        dynamicQuestionNodes.push( new ShoppingQuestionNode( questionSet[ i ], this, keypadLayer ) );
      }

      questionsVBox.children = [
        unitRateQuestionNode,
        ...dynamicQuestionNodes
      ];
    };
    shoppingScene.questionSetProperty.link( questionSetObserver );
  }
}

unitRates.register( 'ShoppingQuestionsAccordionBox', ShoppingQuestionsAccordionBox );