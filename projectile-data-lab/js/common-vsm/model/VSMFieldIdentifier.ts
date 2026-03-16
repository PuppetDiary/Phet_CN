// Copyright 2023-2024, University of Colorado Boulder

/**
 * Uniquely identify each field, note these are also used in the tandems.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const VSMFieldIdentifierValues = [
  'field1', 'field2', 'field3', 'field4', 'field5', 'field6'
] as const;

export type VSMFieldIdentifier = typeof VSMFieldIdentifierValues[number];