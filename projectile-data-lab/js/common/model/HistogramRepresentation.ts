// Copyright 2023-2024, University of Colorado Boulder

/**
 * The HistogramRepresentation is an enumeration that describes whether the histogram is showing bars (one per bin) or
 * blocks (one per projectile).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const HistogramRepresentationValues = [ 'blocks', 'bars' ] as const;

export type HistogramRepresentation = typeof HistogramRepresentationValues[number];