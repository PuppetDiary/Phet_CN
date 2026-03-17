// Copyright 2014-2025, University of Colorado Boulder

/**
 * Equation Node that renders a text node of a linear equation of the form y = m x + b where m and b are numerical values
 *
 * @author Martin Veillette (Berea College)
 */

import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

type SelfOptions = {
  maxDecimalPlaces?: number; // Maximum number of decimal places for slope and intercept
  mode?: 'myLine' | 'bestFitLine'; // Mode of the equation node
  maxCharacterWidth?: number; // Maximum width of characters in the equation
};

type EquationNodeOptions = SelfOptions & NodeOptions;

type NumberStringData = {
  absoluteNumber: string;
  optionalSign: string;
  sign: string;
};

export default class EquationNode extends Node {

  // Public Text nodes
  public readonly yText: Text;
  public readonly equalText: Text;
  public readonly signSlopeText: Text;
  public readonly valueSlopeText: Text;
  public readonly xText: Text;
  public readonly signInterceptText: Text;
  public readonly valueInterceptText: Text;

  // Store options for later use
  private readonly options: EquationNodeOptions;

  /**
   * Scenery Node responsible for laying out the linear equation y = m x + b
   */
  public constructor( providedOptions?: EquationNodeOptions ) {
    super();

    const options = optionize<EquationNodeOptions, SelfOptions, NodeOptions>()( {
      maxDecimalPlaces: 2, // Maximum number of decimal places on slope and intercept
      mode: 'myLine', // Valid options are 'myLine' and 'bestFitLine'
      maxCharacterWidth: 25 // Maximum width of text in the combo box
    }, providedOptions );

    this.options = options;

    // options for the text elements of the equation

    let numericalTextOptions; // font and fill options for numerical strings , i.e.  '- 9.54'
    let stringTextOptions; // font and fill options for 'pure' strings, e.g., 'y'

    switch( options.mode ) {
      case 'myLine':
        numericalTextOptions = {
          font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
          fill: LeastSquaresRegressionConstants.MY_LINE_COLOR.BASE_COLOR,
          maxWidth: 25
        };
        stringTextOptions = {
          font: LeastSquaresRegressionConstants.TEXT_FONT,
          fill: 'black',
          maxWidth: options.maxCharacterWidth
        };
        break;
      case 'bestFitLine':
        numericalTextOptions = {
          font: LeastSquaresRegressionConstants.TEXT_FONT,
          fill: LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.BASE_COLOR,
          maxWidth: options.maxCharacterWidth
        };
        stringTextOptions = numericalTextOptions;
        break;
      default:
        throw new Error( 'Unknown mode for EquationNode: ' );
    }

    // use the widest possible numbers for laying out the equation

    let maxWidthSlopeString = '0.';
    for ( let i = 0; i < options.maxDecimalPlaces; i++ ) {
      maxWidthSlopeString = `${maxWidthSlopeString}0`;
    }

    let maxWidthInterceptString = '0.';
    for ( let j = 0; j < options.maxDecimalPlaces; j++ ) {
      maxWidthInterceptString = `${maxWidthInterceptString}0`;
    }

    this.yText = new Text( LeastSquaresRegressionStrings.symbol.yStringProperty, stringTextOptions ); // 'y'
    this.equalText = new Text( MathSymbols.EQUAL_TO, stringTextOptions ); // the '=' sign
    this.signSlopeText = new Text( MathSymbols.PLUS, numericalTextOptions ); // + or -
    this.valueSlopeText = new Text( maxWidthSlopeString, numericalTextOptions ); // a number
    this.xText = new Text( LeastSquaresRegressionStrings.symbol.xStringProperty, stringTextOptions ); // 'x'
    this.signInterceptText = new Text( MathSymbols.PLUS, stringTextOptions );// + or -
    this.valueInterceptText = new Text( maxWidthInterceptString, numericalTextOptions );// a number

    if ( options.mode === 'bestFitLine' ) {
      const mutableEquationText = new Node( {
        children: [
          this.yText,
          this.equalText,
          this.signSlopeText,
          this.valueSlopeText,
          this.xText,
          this.signInterceptText,
          this.valueInterceptText
        ]
      } );

      ManualConstraint.create( this, [ this.yText, this.equalText, this.signSlopeText, this.valueSlopeText, this.xText, this.signInterceptText, this.valueInterceptText ],
        ( yTextProxy, equalTextProxy, signSlopeTextProxy, valueSlopeTextProxy, xTextProxy, signInterceptTextProxy, valueInterceptTextProxy ) => {

          // layout of the entire equation
          yTextProxy.left = 0;
          equalTextProxy.left = yTextProxy.right + 3;
          signSlopeTextProxy.left = equalTextProxy.right + 1;
          valueSlopeTextProxy.left = signSlopeTextProxy.right + 3;
          xTextProxy.left = valueSlopeTextProxy.right + 3;
          signInterceptTextProxy.left = xTextProxy.right + 3;
          valueInterceptTextProxy.left = signInterceptTextProxy.right + 3;
        } );

      this.addChild( mutableEquationText );
    }
    else {
      // MyLineControlPanel does the layout to align with the sliders and static equation
    }

    this.mutate( options );
  }

  /**
   * Change the visibility by changing the opacity, so that a blank equation will still take up layout space.
   * @param equationVisible
   */
  public setEquationVisible( equationVisible: boolean ): void {
    this.opacity = equationVisible ? 1 : 0;
  }

  /**
   * Sets the text of the slope and its accompanying sign.
   * @param slope - The slope value to display.
   */
  public setSlopeText( slope: number ): void {
    const { optionalSign, absoluteNumber } = this.numberToString( slope );
    this.signSlopeText.string = optionalSign;
    this.valueSlopeText.string = absoluteNumber;
  }

  /**
   * Sets the text of the intercept and its accompanying sign.
   * @param intercept - The intercept value to display.
   */
  public setInterceptText( intercept: number ): void {
    const { sign, absoluteNumber } = this.numberToString( intercept );
    this.signInterceptText.string = sign;
    this.valueInterceptText.string = absoluteNumber;
  }

  /**
   * Convert a number to a String, subject to rounding to a certain number of decimal places
   * @param number - The number to convert.
   * @returns An object containing the absolute number string, optional sign, and sign.
   */
  private numberToString( number: number ): NumberStringData {
    const isNegative = parseFloat( this.roundNumber( number ) ) < 0;
    const signString = isNegative ? MathSymbols.MINUS : MathSymbols.PLUS;
    const optionalSignString = isNegative ? MathSymbols.MINUS : ' ';
    const absoluteNumber = this.roundNumber( Math.abs( parseFloat( this.roundNumber( number ) ) ) );
    return {
      absoluteNumber: absoluteNumber,
      optionalSign: optionalSignString,
      sign: signString
    };
  }

  /**
   * Rounds a number to a certain number of decimal places based on its magnitude.
   * @param number - The number to round.
   * @returns The rounded number as a string.
   */
  private roundNumber( number: number ): string {
    let roundedNumber;
    if ( Math.abs( number ) < 10 ) {
      roundedNumber = Utils.toFixed( number, this.options.maxDecimalPlaces! ); // eg. 9.99, 0.01 if this.options.maxDecimalPlaces=2
    }
    else if ( Math.abs( number ) < 100 ) {
      roundedNumber = Utils.toFixed( number, this.options.maxDecimalPlaces! - 1 ); // eg. 10.1, 99.9
    }
    else {
      roundedNumber = Utils.toFixed( number, this.options.maxDecimalPlaces! - 2 );// 100, 1000, 10000, 99999
    }
    return roundedNumber;
  }
}

leastSquaresRegression.register( 'EquationNode', EquationNode );