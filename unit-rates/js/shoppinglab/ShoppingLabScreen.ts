// Copyright 2016-2025, University of Colorado Boulder

/**
 * The 'Shopping Lab' screen
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import shoppingLabScreenIcon_png from '../../images/shoppingLabScreenIcon_png.js';
import URColors from '../common/URColors.js';
import unitRates from '../unitRates.js';
import UnitRatesStrings from '../UnitRatesStrings.js';
import ShoppingLabModel from './model/ShoppingLabModel.js';
import ShoppingLabScreenView from './view/ShoppingLabScreenView.js';

export default class ShoppingLabScreen extends Screen<ShoppingLabModel, ShoppingLabScreenView> {

  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: UnitRatesStrings.screen.shoppingLabStringProperty,
      backgroundColorProperty: URColors.shoppingScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( shoppingLabScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new ShoppingLabModel( tandem.createTandem( 'model' ) ),
      model => new ShoppingLabScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

unitRates.register( 'ShoppingLabScreen', ShoppingLabScreen );