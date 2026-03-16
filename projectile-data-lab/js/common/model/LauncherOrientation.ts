// Copyright 2023-2024, University of Colorado Boulder

/**
 * Defines the orientation for the launch height and mean launch angle of the launcher. The launcher can either
 * be angled (30, 45, or 60 degrees) and at ground level, or flat (0 degrees) and raised.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const LauncherOrientationValues = [ 'angle30', 'angle45', 'angle60', 'angle0Raised' ] as const;

export const MEAN_LAUNCH_ANGLES = {
  angle30: 30,
  angle45: 45,
  angle60: 60,
  angle0Raised: 0
};

export type LauncherOrientation = typeof LauncherOrientationValues[number];