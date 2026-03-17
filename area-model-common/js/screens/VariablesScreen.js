// Copyright 2018-2026, University of Colorado Boulder

/**
 * The "Variables" screen of "Area Model: Algebra"
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import variablesScreenIcon_png from '../../mipmaps/variablesScreenIcon_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import GenericAreaModel from '../generic/model/GenericAreaModel.js';
import GenericAreaScreenView from '../generic/view/GenericAreaScreenView.js';

class VariablesScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.variablesStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( variablesScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => {
        return new GenericAreaModel( {
          allowExponents: true
        } );
      },
      model => new GenericAreaScreenView( model, 0 ),
      options
    );
  }
}

areaModelCommon.register( 'VariablesScreen', VariablesScreen );
export default VariablesScreen;