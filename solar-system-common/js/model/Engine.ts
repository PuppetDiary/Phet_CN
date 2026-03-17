// Copyright 2023-2024, University of Colorado Boulder

/**
 * Everything that controls the gravitational interactions between bodies.
 * 
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import solarSystemCommon from '../solarSystemCommon.js';
import Body from './Body.js';

export default abstract class Engine {

  // Array of gravitational interacting bodies
  protected bodies: Body[];

  protected constructor( bodies: Body[] ) {
    this.bodies = bodies;
  }

  // The child class should implement this method to check for collisions between bodies
  public checkCollisions(): void {
    // no-op
  }

  // The child class should implement this method to advance time and update the bodies properties
  public abstract run( dt: number, notifyPropertyListeners: boolean ): void;

  // The child class should implement this method to update the system: run it, check for collisions, update forces.
  public abstract update( bodies: Body[] ): void;

  // The child class should implement this method to reset the engine
  public abstract reset(): void;
}

solarSystemCommon.register( 'Engine', Engine );