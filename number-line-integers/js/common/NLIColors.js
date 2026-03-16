// Copyright 2023-2025, University of Colorado Boulder

/**
 * Defines the colors for this sim.
 *
 * All simulations should have a Colors.js file, see https://github.com/phetsims/scenery-phet/issues/642.
 *
 * For static colors that are used in more than one place, add them here.
 *
 * For dynamic colors that can be controlled via colorProfileProperty.js, add instances of ProfileColorProperty here,
 * each of which is required to have a default color. Note that dynamic colors can be edited by running the sim from
 * phetmarks using the "Color Edit" mode.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import Color from '../../../scenery/js/util/Color.js';
import numberLineIntegers from '../numberLineIntegers.js';


const CAVColors = {
  girlElevationColor: new Color( '#EE3937' ),
  birdElevationColor: new Color( 'black' ),
  fishElevationColor: new Color( '#446ab7' ),


  bankMostPositiveFillColor: new Color( '#1fb493' ),
  bankLeastPositiveFillColor: new Color( '#a5e1d4' ),
  bankMostNegativeFillColor: new Color( '#fb1d25' ),
  bankLeastNegativeFillColor: new Color( '#fda5a8' ),
  bankAbsoluteValueMoneyTextColor: new Color( '#0e977b' ),
  bankAbsoluteValueDebtTextColor: new Color( '#fb1d25' ),
  bankEmptyFillColor: Color.WHITE,
  bankZeroFillColor: Color.BLACK,
  coinColor: new Color( 213, 196, 39 )

};

numberLineIntegers.register( 'CAVColors', CAVColors );
export default CAVColors;