// Copyright 2017-2025, University of Colorado Boulder

/**
 * Accordion box used to modify a rate.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import { optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import Rate from '../model/Rate.js';
import URConstants from '../URConstants.js';

// If the Rate accordion box appears to change size when switching categories, increase this value. Determined empirically.
const MIN_FRACTION_LINE_LENGTH = 115;

type SelfOptions = {
  titleStringProperty?: TReadOnlyProperty<string>;
  unitsFont?: PhetFont;
  unitsMaxWidth?: number;
  numeratorRange?: Range;
  denominatorRange?: Range;
  numeratorUnitsStringProperty: TReadOnlyProperty<string>;
  denominatorUnitsStringProperty: TReadOnlyProperty<string>;
  pickerFont?: PhetFont;
  numeratorPickerColor?: Color | string;
  denominatorPickerColor?: Color | string;
  numeratorPickerIncrementFunction?: ( value: number ) => number;
  numeratorPickerDecrementFunction?: ( value: number ) => number;
  denominatorPickerIncrementFunction?: ( value: number ) => number;
  denominatorPickerDecrementFunction?: ( value: number ) => number;
  numeratorDecimals?: number;
  denominatorDecimals?: number;
  xSpacing?: number;
  ySpacing?: number;
};

export type RateAccordionBoxOptions = SelfOptions & NodeTranslationOptions & PickRequired<AccordionBoxOptions, 'expandedProperty'>;

export default class RateAccordionBox extends AccordionBox {

  public constructor( rate: Rate, providedOptions: RateAccordionBoxOptions ) {

    const options = optionize4<RateAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()(
      {}, URConstants.ACCORDION_BOX_OPTIONS, {

        // RateAccordionBox options
        isDisposable: false,
        titleStringProperty: UnitRatesStrings.rateStringProperty,
        unitsFont: new PhetFont( 16 ),
        unitsMaxWidth: 60, // i18n, determined empirically
        numeratorRange: new Range( 0, 10 ),
        denominatorRange: new Range( 0, 10 ),
        pickerFont: new PhetFont( 24 ),
        numeratorPickerColor: 'black',
        denominatorPickerColor: 'black',
        numeratorPickerIncrementFunction: ( value: number ) => value + 1,
        numeratorPickerDecrementFunction: ( value: number ) => value - 1,
        denominatorPickerIncrementFunction: ( value: number ) => value + 1,
        denominatorPickerDecrementFunction: ( value: number ) => value - 1,
        numeratorDecimals: 0,
        denominatorDecimals: 0,
        xSpacing: 10,
        ySpacing: 8,

        // AccordionBoxOptions
        contentXMargin: 20,
        contentYMargin: 24,
        contentYSpacing: 20
      }, providedOptions );

    assert && assert( options.numeratorRange.contains( rate.numeratorProperty.value ),
      `numerator out of range: ${rate.numeratorProperty.value}` );
    assert && assert( options.denominatorRange.contains( rate.denominatorProperty.value ),
      `denominator out of range: ${rate.denominatorProperty.value}` );

    assert && assert( !options.titleNode, 'creates its own title node' );
    options.titleNode = new Text( options.titleStringProperty, {
      font: URConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: 100  // i18n, determined empirically
    } );

    // numerator picker, must be disposed
    const numeratorPicker = new NumberPicker( rate.numeratorProperty, new Property( options.numeratorRange ),
      merge( {}, URConstants.NUMBER_PICKER_OPTIONS, {
        incrementFunction: options.numeratorPickerIncrementFunction,
        decrementFunction: options.numeratorPickerDecrementFunction,
        decimalPlaces: options.numeratorDecimals,
        font: options.pickerFont,
        color: options.numeratorPickerColor
      } ) );

    // numerator units
    const numeratorUnitsNode = new Text( options.numeratorUnitsStringProperty, {
      font: options.unitsFont,
      maxWidth: options.unitsMaxWidth
    } );

    // denominator picker, must be disposed
    const denominatorPicker = new NumberPicker( rate.denominatorProperty, new Property( options.denominatorRange ),
      merge( {}, URConstants.NUMBER_PICKER_OPTIONS, {
        incrementFunction: options.denominatorPickerIncrementFunction,
        decrementFunction: options.denominatorPickerDecrementFunction,
        decimalPlaces: options.denominatorDecimals,
        font: options.pickerFont,
        color: options.denominatorPickerColor
      } ) );

    // denominator units
    const denominatorUnitsNode = new Text( options.denominatorUnitsStringProperty, {
      font: options.unitsFont,
      maxWidth: options.unitsMaxWidth
    } );

    const contentNode = new Node( {
      children: [ numeratorPicker, numeratorUnitsNode, denominatorPicker, denominatorUnitsNode ]
    } );

    // horizontal layout: center justify pickers, left justify labels
    denominatorPicker.centerX = numeratorPicker.centerX;
    numeratorUnitsNode.left = Math.max( numeratorPicker.right, denominatorPicker.right ) + options.xSpacing;
    denominatorUnitsNode.left = numeratorUnitsNode.left;

    // fraction line
    const fractionLineLength = Math.max( MIN_FRACTION_LINE_LENGTH,
      Math.max( numeratorUnitsNode.right - numeratorPicker.left, denominatorUnitsNode.right - denominatorPicker.left ) );
    const fractionLineNode = new Line( 0, 0, fractionLineLength, 0, {
      stroke: 'black',
      lineWidth: 2,
      left: Math.min( numeratorPicker.left, denominatorPicker.left )
    } );
    contentNode.addChild( fractionLineNode );

    // vertical layout
    numeratorUnitsNode.centerY = numeratorPicker.centerY;
    fractionLineNode.top = numeratorPicker.bottom + options.ySpacing;
    denominatorPicker.top = fractionLineNode.bottom + options.ySpacing;
    denominatorUnitsNode.centerY = denominatorPicker.centerY;

    super( contentNode, options );
  }
}

unitRates.register( 'RateAccordionBox', RateAccordionBox );