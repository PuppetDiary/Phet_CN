// Copyright 2023-2024, University of Colorado Boulder

/**
 * ScreenIdentifier is a string literal union enumeration representing the context for a screen in the simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const ScreenIdentifierValues = [ 'variability', 'sources', 'measures', 'sampling' ] as const;

export const screenIdentifierForScreenTandemName = ( screenTandemName: string ): ScreenIdentifier => {
  const screenTandemNameTrimmed: ScreenIdentifier = screenTandemName.replace( 'Screen', '' ) as ScreenIdentifier;
  assert && assert( ScreenIdentifierValues.includes( screenTandemNameTrimmed ), `Invalid screenTandemName: ${screenTandemName}` );
  return screenTandemNameTrimmed;
};

export type ScreenIdentifier = typeof ScreenIdentifierValues[number];