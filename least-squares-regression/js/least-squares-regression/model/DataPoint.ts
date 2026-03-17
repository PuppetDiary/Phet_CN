// Copyright 2014-2024, University of Colorado Boulder

/**
 * Type that defines a data point.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Disposable from '../../../../axon/js/Disposable.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';

export default class DataPoint extends Disposable {

  // Indicates where in model space the center of this data point is.
  public readonly positionProperty: Vector2Property;

  // Flag that tracks whether the user is dragging this data point around.
  public readonly userControlledProperty: BooleanProperty;

  // Flag that indicates whether this element is animating from one position back to the bucket.
  public readonly animatingProperty: BooleanProperty;

  // Emitter that fires when the data point has returned to its origin.
  public readonly returnedToOriginEmitter: Emitter;

  public userControlledListener?: ( userControlled: boolean ) => void;
  public returnedToOriginListener?: () => void;

  /**
   * @param initialPosition - the initial position of the DataPoint in model space
   */
  public constructor( initialPosition: Vector2 ) {
    super();

    this.positionProperty = new Vector2Property( initialPosition );
    this.userControlledProperty = new BooleanProperty( false );
    this.animatingProperty = new BooleanProperty( false );
    this.returnedToOriginEmitter = new Emitter();

    this.disposeEmitter.addListener( () => {
      this.positionProperty.dispose();
      this.userControlledProperty.dispose();
      this.animatingProperty.dispose();
      this.returnedToOriginEmitter.dispose();

      delete this.userControlledListener;
      delete this.returnedToOriginListener;
    } );
  }

  /**
   * Function that animates the DataPoint back to the bucket.
   */
  public animateBackToBucket(): void {
    if ( this.isDisposed ) {
      return;
    }
    this.animatingProperty.set( true );

    const distance = this.positionProperty.initialValue.distance( this.positionProperty.value );

    if ( distance > 0 ) {
      const animation = new Animation( {
        targets: [ {
          property: this.positionProperty,
          to: this.positionProperty.initialValue,
          easing: Easing.CUBIC_IN
        } ],
        duration: 0.5
      } );

      animation.endedEmitter.addListener( () => {
        if ( !this.isDisposed ) {
          this.animatingProperty.set( false );
          this.returnedToOriginEmitter.emit();
        }
      } );
      animation.start();
    }
    else {
      // If the distance is zero, no animation is needed
      this.animatingProperty.set( false );
      this.returnedToOriginEmitter.emit();
    }
  }
}

leastSquaresRegression.register( 'DataPoint', DataPoint );