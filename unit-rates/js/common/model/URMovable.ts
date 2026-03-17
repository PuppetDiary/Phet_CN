// Copyright 2017-2024, University of Colorado Boulder

/**
 * A model element that is movable.
 * It has a current position and a desired destination.
 * When the user drags the model element, it moves immediately to the desired destination.
 * When the destination is set programmatically, it animates to the desired destination.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';

type SelfOptions = {
  position?: Vector2; // initial position
  dragging?: boolean; // is this instance being dragged by the user?
  animationSpeed?: number; // distance/second when animating
};

export type URMovableOptions = SelfOptions;

type AnimateToOptions = {
  animationStepCallback?: ( () => void ) | null; // called when animation step occurs
  animationCompletedCallback?: ( () => void ) | null; // called when animation has completed
};

export default class URMovable {

  // DO NOT set this directly! Use moveTo or animateTo.
  public readonly positionProperty: Vector2Property;

  // drag handlers must manage this flag during a drag sequence
  public dragging: boolean;

  private readonly animationSpeed: number; // distance/second when animating
  private destination: Vector2; // destination to animate to, set using animateTo

  // called when animation step occurs, set using animateTo. Don't do anything expensive here!
  private animationStepCallback: ( () => void ) | null;

  // called when animation to destination completes, set using animateTo
  private animationCompletedCallback: ( () => void ) | null;

  protected constructor( providedOptions?: URMovableOptions ) {

    const options = optionize<URMovableOptions, SelfOptions>()( {

      // SelfOptions
      position: new Vector2( 0, 0 ),
      dragging: false,
      animationSpeed: 100
    }, providedOptions );

    this.positionProperty = new Vector2Property( options.position );

    this.dragging = options.dragging;
    this.animationSpeed = options.animationSpeed;
    this.destination = options.position.copy();
    this.animationStepCallback = null;
    this.animationCompletedCallback = null;
  }

  public reset(): void {

    // call moveTo instead of positionProperty.set, so that any animation in progress is cancelled
    this.moveTo( this.positionProperty.initialValue );
  }

  /**
   * Moves immediately to the specified position, without animation.
   */
  public moveTo( position: Vector2 ): void {

    // cancel any pending callbacks
    this.animationStepCallback = null;
    this.animationCompletedCallback = null;

    // move immediately to the position
    this.destination = position;
    this.positionProperty.set( position );
  }

  /**
   * Animates to the specified position.
   * Provides optional callback that occur on animation step and completion.
   */
  public animateTo( destination: Vector2, providedOptions?: AnimateToOptions ): void {
    const options = providedOptions || {};
    this.destination = destination;
    this.animationStepCallback = options.animationStepCallback || null;
    this.animationCompletedCallback = options.animationCompletedCallback || null;
  }

  /**
   * Animates position, when not being dragged by the user.
   * @param dt - time since the previous step, in seconds
   */
  public step( dt: number ): void {
    const doStep = !this.dragging && ( !this.positionProperty.get().equals( this.destination ) || this.animationCompletedCallback );
    if ( doStep ) {

      // optional callback
      this.animationStepCallback && this.animationStepCallback();

      // distance from destination
      const totalDistance = this.positionProperty.get().distance( this.destination );

      // distance to move on this step
      const stepDistance = this.animationSpeed * dt;

      if ( totalDistance <= stepDistance ) {

        // move directly to the destination
        this.positionProperty.set( this.destination );

        // callback, which may set a new callback
        const saveAnimationCompletedCallback = this.animationCompletedCallback;
        this.animationCompletedCallback && this.animationCompletedCallback();
        if ( saveAnimationCompletedCallback === this.animationCompletedCallback ) {
          this.animationCompletedCallback = null;
        }
      }
      else {

        // move one step towards the destination
        const stepAngle = Math.atan2(
          this.destination.y - this.positionProperty.get().y,
          this.destination.x - this.positionProperty.get().x );
        const stepVector = Vector2.createPolar( stepDistance, stepAngle );
        this.positionProperty.set( this.positionProperty.get().plus( stepVector ) );
      }
    }
  }
}

unitRates.register( 'URMovable', URMovable );