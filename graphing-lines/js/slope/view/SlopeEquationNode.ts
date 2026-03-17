// Copyright 2013-2025, University of Colorado Boulder

/**
 * SlopeEquationNode is the renderer for slope equations.
 * The general form is m = (y2 - y1) / (x2 - x1) = rise/run
 *
 * x1, y1, x2, and y2 are all interactive.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode, { MinusNodeOptions } from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StringDisplay, { StringDisplayOptions } from '../../../../scenery-phet/js/StringDisplay.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import SceneryLine from '../../../../scenery/js/nodes/Line.js'; // eslint-disable-line phet/default-import-match-filename
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText, { RichTextOptions } from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import TColor from '../../../../scenery/js/util/TColor.js';
import GLColors from '../../common/GLColors.js';
import GLConstants from '../../common/GLConstants.js';
import GLSymbols from '../../common/GLSymbols.js';
import Line from '../../common/model/Line.js';
import EquationNode, { EquationNodeOptions } from '../../common/view/EquationNode.js';
import { CreateDynamicLabelOptions } from '../../common/view/LineNode.js';
import CoordinatePicker from '../../common/view/picker/CoordinatePicker.js';
import UndefinedSlopeIndicator from '../../common/view/UndefinedSlopeIndicator.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import NotALine from '../../linegame/model/NotALine.js';

type SelfOptions = {

  // Ranges for the NumberPickers
  x1RangeProperty?: Property<Range>;
  x2RangeProperty?: Property<Range>;
  y1RangeProperty?: Property<Range>;
  y2RangeProperty?: Property<Range>;

  // font size for all elements
  fontSize?: number;

  // Color of static elements
  staticColor?: TColor;
};

type SlopeEquationNodeOptions = SelfOptions & EquationNodeOptions;

export default class SlopeEquationNode extends EquationNode {

  private readonly disposeSlopeEquationNode: () => void;

  /**
   * Creates an interactive equation. x1, y1, x2 and y2 are interactive.
   */
  public constructor( lineProperty: Property<Line>, providedOptions?: SlopeEquationNodeOptions ) {

    const options = optionize<SlopeEquationNodeOptions, SelfOptions, EquationNodeOptions>()( {

      // SelfOptions
      x1RangeProperty: new Property( GLConstants.X_AXIS_RANGE ),
      x2RangeProperty: new Property( GLConstants.X_AXIS_RANGE ),
      y1RangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      y2RangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'
    }, providedOptions );

    super( options ); // call first, because supertype constructor computes various layout metrics

    const interactiveFont = new PhetFont( {
      size: options.fontSize,
      weight: GLConstants.EQUATION_FONT_WEIGHT
    } );
    const staticFont = new PhetFont( {
      size: options.fontSize,
      weight: GLConstants.EQUATION_FONT_WEIGHT
    } );

    const staticOptions = {
      font: staticFont,
      fill: options.staticColor
    };
    const fractionLineOptions = {
      stroke: options.staticColor,
      lineWidth: this.fractionLineThickness
    };

    const numberPropertyOptions: NumberPropertyOptions = {
      numberType: 'Integer'
    };

    // internal Properties that are connected to pickers
    const x1Property = new NumberProperty( lineProperty.value.x1, numberPropertyOptions );
    const y1Property = new NumberProperty( lineProperty.value.y1, numberPropertyOptions );
    const x2Property = new NumberProperty( lineProperty.value.x2, numberPropertyOptions );
    const y2Property = new NumberProperty( lineProperty.value.y2, numberPropertyOptions );

    // internal Properties that are connected to number displays
    const riseProperty = new NumberProperty( lineProperty.value.rise, numberPropertyOptions );
    const runProperty = new NumberProperty( lineProperty.value.run, numberPropertyOptions );

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Nodes that could appear is all possible ways to write the equation
    // m =
    const mText = new RichText( GLSymbols.mStringProperty, combineOptions<RichTextOptions>( {
      maxWidth: 60
    }, staticOptions ) );
    const interactiveEqualsText = new Text( MathSymbols.EQUAL_TO, staticOptions );
    // y2 - y1
    const y2Picker = new CoordinatePicker( y2Property, x2Property, y1Property, x1Property, options.y2RangeProperty, {
      font: interactiveFont,
      color: GLColors.pointX2Y2ColorProperty
    } );
    const numeratorOperatorNode = new MinusNode( combineOptions<MinusNodeOptions>( {
      size: this.operatorLineSize
    }, staticOptions ) );
    const y1Picker = new CoordinatePicker( y1Property, x1Property, y2Property, x2Property, options.y1RangeProperty, {
      font: interactiveFont,
      color: GLColors.pointX1Y1ColorProperty
    } );
    // fraction line, correct length will be set later
    const interactiveFractionLineNode = new SceneryLine( 0, 0, 1, 0, fractionLineOptions );
    // x2 - x1
    const x2Picker = new CoordinatePicker( x2Property, y2Property, x1Property, y1Property, options.x2RangeProperty, {
      font: interactiveFont,
      color: GLColors.pointX2Y2ColorProperty
    } );
    const denominatorOperatorNode = new MinusNode( combineOptions<MinusNodeOptions>( {
      size: this.operatorLineSize
    }, staticOptions ) );
    const x1Picker = new CoordinatePicker( x1Property, y1Property, x2Property, y2Property, options.x1RangeProperty, {
      font: interactiveFont,
      color: GLColors.pointX1Y1ColorProperty
    } );
    // = unsimplified value
    const unsimplifiedEqualsNode = new RichText( MathSymbols.EQUAL_TO, staticOptions );

    const stringDisplayOptions: StringDisplayOptions = {
      size: new Dimension2( 55, 46 ),
      xMargin: 5,
      yMargin: 5,
      alignX: 'center',
      rectangleOptions: {
        fill: GLColors.slopeColorProperty,
        stroke: null
      },
      textOptions: {
        font: staticFont
      }
    };
    const unsimplifiedRiseNode = new StringDisplay( new DerivedStringProperty( [ riseProperty ], rise => toFixed( rise, 0 ) ), stringDisplayOptions );
    const unsimplifiedRunNode = new StringDisplay( new DerivedStringProperty( [ runProperty ], run => toFixed( run, 0 ) ), stringDisplayOptions );
    const unsimplifiedFractionLineNode = new SceneryLine( 0, 0, 1, 0, fractionLineOptions ); // correct length will be set later
    const undefinedSlopeIndicator = new UndefinedSlopeIndicator( 1, 1 );

    // rendering order
    const parentNode = new Node();
    this.addChild( parentNode );
    this.addChild( undefinedSlopeIndicator );

    // m =
    parentNode.addChild( mText );
    parentNode.addChild( interactiveEqualsText );
    // y2 - y1
    parentNode.addChild( y2Picker );
    parentNode.addChild( numeratorOperatorNode );
    parentNode.addChild( y1Picker );
    // fraction line
    parentNode.addChild( interactiveFractionLineNode );
    // x2 - x1
    parentNode.addChild( x2Picker );
    parentNode.addChild( denominatorOperatorNode );
    parentNode.addChild( x1Picker );
    // = rise/run
    parentNode.addChild( unsimplifiedEqualsNode );
    parentNode.addChild( unsimplifiedRiseNode );
    parentNode.addChild( unsimplifiedFractionLineNode );
    parentNode.addChild( unsimplifiedRunNode );

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink(
      [ x1Property, y1Property, x2Property, y2Property ],
      ( x1, y1, x2, y2 ) => {
        if ( !updatingControls ) {
          lineProperty.value = new Line( x1, y1, x2, y2, lineProperty.value.color );
        }
      }
    );

    // sync the controls and layout with the model
    const lineObserver = ( line: Line ) => {

      // Synchronize the controls atomically.
      updatingControls = true;
      {
        x1Property.value = line.x1;
        y1Property.value = line.y1;
        x2Property.value = line.x2;
        y2Property.value = line.y2;
      }
      updatingControls = false;

      // Update the unsimplified slope
      riseProperty.value = line.rise;
      runProperty.value = line.run;

      // fraction line length
      const unsimplifiedFractionLineLength = Math.max( unsimplifiedRiseNode.width, unsimplifiedRunNode.width );
      unsimplifiedFractionLineNode.setLine( 0, 0, unsimplifiedFractionLineLength, 0 );

      // undefined-slope indicator
      undefinedSlopeIndicator.visible = line.undefinedSlope();
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    // Dynamic layout, after registering observers
    Multilink.multilink( [
        // 'm =' is the only part of the interactive equation that involves a StringProperty.
        mText.boundsProperty
      ],
      () => {
        // m =
        mText.x = 0;
        mText.y = 0;
        interactiveEqualsText.left = mText.right + this.relationalOperatorXSpacing;
        interactiveEqualsText.y = mText.y;
        // fraction line
        interactiveFractionLineNode.left = interactiveEqualsText.right + this.relationalOperatorXSpacing;
        interactiveFractionLineNode.centerY = interactiveEqualsText.centerY + this.fractionLineYFudgeFactor;
        // y2 - y1
        y2Picker.left = interactiveFractionLineNode.left;
        y2Picker.bottom = interactiveFractionLineNode.top - this.pickersYSpacing;
        numeratorOperatorNode.left = y2Picker.right + this.operatorXSpacing;
        numeratorOperatorNode.centerY = y2Picker.centerY;
        y1Picker.left = numeratorOperatorNode.right + this.operatorXSpacing;
        y1Picker.y = y2Picker.y;
        // fix fraction line length
        const fractionLineLength = y1Picker.right - y2Picker.left;
        interactiveFractionLineNode.setLine( 0, 0, fractionLineLength, 0 );
        // x2 - x1
        x2Picker.left = y2Picker.left;
        x2Picker.top = interactiveFractionLineNode.bottom + this.pickersYSpacing;
        denominatorOperatorNode.left = x2Picker.right + this.operatorXSpacing;
        denominatorOperatorNode.centerY = x2Picker.centerY;
        x1Picker.left = denominatorOperatorNode.right + this.operatorXSpacing;
        x1Picker.y = x2Picker.y;
        // = rise/run
        unsimplifiedEqualsNode.left = interactiveFractionLineNode.right + this.relationalOperatorXSpacing;
        unsimplifiedEqualsNode.y = interactiveEqualsText.y;
        unsimplifiedFractionLineNode.left = unsimplifiedEqualsNode.right + this.relationalOperatorXSpacing;
        unsimplifiedFractionLineNode.y = interactiveFractionLineNode.y;
        // horizontally center rise and run above fraction line
        unsimplifiedRiseNode.centerX = unsimplifiedFractionLineNode.centerX;
        unsimplifiedRiseNode.bottom = unsimplifiedFractionLineNode.top - this.slopeYSpacing;
        unsimplifiedRunNode.centerX = unsimplifiedFractionLineNode.centerX;
        unsimplifiedRunNode.top = unsimplifiedFractionLineNode.bottom + this.slopeYSpacing;

        // set up undefined-slope indicator last
        undefinedSlopeIndicator.setSize( parentNode.getWidth(), parentNode.getHeight() );
        undefinedSlopeIndicator.centerX = parentNode.centerX;
        undefinedSlopeIndicator.centerY = parentNode.centerY + this.undefinedSlopeYFudgeFactor;
      } );

    this.mutate( options );

    this.disposeSlopeEquationNode = () => {
      mText.dispose();
      x1Picker.dispose();
      x2Picker.dispose();
      y1Picker.dispose();
      y2Picker.dispose();
      unsimplifiedRiseNode.dispose();
      unsimplifiedRunNode.dispose();
      lineProperty.unlink( lineObserver );
      controlsMultilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSlopeEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of the slope equation: m = (y2-y1)/(x2-x1)
   */
  public static createGeneralFormNode(): Node {

    const options = {
      pickable: false,
      fontSize: 20,
      fontWeight: GLConstants.EQUATION_FONT_WEIGHT,
      fill: 'black',
      maxWidth: 300
    };

    const richTextOptions = {
      font: new PhetFont( { size: options.fontSize, weight: options.fontWeight } ),
      fill: options.fill
    };

    // Slope   m =
    const slopeText = new RichText( GraphingLinesStrings.slopeStringProperty, richTextOptions );
    const mEqualsStringProperty = new DerivedStringProperty( [ GLSymbols.mStringProperty ],
      m => `${m} ${MathSymbols.EQUAL_TO}` );
    const mEqualsText = new RichText( mEqualsStringProperty, richTextOptions );
    const leftSideNode = new HBox( {
      spacing: 0,
      children: [ slopeText, new HStrut( 22 ), mEqualsText ]
    } );

    // pattern for numerator and denominator
    const pattern = `{{symbol}}<sub>2</sub> ${MathSymbols.MINUS} {{symbol}}<sub>1</sub>`;

    // y2 - y1
    const numeratorStringProperty = new DerivedStringProperty( [ GLSymbols.yStringProperty ],
      y => StringUtils.fillIn( pattern, { symbol: y } ) );
    const numeratorText = new RichText( numeratorStringProperty, richTextOptions );

    // x2 - x1
    const denominatorStringProperty = new DerivedStringProperty( [ GLSymbols.xStringProperty ],
      x => StringUtils.fillIn( pattern, { symbol: x } ) );
    const denominatorText = new RichText( denominatorStringProperty, richTextOptions );

    // fraction line, with dynamic length
    const fractionLineNode = new SceneryLine( 0, 0, 1, 0, {
      stroke: options.fill,
      lineWidth: 0.06 * options.fontSize
    } );
    Multilink.multilink( [ numeratorText.boundsProperty, denominatorText.boundsProperty ],
      ( numeratorBounds, denominatorBounds ) => {
        const length = 1.1 * Math.max( numeratorBounds.width, denominatorBounds.width );
        fractionLineNode.setLine( 0, 0, length, 0 );
        numeratorText.centerX = fractionLineNode.centerX;
        numeratorText.bottom = fractionLineNode.top - 5;
        denominatorText.centerX = fractionLineNode.centerX;
        denominatorText.top = fractionLineNode.top + 3;
      } );

    // Tried to use VBox here, but the spacing was a little off.
    const fractionNode = new Node( {
      children: [ numeratorText, fractionLineNode, denominatorText ]
    } );

    const hBox = new HBox( {
      align: 'center',
      spacing: 5,
      children: [ leftSideNode, fractionNode ]
    } );

    return new Node( {
      isDisposable: false,
      children: [ hBox ], // Wrap with Node to prevent the equation from stretching inside of other layout Nodes.
      maxWidth: 200 // Apply maxWidth to the entire equation, so that all parts of the equation scale uniformly.
    } );
  }

  /**
   * Creates a non-interactive equation, used to label a dynamic line.
   */
  public static createDynamicLabel( lineProperty: Property<Line | NotALine>, providedOptions?: CreateDynamicLabelOptions ): Node {

    const options = combineOptions<CreateDynamicLabelOptions>( {
      pickable: false,
      maxWidth: 200
    }, providedOptions );

    // @ts-expect-error lineProperty Property<Line | NotALine>
    return new DynamicLabelNode( lineProperty, options );
  }
}

/**
 * A non-interactive equation, used to label a dynamic line.
 * This takes the form 'Slope is rise/run', which is different than the interactive equation form.
 * Note that while this is a sentence, it's order is not localized, due to the fact that it is
 * composed of multiple phet.scenery.Text nodes.
 */
class DynamicLabelNode extends EquationNode {

  private readonly disposeDynamicLabelNode: () => void;

  public constructor( lineProperty: Property<Line>, providedOptions?: CreateDynamicLabelOptions ) {

    const options = combineOptions<CreateDynamicLabelOptions>( {
      fontSize: 18
    }, providedOptions );

    super( options );

    const textOptions = {
      font: new PhetFont( { size: options.fontSize, weight: GLConstants.EQUATION_FONT_WEIGHT } )
    };

    // Allocate nodes needed to represent all simplified forms.
    const slopeIsText = new Text( GraphingLinesStrings.slopeIsStringProperty, textOptions );
    const minusSignNode = new MinusNode( { size: this.signLineSize } );
    const riseText = new Text( '?', textOptions );
    const runText = new Text( '?', textOptions );
    const fractionLineNode = new SceneryLine( 0, 0, 1, 0, { lineWidth: this.fractionLineThickness } );

    // Add all nodes. We'll set which ones are visible based on desired simplification.
    assert && assert( this.getChildrenCount() === 0, 'supertype has unexpected children' );
    this.children = [ slopeIsText, minusSignNode, riseText, runText, fractionLineNode ];

    // Update visibility, layout and properties of nodes to match the current line.
    const update = ( line: Line ) => {

      const lineColor = line.color;

      // Start with all elements invisible and at (0,0).
      this.children.forEach( child => {
        child.visible = false;
        child.x = 0;
        child.y = 0;
      } );

      // 'Slope is'
      slopeIsText.visible = true;
      slopeIsText.fill = lineColor;

      if ( line.undefinedSlope() ) {
        // 'undefined'
        riseText.visible = true;
        riseText.string = GraphingLinesStrings.undefinedStringProperty.value;
        riseText.fill = lineColor;
        riseText.left = slopeIsText.right + this.relationalOperatorXSpacing;
        riseText.y = slopeIsText.y;
      }
      else if ( line.getSlope() === 0 ) {
        // 0
        riseText.visible = true;
        riseText.string = '0';
        riseText.fill = lineColor;
        riseText.left = slopeIsText.right + this.relationalOperatorXSpacing;
        riseText.y = slopeIsText.y;
      }
      else {
        let nextXOffset;
        if ( line.getSlope() < 0 ) {
          // minus sign
          minusSignNode.visible = true;
          minusSignNode.fill = lineColor;
          minusSignNode.left = slopeIsText.right + this.relationalOperatorXSpacing;
          minusSignNode.centerY = slopeIsText.centerY + this.slopeSignYFudgeFactor + this.slopeSignYOffset;
          nextXOffset = minusSignNode.right + this.fractionalSlopeXSpacing;
        }
        else {
          // no sign
          nextXOffset = slopeIsText.right + this.relationalOperatorXSpacing;
        }

        if ( Number.isInteger( line.getSlope() ) ) {
          // integer slope (rise/1)
          riseText.visible = true;
          riseText.string = toFixed( Math.abs( line.getSlope() ), 0 );
          riseText.fill = lineColor;
          riseText.left = nextXOffset;
          riseText.y = slopeIsText.y;
        }
        else {
          // fractional slope
          riseText.visible = runText.visible = fractionLineNode.visible = true;

          riseText.string = toFixed( Math.abs( line.getSimplifiedRise() ), 0 );
          runText.string = toFixed( Math.abs( line.getSimplifiedRun() ), 0 );
          fractionLineNode.setLine( 0, 0, Math.max( riseText.width, runText.width ), 0 );
          riseText.fill = runText.fill = fractionLineNode.stroke = lineColor;

          // layout, values horizontally centered
          fractionLineNode.left = nextXOffset;
          fractionLineNode.centerY = slopeIsText.centerY + this.fractionLineYFudgeFactor;
          riseText.centerX = fractionLineNode.centerX;
          riseText.bottom = fractionLineNode.top - this.ySpacing;
          runText.centerX = fractionLineNode.centerX;
          runText.top = fractionLineNode.bottom + this.ySpacing;
        }
      }
    };

    // If the line changes, or any element that is listening to a LocalizedStringProperty changes, then update.
    const multilink = new Multilink( [ lineProperty, slopeIsText.localBoundsProperty, riseText.localBoundsProperty ],
      line => update( line )
    );

    this.disposeDynamicLabelNode = () => {
      this.children.forEach( child => child.dispose() );
      multilink.dispose();
    };

    this.mutate( options );
  }

  public override dispose(): void {
    this.disposeDynamicLabelNode();
    super.dispose();
  }
}

graphingLines.register( 'SlopeEquationNode', SlopeEquationNode );