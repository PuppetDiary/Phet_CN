// Copyright 2016-2025, University of Colorado Boulder

/**
 * Maker editor, used to manually enter markers on the double number line.
 * Values are entered via a keypad.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import editRegularShape from '../../../../sherpa/js/fontawesome-5/editRegularShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import unitRates from '../../unitRates.js';
import MarkerEditor from '../model/MarkerEditor.js';
import URColors from '../URColors.js';
import URConstants from '../URConstants.js';
import URUtils from '../URUtils.js';
import KeypadLayer from './KeypadLayer.js';
import KeypadPanel from './KeypadPanel.js';

type SelfOptions = {
  lineLength?: number; // length of the vertical line between numerator and denominator values
  valueBoxWidth?: number; // width of the value field, height determined by valueFont
  valueFont?: PhetFont; // font for the value
  valueColor?: Color | string; // color of the value
  zeroIsValid?: boolean; // zero is not a valid value for markers
  valueXMargin?: number; //  horizontal margin inside the value box
  valueYMargin?: number; // vertical margin inside the value box
  ySpacing?: number;  // vertical spacing between UI elements
  keypadPanelPosition?: 'above' | 'below'; // 'above' or 'below' doubleNumberLinePanel
};

type MarkerEditorNodeOptions = SelfOptions & NodeTranslationOptions;

export default class MarkerEditorNode extends Node {

  /**
   * @param markerEditor
   * @param computePanelGlobalBounds - computes global bounds of a containing panel, for positioning the keypad
   * @param keypadLayer - layer that manages the keypad
   * @param [providedOptions]
   */
  public constructor( markerEditor: MarkerEditor,
                      computePanelGlobalBounds: () => Bounds2,
                      keypadLayer: KeypadLayer,
                      providedOptions?: MarkerEditorNodeOptions ) {

    const options = optionize<MarkerEditorNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      lineLength: URConstants.MAJOR_MARKER_LENGTH, // {number} length of the vertical line between numerator and denominator values
      valueBoxWidth: 55, // {number} width of the value field, height determined by valueFont
      valueFont: new PhetFont( 12 ), // {Font} font for the value
      valueColor: 'black', // {Color|string} color of the value
      zeroIsValid: false, // {boolean} zero is not a valid value for markers
      valueXMargin: 5, // {number} horizontal margin inside the value box
      valueYMargin: URConstants.MARKER_Y_SPACING, // {number} vertical margin inside the value box
      ySpacing: 3,  // {number} vertical spacing between UI elements
      keypadPanelPosition: 'below', // {string} 'above' or 'below' doubleNumberLinePanel

      // NodeOptions
      isDisposable: false
    }, providedOptions );

    super();

    // vertical line
    const verticalLine = new Line( 0, 0, 0, options.lineLength, {
      stroke: 'black'
    } );
    this.addChild( verticalLine );

    // common to both value boxes
    const valueBoxWidth = options.valueBoxWidth;
    const valueBoxHeight = new Text( '0', { font: options.valueFont } ).height + ( 2 * options.valueYMargin );
    const valueBoxOptions = {
      stroke: 'black',
      fill: 'white',
      cursor: 'pointer'
    };

    // box for the numerator
    const numeratorBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight,
      merge( {}, valueBoxOptions, {
        centerX: verticalLine.centerX,
        bottom: verticalLine.top
      } ) );
    this.addChild( numeratorBox );

    // box for the denominator
    const denominatorBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight,
      merge( {}, valueBoxOptions, {
        centerX: verticalLine.centerX,
        top: verticalLine.bottom
      } ) );
    this.addChild( denominatorBox );

    // numerator value
    const numeratorNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in numeratorBox to open keypad
      font: options.valueFont,
      center: numeratorBox.center
    } );
    this.addChild( numeratorNode );

    // denominator value
    const denominatorNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in denominatorBox to open keypad
      font: options.valueFont,
      center: denominatorBox.center
    } );
    this.addChild( denominatorNode );

    // edit button for the numerator
    const numeratorEditButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButtonColorProperty,
      centerX: verticalLine.centerX,
      bottom: numeratorBox.top - options.ySpacing
    } );
    this.addChild( numeratorEditButton );
    numeratorEditButton.touchArea = numeratorEditButton.localBounds.dilatedXY( 10, 0 );

    // edit button for the denominator
    const denominatorEditButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButtonColorProperty,
      centerX: verticalLine.centerX,
      top: denominatorBox.bottom + options.ySpacing
    } );
    this.addChild( denominatorEditButton );
    denominatorEditButton.touchArea = denominatorEditButton.localBounds.dilatedXY( 10, 0 );

    this.mutate( options );

    // Sets the position of the KeypadPanel
    const setKeypadPanelPosition = ( keypadPanel: KeypadPanel ) => {

      // This algorithm assumes that both buttons have the same centerX,
      // so either button can be used for horizontal positioning.
      assert && assert( numeratorEditButton.centerX === denominatorEditButton.centerX );

      // position the keypad relative to edit button and double number line panel
      const doubleNumberLinePanelBounds =
        keypadPanel.globalToParentBounds( computePanelGlobalBounds() );
      const editButtonBounds =
        keypadPanel.globalToParentBounds( numeratorEditButton.localToGlobalBounds( numeratorEditButton.localBounds ) );

      // Try to horizontally center the keypad on the edit button,
      // but don't let it go past the ends of the double number line panel.
      keypadPanel.centerX = editButtonBounds.centerX;
      if ( keypadPanel.left < doubleNumberLinePanelBounds.left ) {
        keypadPanel.left = doubleNumberLinePanelBounds.left;
      }
      else if ( keypadPanel.right > doubleNumberLinePanelBounds.right ) {
        keypadPanel.right = doubleNumberLinePanelBounds.right;
      }

      // Put the key pad above or below the double number line panel.
      if ( options.keypadPanelPosition === 'above' ) {
        keypadPanel.bottom = doubleNumberLinePanelBounds.top - 10;
      }
      else { // 'below'
        keypadPanel.top = doubleNumberLinePanelBounds.bottom + 10;
      }
    };

    // opens a keypad for editing the numerator
    const editNumerator = () => {
      keypadLayer.beginEdit( markerEditor.numeratorProperty, {
        onBeginEdit: () => { numeratorBox.fill = URColors.edit; },
        onEndEdit: () => { numeratorBox.fill = 'white'; },
        setKeypadPanelPosition: setKeypadPanelPosition,
        maxDigits: markerEditor.numeratorAxis.maxDigits,
        maxDecimals: markerEditor.numeratorAxis.maxDecimals,
        zeroIsValid: options.zeroIsValid
      } );
    };

    // opens a keypad for editing the denominator
    const editDenominator = () => {
      keypadLayer.beginEdit( markerEditor.denominatorProperty, {
        onBeginEdit: () => { denominatorBox.fill = URColors.edit; },
        onEndEdit: () => { denominatorBox.fill = 'white'; },
        setKeypadPanelPosition: setKeypadPanelPosition,
        maxDigits: markerEditor.denominatorAxis.maxDigits,
        maxDecimals: markerEditor.denominatorAxis.maxDecimals,
        zeroIsValid: options.zeroIsValid
      } );
    };

    // Press on an edit button or box to begin editing
    numeratorEditButton.addListener( editNumerator ); // no removeListener required
    numeratorBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editNumerator
    } ) );
    denominatorEditButton.addListener( editDenominator ); // no removeListener required
    denominatorBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editDenominator
    } ) );

    // Observe edits to the numerator
    const numeratorObserver = ( numerator: number | null ) => {

      // update the numerator
      if ( numerator ) {
        numeratorNode.string = URUtils.numberToString( numerator, markerEditor.numeratorAxis.maxDecimals, markerEditor.numeratorAxis.trimZeros );
      }
      else {
        numeratorNode.string = '';
      }
      numeratorNode.fill = options.valueColor;
      numeratorNode.center = numeratorBox.center;

      // show the corresponding denominator
      if ( phet.chipper.queryParameters.showAnswers && !markerEditor.denominatorProperty.value ) {
        if ( numerator ) {
          const denominator = numerator / markerEditor.unitRateProperty.value;
          denominatorNode.string = URUtils.numberToString( denominator, markerEditor.denominatorAxis.maxDecimals, markerEditor.denominatorAxis.trimZeros );
        }
        else {
          denominatorNode.string = '';
        }
        denominatorNode.fill = URColors.showAnswers;
        denominatorNode.center = denominatorBox.center;
      }
    };
    markerEditor.numeratorProperty.link( numeratorObserver );

    // Observe edits to the denominator
    const denominatorObserver = ( denominator: number | null ) => {

      // update the denominator
      if ( denominator ) {
        denominatorNode.string = URUtils.numberToString( denominator, markerEditor.denominatorAxis.maxDecimals, markerEditor.denominatorAxis.trimZeros );
      }
      else {
        denominatorNode.string = '';
      }
      denominatorNode.fill = options.valueColor;
      denominatorNode.center = denominatorBox.center;

      // show the corresponding numerator
      if ( phet.chipper.queryParameters.showAnswers && !markerEditor.numeratorProperty.value ) {
        if ( denominator ) {
          const numerator = denominator * markerEditor.unitRateProperty.value;
          numeratorNode.string = URUtils.numberToString( numerator, markerEditor.numeratorAxis.maxDecimals, markerEditor.numeratorAxis.trimZeros );
        }
        else {
          numeratorNode.string = '';
        }
        numeratorNode.fill = URColors.showAnswers;
        numeratorNode.center = numeratorBox.center;
      }
    };
    markerEditor.denominatorProperty.link( denominatorObserver );
  }
}

unitRates.register( 'MarkerEditorNode', MarkerEditorNode );