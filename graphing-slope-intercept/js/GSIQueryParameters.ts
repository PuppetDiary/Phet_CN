// Copyright 2024-2025, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { QueryStringMachine } from '../../query-string-machine/js/QueryStringMachineModule.js';
import getGameLevelsSchema from '../../vegas/js/getGameLevelsSchema.js';
import graphingSlopeIntercept from './graphingSlopeIntercept.js';

const NUMBER_OF_GAME_LEVELS = 4;
export { NUMBER_OF_GAME_LEVELS };

const GSIQueryParameters = QueryStringMachine.getAll( {

  // The levels to show in the Game screen.
  gameLevels: getGameLevelsSchema( NUMBER_OF_GAME_LEVELS )
} );

graphingSlopeIntercept.register( 'GSIQueryParameters', GSIQueryParameters );

export default GSIQueryParameters;