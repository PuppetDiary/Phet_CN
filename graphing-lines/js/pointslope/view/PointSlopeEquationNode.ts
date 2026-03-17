// Copyright 2013-2025, University of Colorado Boulder

/**
 * Renderer for point-slope equations, with optional interactivity of point and slope.
 * General point-slope form is: (y - y1) = m(x - x1)
 *
 * Point and/or slope may be interactive.
 * Pickers are used to increment/decrement parts of the equation that are specified as being interactive.
 * Non-interactive parts of the equation are expressed in a form that is typical of how the equation
 * would normally be written. For example, if the slope is -1, then only the sign is written, not '-1'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode, { MinusNodeOptions } from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode, { PlusNodeOptions } from '../../../../scenery-phet/js/PlusNode.js';
import SceneryLine from '../../../../scenery/js/nodes/Line.js'; // eslint-disable-line phet/default-import-match-filename
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText, { RichTextOptions } from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import TColor from '../../../../scenery/js/util/TColor.js';
import NumberPicker, { NumberPickerOptions } from '../../../../sun/js/NumberPicker.js';
import GLColors from '../../common/GLColors.js';
import GLConstants from '../../common/GLConstants.js';
import GLSymbols from '../../common/GLSymbols.js';
import Line from '../../common/model/Line.js';
import DynamicValueNode, { DynamicValueNodeOptions } from '../../common/view/DynamicValueNode.js';
import EquationNode, { EquationNodeOptions } from '../../common/view/EquationNode.js';
import { CreateDynamicLabelOptions } from '../../common/view/LineNode.js';
import SlopePicker from '../../common/view/picker/SlopePicker.js';
import UndefinedSlopeIndicator from '../../common/view/UndefinedSlopeIndicator.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import NotALine from '../../linegame/model/NotALine.js';

type SelfOptions = {

  // Whether to show 'slope undefined' after non-interactive equations with undefined slope, for example
  // 'x = 3' versus 'x = 3 (slope undefined)'.
  // See https://github.com/phetsims/graphing-slope-intercept/issues/7
  slopeUndefinedVisible?: boolean;

  // components that can be interactive
  interactivePoint?: boolean;
  interactiveSlope?: boolean;

  // dynamic range of components
  x1RangeProperty?: Property<Range>;
  y1RangeProperty?: Property<Range>;
  riseRangeProperty?: Property<Range>;
  runRangeProperty?: Property<Range>;

  staticColor?: TColor;
};

type PointSlopeEquationNodeOptions = SelfOptions & EquationNodeOptions;

export default class PointSlopeEquationNode extends EquationNode {

  private readonly disposePointSlopeEquationNode: () => void;

  public constructor( lineProperty: Property<Line>, providedOptions?: PointSlopeEquationNodeOptions ) {

    const options = optionize<PointSlopeEquationNodeOptions, SelfOptions, EquationNodeOptions>()( {

      // Whether to show 'slope undefined' after non-interactive equations with undefined slope, for example
      // 'x = 3' versus 'x = 3 (slope undefined)'.
      // See https://github.com/phetsims/graphing-slope-intercept/issues/7
      slopeUndefinedVisible: true,

      // components that can be interactive
      interactivePoint: true,
      interactiveSlope: true,

      // dynamic range of components
      x1RangeProperty: new Property( GLConstants.X_AXIS_RANGE ),
      y1RangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      riseRangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      runRangeProperty: new Property( GLConstants.X_AXIS_RANGE ),

      // style
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'

    }, providedOptions );

    super( options ); // call first, because super computes various layout metrics

    const fullyInteractive = ( options.interactivePoint && options.interactiveSlope );
    const interactiveFont = new PhetFont( { size: options.fontSize, weight: GLConstants.EQUATION_FONT_WEIGHT } );
    const staticFont = new PhetFont( { size: options.fontSize, weight: GLConstants.EQUATION_FONT_WEIGHT } );
    const staticOptions = { font: staticFont, fill: options.staticColor };
    const fractionLineOptions = { stroke: options.staticColor, lineWidth: this.fractionLineThickness };

    const numberPropertyOptions: NumberPropertyOptions = {
      numberType: 'Integer'
    };

    // internal properties that are connected to pickers
    const x1Property = new NumberProperty( lineProperty.value.x1, numberPropertyOptions );
    const y1Property = new NumberProperty( lineProperty.value.y1, numberPropertyOptions );
    const riseProperty = new NumberProperty( lineProperty.value.rise, numberPropertyOptions );
    const runProperty = new NumberProperty( lineProperty.value.run, numberPropertyOptions );

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Determine the max width of the rise and run pickers.
    const maxSlopePickerWidth = EquationNode.computeMaxSlopePickerWidth( options.riseRangeProperty,
      options.runRangeProperty, interactiveFont, this.decimalPlaces );

    // Nodes that appear in all possible forms of the equation: (y-y1) = rise/run (x-x1)
    const yLeftParenText = new Text( '(', staticOptions );
    const yText = new RichText( GLSymbols.yStringProperty, combineOptions<RichTextOptions>( {
      maxWidth: 60
    }, staticOptions ) );
    const yPlusNode = new PlusNode( combineOptions<PlusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    const yMinusNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    let y1Node: NumberPicker | DynamicValueNode;
    if ( options.interactivePoint ) {
      y1Node = new NumberPicker( y1Property, options.y1RangeProperty,
        combineOptions<NumberPickerOptions>( {}, GLConstants.NUMBER_PICKER_OPTIONS, {
          color: GLColors.pointX1Y1ColorProperty,
          font: interactiveFont
        } ) );
    }
    else {
      y1Node = new DynamicValueNode( y1Property, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const yRightParenText = new Text( ')', staticOptions );
    const y1MinusSignNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.signLineSize }, staticOptions ) ); // for y=-y1 case
    const equalsText = new Text( '=', staticOptions );
    const slopeMinusSignNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.signLineSize }, staticOptions ) );
    let riseNode: SlopePicker | DynamicValueNode;
    let runNode: SlopePicker | DynamicValueNode;
    if ( options.interactiveSlope ) {
      riseNode = new SlopePicker( riseProperty, runProperty, options.riseRangeProperty, { font: interactiveFont } );
      runNode = new SlopePicker( runProperty, riseProperty, options.runRangeProperty, { font: interactiveFont } );
    }
    else {
      riseNode = new DynamicValueNode( riseProperty, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
      runNode = new DynamicValueNode( runProperty, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const fractionLineNode = new SceneryLine( 0, 0, maxSlopePickerWidth, 0, fractionLineOptions );
    const xLeftParentText = new Text( '(', staticOptions );
    const xText = new RichText( GLSymbols.xStringProperty, combineOptions<RichTextOptions>( {
      maxWidth: 60
    }, staticOptions ) );
    const xPlusNode = new PlusNode( combineOptions<PlusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    const xMinusNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    let x1Node: NumberPicker | DynamicValueNode;
    if ( options.interactivePoint ) {
      x1Node = new NumberPicker( x1Property, options.x1RangeProperty,
        combineOptions<NumberPickerOptions>( {}, GLConstants.NUMBER_PICKER_OPTIONS, {
          color: GLColors.pointX1Y1ColorProperty,
          font: interactiveFont
        } ) );
    }
    else {
      x1Node = new DynamicValueNode( x1Property, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const xRightParenText = new Text( ')', staticOptions );
    const slopeUndefinedText = new RichText( '?', staticOptions );

    // Add all nodes. We'll set which ones are visible based on desired simplification
    const parentNode = new Node( {
      children: [
        yLeftParenText, yText, yPlusNode, yMinusNode, y1Node, yRightParenText, y1MinusSignNode, equalsText,
        slopeMinusSignNode, riseNode, runNode, fractionLineNode, xLeftParentText, xText, xPlusNode, xMinusNode, x1Node, xRightParenText,
        slopeUndefinedText
      ]
    } );
    this.addChild( parentNode );

    /*
     * Updates the layout to match the desired form of the equation.
     * This is based on which parts of the equation are interactive, and what the
     * non-interactive parts of the equation should look like when written in simplified form.
     */
    const updateLayout = ( line: Line ) => {

      const interactive = options.interactivePoint || options.interactiveSlope;
      const lineColor = line.color;

      // Start with all elements invisible and at (0,0).
      parentNode.children.forEach( child => {
        child.visible = false;
        child.x = 0;
        child.y = 0;
      } );

      // Workaround for https://github.com/phetsims/graphing-lines/issues/#114 and https://github.com/phetsims/graphing-lines/issues/#117
      slopeUndefinedText.string = '';

      if ( line.undefinedSlope() && !interactive ) {
        // slope is undefined and nothing is interactive
        slopeUndefinedText.visible = true;
        slopeUndefinedText.fill = lineColor;
        slopeUndefinedText.string = ( options.slopeUndefinedVisible ) ?
                                    StringUtils.format( GraphingLinesStrings.slopeUndefinedStringProperty.value, GLSymbols.xStringProperty.value, line.x1 ) :
                                    StringUtils.fillIn( `{{x}} ${MathSymbols.EQUAL_TO} {{value}}`, {
                                      x: GLSymbols.xStringProperty.value,
                                      value: line.x1
                                    } );
        return;
      }
      else if ( !interactive && line.same( Line.Y_EQUALS_X_LINE ) ) {
        // use slope-intercept form for y=x
        yText.visible = equalsText.visible = xText.visible = true;
        yText.fill = equalsText.fill = xText.fill = lineColor;
        equalsText.left = yText.right + this.relationalOperatorXSpacing;
        xText.left = equalsText.right + this.relationalOperatorXSpacing;
        return;
      }
      else if ( !interactive && line.same( Line.Y_EQUALS_NEGATIVE_X_LINE ) ) {
        // use slope-intercept form for y=-x
        yText.visible = equalsText.visible = slopeMinusSignNode.visible = xText.visible = true;
        yText.fill = equalsText.fill = slopeMinusSignNode.fill = xText.fill = lineColor;
        equalsText.left = yText.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.left = equalsText.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.centerY = equalsText.centerY + this.operatorYFudgeFactor;
        xText.left = slopeMinusSignNode.right + this.integerSignXSpacing;
        return;
      }

      // Select the operators based on the signs of x1 and y1.
      const xOperatorNode = ( options.interactivePoint || line.x1 >= 0 ) ? xMinusNode : xPlusNode;
      const yOperatorNode = ( options.interactivePoint || line.y1 >= 0 ) ? yMinusNode : yPlusNode;

      if ( line.rise === 0 && !options.interactiveSlope && !options.interactivePoint ) {
        // y1 is on the right side of the equation
        yText.visible = equalsText.visible = y1Node.visible = true;
        yText.fill = equalsText.fill = lineColor;
        if ( y1Node instanceof DynamicValueNode ) {
          y1Node.fill = lineColor;
        }
        equalsText.left = yText.right + this.relationalOperatorXSpacing;
        if ( options.interactivePoint || line.y1 >= 0 ) {
          // y = y1
          y1Node.left = equalsText.right + this.relationalOperatorXSpacing;
          y1Node.y = yText.y;
        }
        else {
          // y = -y1
          y1MinusSignNode.visible = true;
          y1MinusSignNode.fill = lineColor;
          y1MinusSignNode.left = equalsText.right + this.relationalOperatorXSpacing;
          y1MinusSignNode.centerY = equalsText.centerY + this.operatorYFudgeFactor;
          y1Node.left = y1MinusSignNode.right + this.integerSignXSpacing;
          y1Node.y = yText.y;
        }
      }
      else {  // y1 is on the left side of the equation

        let previousNode;

        if ( !options.interactivePoint && line.y1 === 0 ) {
          // y
          yText.x = 0;
          yText.y = 0;
          yText.fill = lineColor;
          yText.visible = true;
          previousNode = yText;
        }
        else if ( !interactive ) {
          // y - y1
          yText.visible = yOperatorNode.visible = y1Node.visible = true;
          yText.fill = yOperatorNode.fill = lineColor;
          if ( y1Node instanceof DynamicValueNode ) {
            y1Node.fill = lineColor;
          }
          yText.x = 0;
          yText.y = 0;
          yOperatorNode.left = yText.right + this.operatorXSpacing;
          yOperatorNode.centerY = yText.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yText.centerY;
          previousNode = y1Node;
        }
        else {
          // (y - y1)
          yLeftParenText.visible = yText.visible = yOperatorNode.visible = y1Node.visible = yRightParenText.visible = true;
          yLeftParenText.fill = yText.fill = yOperatorNode.fill = yRightParenText.fill = lineColor;
          if ( y1Node instanceof DynamicValueNode ) {
            y1Node.fill = lineColor;
          }
          yLeftParenText.x = 0;
          yLeftParenText.y = 0;
          yText.left = yLeftParenText.right + this.parenXSpacing;
          yText.y = yLeftParenText.y;
          yOperatorNode.left = yText.right + this.operatorXSpacing;
          yOperatorNode.centerY = yText.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yText.centerY;
          yRightParenText.left = y1Node.right + this.parenXSpacing;
          yRightParenText.y = yText.y;
          previousNode = yRightParenText;
        }

        // =
        equalsText.visible = true;
        equalsText.fill = lineColor;
        equalsText.left = previousNode.right + this.relationalOperatorXSpacing;
        equalsText.y = yText.y + this.equalsSignFudgeFactor;

        // slope
        let previousXOffset;
        if ( options.interactiveSlope ) {
          // (rise/run), where rise and run are pickers, and the sign is integrated into the pickers
          riseNode.visible = runNode.visible = fractionLineNode.visible = true;
          if ( riseNode instanceof DynamicValueNode ) {
            riseNode.fill = lineColor;
          }
          if ( runNode instanceof DynamicValueNode ) {
            runNode.fill = lineColor;
          }
          fractionLineNode.fill = lineColor;
          fractionLineNode.left = equalsText.right + this.relationalOperatorXSpacing;
          fractionLineNode.centerY = equalsText.centerY;
          riseNode.centerX = fractionLineNode.centerX;
          riseNode.bottom = fractionLineNode.top - this.pickersYSpacing;
          runNode.centerX = fractionLineNode.centerX;
          runNode.top = fractionLineNode.bottom + this.pickersYSpacing;
          previousNode = fractionLineNode;
          previousXOffset = this.fractionalSlopeXSpacing;
        }
        else {
          // slope is not interactive, so here we put it in the desired form

          // slope properties, used to determine correct form
          const slope = line.getSlope();
          const zeroSlope = ( slope === 0 );
          const unitySlope = ( Math.abs( slope ) === 1 );
          const integerSlope = Number.isInteger( slope );
          const positiveSlope = ( slope > 0 );
          const fractionalSlope = ( !zeroSlope && !unitySlope && !integerSlope );

          // adjust fraction line width, use max width of rise or run
          const lineWidth = Math.max( riseNode.width, runNode.width );
          fractionLineNode.setLine( 0, 0, lineWidth, 0 );

          // decide whether to include the slope minus sign
          if ( positiveSlope || zeroSlope ) {
            // no sign
            previousNode = equalsText;
            previousXOffset = this.relationalOperatorXSpacing;
          }
          else {
            // -
            slopeMinusSignNode.visible = true;
            slopeMinusSignNode.fill = lineColor;
            slopeMinusSignNode.left = equalsText.right + this.relationalOperatorXSpacing;
            slopeMinusSignNode.centerY = equalsText.centerY + this.slopeSignYFudgeFactor + this.slopeSignYOffset;
            previousNode = slopeMinusSignNode;
            previousXOffset = ( fractionalSlope ? this.fractionSignXSpacing : this.integerSignXSpacing );
          }

          if ( line.undefinedSlope() || fractionalSlope ) {
            // rise/run
            riseNode.visible = runNode.visible = fractionLineNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            if ( runNode instanceof DynamicValueNode ) {
              runNode.fill = lineColor;
            }
            fractionLineNode.stroke = lineColor;
            fractionLineNode.left = previousNode.right + previousXOffset;
            fractionLineNode.centerY = equalsText.centerY;
            riseNode.centerX = fractionLineNode.centerX;
            riseNode.bottom = fractionLineNode.top - this.ySpacing;
            runNode.centerX = fractionLineNode.centerX;
            runNode.top = fractionLineNode.bottom + this.ySpacing;
            previousNode = fractionLineNode;
            previousXOffset = this.fractionalSlopeXSpacing;
          }
          else if ( zeroSlope ) {
            // 0
            riseNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            riseNode.left = equalsText.right + this.relationalOperatorXSpacing;
            riseNode.y = yText.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          }
          else if ( unitySlope ) {
            // no slope term
            previousXOffset = this.relationalOperatorXSpacing;
          }
          else if ( integerSlope ) {
            // N
            riseNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            riseNode.left = previousNode.right + previousXOffset;
            riseNode.y = yText.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          }
          else {
            throw new Error( 'programming error, forgot to handle some slope case' );
          }
        }

        // x term
        if ( interactive || ( line.x1 !== 0 && line.getSlope() !== 0 && line.getSlope() !== 1 ) ) {
          // (x - x1)
          xLeftParentText.visible = xText.visible = xOperatorNode.visible = x1Node.visible = xRightParenText.visible = true;
          xLeftParentText.fill = xText.fill = xOperatorNode.fill = xRightParenText.fill = lineColor;
          if ( x1Node instanceof DynamicValueNode ) {
            x1Node.fill = lineColor;
          }
          xLeftParentText.left = previousNode.right + previousXOffset;
          xLeftParentText.y = yText.y;
          xText.left = xLeftParentText.right + this.parenXSpacing;
          xText.y = yText.y;
          xOperatorNode.left = xText.right + this.operatorXSpacing;
          xOperatorNode.centerY = xText.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yText.centerY;
          xRightParenText.left = x1Node.right + this.parenXSpacing;
          xRightParenText.y = yText.y;
        }
        else if ( line.getSlope() === 1 && line.x1 !== 0 ) {
          // x - x1
          xText.visible = xOperatorNode.visible = x1Node.visible = true;
          xText.fill = xOperatorNode.fill = lineColor;
          if ( x1Node instanceof DynamicValueNode ) {
            x1Node.fill = lineColor;
          }
          xText.left = previousNode.right + previousXOffset;
          xText.y = yText.y;
          xOperatorNode.left = xText.right + this.operatorXSpacing;
          xOperatorNode.centerY = xText.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yText.centerY;
        }
        else if ( line.x1 === 0 ) {
          // x
          xText.visible = true;
          xText.fill = lineColor;
          xText.left = previousNode.right + previousXOffset;
          xText.centerY = yText.centerY;
        }
        else {
          throw new Error( 'programming error, forgot to handle some x-term case' );
        }
      }
    };

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink( [ x1Property, y1Property, riseProperty, runProperty ],
      () => {
        if ( !updatingControls ) {
          lineProperty.value = Line.createPointSlope( x1Property.value, y1Property.value,
            riseProperty.value, runProperty.value, lineProperty.value.color );
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
        riseProperty.value = options.interactiveSlope ? line.rise : line.getSimplifiedRise();
        runProperty.value = options.interactiveSlope ? line.run : line.getSimplifiedRun();
      }
      updatingControls = false;

      // Fully-interactive equations have a constant form, no need to update layout when line changes.
      if ( !fullyInteractive ) {
        updateLayout( line );
      }
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    // If RichText that are observing a LocalizedStringProperty change size, then update the layout.
    const dynamicStringMultilink = Multilink.lazyMultilink(
      [ xText.localBoundsProperty, yText.localBoundsProperty, slopeUndefinedText.localBoundsProperty ],
      () => updateLayout( lineProperty.value )
    );

    // For fully-interactive equations ...
    let undefinedSlopeUpdater: ( line: Line ) => void;
    if ( fullyInteractive ) {

      // update layout once
      updateLayout( lineProperty.value );

      // add undefinedSlopeIndicator
      const undefinedSlopeIndicator = new UndefinedSlopeIndicator( 1, 1 );
      this.addChild( undefinedSlopeIndicator );

      parentNode.localBoundsProperty.link( localBounds => {
        undefinedSlopeIndicator.setSize( localBounds.width, localBounds.height );
        undefinedSlopeIndicator.centerX = parentNode.centerX;
        undefinedSlopeIndicator.centerY = parentNode.centerY - this.undefinedSlopeYFudgeFactor;
      } );

      undefinedSlopeUpdater = ( line: Line ) => {
        undefinedSlopeIndicator.visible = line.undefinedSlope();
      };
      lineProperty.link( undefinedSlopeUpdater ); // unlink in dispose
    }

    this.mutate( options );

    this.disposePointSlopeEquationNode = () => {
      parentNode.children.forEach( child => child.dispose() );
      controlsMultilink.dispose();
      lineProperty.unlink( lineObserver );
      dynamicStringMultilink.dispose();
      undefinedSlopeUpdater && lineProperty.unlink( undefinedSlopeUpdater );
    };
  }

  public override dispose(): void {
    this.disposePointSlopeEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of this equation: (y - y1) = m(x - x1)
   */
  public static createGeneralFormNode(): Node {

    // (y - y1) = m(x - x1)
    const stringProperty = new DerivedStringProperty(
      [ GLSymbols.yStringProperty, GLSymbols.mStringProperty, GLSymbols.xStringProperty ],
      ( y, m, x ) => `(${y} ${MathSymbols.MINUS} ${y}<sub>1</sub>) ${MathSymbols.EQUAL_TO} ${m}(${x} ${MathSymbols.MINUS} ${x}<sub>1</sub>)`
    );

    return new RichText( stringProperty, {
      isDisposable: false,
      pickable: false,
      font: new PhetFont( { size: 20, weight: GLConstants.EQUATION_FONT_WEIGHT } ),
      maxWidth: 200
    } );
  }

  /**
   * Creates a non-interactive equation, used to label a dynamic line.
   */
  public static createDynamicLabel( lineProperty: Property<Line | NotALine>, providedOptions?: CreateDynamicLabelOptions ): Node {

    const options = combineOptions<CreateDynamicLabelOptions>( {
      pickable: false,
      interactivePoint: false,
      interactiveSlope: false,
      fontSize: 18,
      maxWidth: 200
    }, providedOptions );

    // @ts-expect-error lineProperty is Property<Line | NotALine>
    return new PointSlopeEquationNode( lineProperty, options );
  }
}

graphingLines.register( 'PointSlopeEquationNode', PointSlopeEquationNode );