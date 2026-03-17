// Copyright 2022-2025, University of Colorado Boulder

/**
 * A square button that has a 'ten frame' representation on it.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import TColor from '../../../../scenery/js/util/TColor.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import TenFrameNode from './TenFrameNode.js';

// constants
const SIDE_LENGTH = NumberSuiteCommonConstants.BUTTON_LENGTH;

class OrganizeButton extends RectangularPushButton {

  public constructor( color: TColor, listener: () => void ) {

    const tenFramePath = TenFrameNode.getTenFramePath( {
      fill: null,
      lineWidth: 3
    } );

    super( {
      content: tenFramePath,
      size: new Dimension2( SIDE_LENGTH, SIDE_LENGTH - 0.5 ), // tweak to match height of closed accordion box
      xMargin: 4,
      baseColor: color,
      listener: listener
    } );
  }
}

numberSuiteCommon.register( 'OrganizeButton', OrganizeButton );
export default OrganizeButton;