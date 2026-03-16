// Copyright 2024, University of Colorado Boulder

/**
 * MysteryOrCustom is a string literal union enumeration that describes whether the cannon is mystery or custom.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const MysteryOrCustomValues = [ 'mystery', 'custom' ] as const;

export type MysteryOrCustom = typeof MysteryOrCustomValues[number];