// Copyright 2016-2025, University of Colorado Boulder

/**
 * The 'Shopping' screen
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import shoppingScreenIcon_png from '../../images/shoppingScreenIcon_png.js';
import URColors from '../common/URColors.js';
import unitRates from '../unitRates.js';
import UnitRatesStrings from '../UnitRatesStrings.js';
import ShoppingModel from './model/ShoppingModel.js';
import ShoppingScreenView from './view/ShoppingScreenView.js';

export default class ShoppingScreen extends Screen<ShoppingModel, ShoppingScreenView> {

  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: UnitRatesStrings.screen.shoppingStringProperty,
      backgroundColorProperty: URColors.shoppingScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( shoppingScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new ShoppingModel( tandem.createTandem( 'model' ) ),
      model => new ShoppingScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

unitRates.register( 'ShoppingScreen', ShoppingScreen );