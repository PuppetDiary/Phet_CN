// Copyright 2023-2025, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Luisa Vargas
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';
import numberLineDistance from '../numberLineDistance.js';

const NumberLineDistanceQueryParameters = QueryStringMachine.getAll( {

  terminology: {
    type: 'string',
    validValues: [ 'directedDistance', 'displacement' ],
    defaultValue: 'directedDistance'
  }
} );

numberLineDistance.register( 'NumberLineDistanceQueryParameters', NumberLineDistanceQueryParameters );

export default NumberLineDistanceQueryParameters;