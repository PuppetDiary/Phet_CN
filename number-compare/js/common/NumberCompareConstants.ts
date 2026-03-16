// Copyright 2023-2025, University of Colorado Boulder

/**
 * Constants defined for this simulation.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingCommonConstants from '../../../counting-common/js/common/CountingCommonConstants.js';
import numberCompare from '../numberCompare.js';

const NumberCompareConstants = {
  // default value for the maximum sum on the 'Compare' screen, see NumberCompareQueryParameters
  COMPARE_MAX_DEFAULT: CountingCommonConstants.MAX_IMAGES_PER_COUNTING_OBJECT
};

numberCompare.register( 'NumberCompareConstants', NumberCompareConstants );
export default NumberCompareConstants;