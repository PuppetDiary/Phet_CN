// Copyright 2016-2025, University of Colorado Boulder

/**
 * ShoppingQuestion is the base class for questions that appears in the 'Questions' panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Axis from '../../common/model/Axis.js';
import unitRates from '../../unitRates.js';

export default class ShoppingQuestion {

  public readonly questionStringProperty: TReadOnlyProperty<string>;
  public readonly answer: number;
  public readonly numerator: number;
  public readonly denominator: number;
  public readonly numeratorStringProperty: TReadOnlyProperty<string>;
  public readonly denominatorStringProperty: TReadOnlyProperty<string>;
  public readonly answerAxis: Axis;

  public readonly guessProperty: Property<number | null>; // the user's guess, null indicates no guess
  public readonly correctEmitter: Emitter<[ ShoppingQuestion ]>; // emit is called when the question is answered correctly

  private readonly disposeShoppingQuestion: () => void;

  /**
   * @param questionStringProperty - the question string to be displayed
   * @param answer - the correct answer
   * @param numerator
   * @param denominator
   * @param numeratorStringProperty - the numerator to display when the answer is revealed
   * @param denominatorStringProperty - the denominator to display when the answer is revealed
   * @param answerAxis - provides formatting for the answer (and guesses)
   */
  protected constructor( questionStringProperty: TReadOnlyProperty<string>,
                         answer: number,
                         numerator: number,
                         denominator: number,
                         numeratorStringProperty: TReadOnlyProperty<string>,
                         denominatorStringProperty: TReadOnlyProperty<string>,
                         answerAxis: Axis ) {

    this.questionStringProperty = questionStringProperty;
    this.answer = answer;
    this.numerator = numerator;
    this.denominator = denominator;
    this.numeratorStringProperty = numeratorStringProperty;
    this.denominatorStringProperty = denominatorStringProperty;
    this.answerAxis = answerAxis;

    this.guessProperty = new Property<number | null>( null );

    this.correctEmitter = new Emitter( {
      parameters: [ { valueType: ShoppingQuestion } ]
    } );

    // Notify observers when the question is answered correctly, no unlink required
    this.guessProperty.link( guess => {
      if ( guess === answer ) {
        this.correctEmitter.emit( this );
      }
    } );

    this.disposeShoppingQuestion = () => {
      this.guessProperty.dispose();
      this.correctEmitter.dispose();
    };
  }

  public reset(): void {
    this.guessProperty.reset();
  }

  public dispose(): void {
    this.disposeShoppingQuestion();
  }
}

unitRates.register( 'ShoppingQuestion', ShoppingQuestion );