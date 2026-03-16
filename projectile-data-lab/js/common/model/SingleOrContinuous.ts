// Copyright 2024, University of Colorado Boulder

/**
 * SingleOrContinuous is a string literal union enumeration that describes whether the launch mode is single or continuous.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const SingleOrContinuousValues = [ 'single', 'continuous' ] as const;

export type SingleOrContinuous = typeof SingleOrContinuousValues[number];