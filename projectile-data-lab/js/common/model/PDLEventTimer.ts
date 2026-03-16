// Copyright 2023-2024, University of Colorado Boulder

/**
 * Abstraction for timed-event series that helps with variable frame-rates. Note this has similar functionality to
 * EventTimer, but has an interface and simplifications that are appropriate for the Projectile Data Lab.
 *
 * This is used to sequence the continuous mode firing, and within- and between- sample firing in the Sampling screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import projectileDataLab from '../../projectileDataLab.js';

export default class PDLEventTimer {

  // Amount of time between events, in seconds
  private readonly period: number;

  // Whether the timer is running
  private readonly isRunningProperty: Property<boolean>;

  // Remaining time until the next event, in seconds
  private readonly timeRemainingProperty: NumberProperty;

  public constructor( period: number, tandem: Tandem ) {
    this.period = period;

    this.isRunningProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isRunningProperty' )
    } );

    this.timeRemainingProperty = new NumberProperty( period, {
      tandem: tandem.createTandem( 'timeRemainingProperty' )
    } );
  }

  /**
   * Advance the elapsed time by dt seconds, triggering callbacks as necessary. May trigger 0 or more callbacks.
   * Note the callbacks may change the timer, such as stopping it or changing the period.
   */
  public step( dt: number, callback: () => void ): void {

    if ( this.isRunningProperty.value ) {

      // isRunning may be changed in the callbacks, so we much check it each time
      while ( dt >= this.timeRemainingProperty.value && this.isRunningProperty.value ) {
        dt -= this.timeRemainingProperty.value;
        this.timeRemainingProperty.value = this.period;
        callback();
      }

      // use up the remaining time
      this.timeRemainingProperty.value -= dt;
    }
  }

  /**
   * Called from reset(), restore all the initial state.
   */
  public reset(): void {
    this.timeRemainingProperty.reset();
    this.isRunningProperty.reset();
  }

  /**
   * Schedule the next event to occur at the current period, and start the timer.
   */
  public restart(): void {
    this.timeRemainingProperty.value = this.period;
    this.isRunningProperty.value = true;
  }

  /**
   * Schedule the next event to occur on the very next step(dt). Note the timer may be paused. In that case, the next
   * event would occur when unpaused.
   */
  public setZeroTimeRemaining(): void {
    this.timeRemainingProperty.value = 0;
  }
}

projectileDataLab.register( 'PDLEventTimer', PDLEventTimer );