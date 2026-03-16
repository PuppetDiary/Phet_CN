// Copyright 2024, University of Colorado Boulder

/**
 * LaunchSoundStrategy is a string literal union enumeration that describes the user preference to play the launch sound
 * based on the launch speed or launch angle of the projectile, or to play no sound at all.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

export const LaunchSoundStrategyValues = [ 'speed', 'angle', 'none' ] as const;

export type LaunchSoundStrategy = typeof LaunchSoundStrategyValues[number];