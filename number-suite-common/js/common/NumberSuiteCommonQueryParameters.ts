// Copyright 2022-2025, University of Colorado Boulder

/**
 * NumberSuiteCommonQueryParameters defines query parameters that are specific to Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';
import numberSuiteCommon from '../numberSuiteCommon.js';

const NumberSuiteCommonQueryParameters = QueryStringMachine.getAll( {

  // whether the current number on the 'Ten' and 'Twenty' screens or the compare statement on the 'Compare' screen
  // should be spoken aloud when their value changes.
  autoHear: {
    public: true,
    type: 'flag'
  },

  // specifies a second locale to make available on the 'Ten', 'Twenty', and 'Compare' screens. Values are specified
  // with a locale code, e.g. "en" or "zh_CN".
  secondLocale: {
    public: true,
    type: 'string',
    defaultValue: null
  },

  // whether the paper ones are visible on the 'Lab' screen
  showLabOnes: {
    public: true,
    type: 'boolean',
    defaultValue: true
  }
} );

if ( NumberSuiteCommonQueryParameters.secondLocale !== null ) {
  // Use the logic found in initialize-globals for `checkAndRemapLocale()` to support same schema for secondLocale.
  const remappedLocale = phet.chipper.remapLocale( NumberSuiteCommonQueryParameters.secondLocale, false );
  NumberSuiteCommonQueryParameters.secondLocale = phet.chipper.getValidRuntimeLocale( remappedLocale );
}

numberSuiteCommon.register( 'NumberSuiteCommonQueryParameters', NumberSuiteCommonQueryParameters );
export default NumberSuiteCommonQueryParameters;