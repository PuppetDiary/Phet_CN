// Copyright 2024, University of Colorado Boulder

/**
 * The phases that a SamplingField can be in. Note some phases overlap between both single/continuous modes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */
export const SamplingPhaseValues = [
  'idle', // User has not yet pressed the launch button
  'showingAirborneProjectiles', // Single mode only, show projectiles being launched through the air
  'showingCompleteSampleWithoutMean', // Single mode only, show all the landed projectiles without the mean
  'showingCompleteSampleWithMean' // Single + Continuous, but this is the primary mode for Continuous
] as const;

export type SamplingPhase = typeof SamplingPhaseValues[number];