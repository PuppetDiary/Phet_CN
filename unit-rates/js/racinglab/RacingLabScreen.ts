// Copyright 2016-2025, University of Colorado Boulder

/**
 * The 'Racing Lab' screen
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import racingLabScreenIcon_png from '../../images/racingLabScreenIcon_png.js';
import URColors from '../common/URColors.js';
import unitRates from '../unitRates.js';
import UnitRatesStrings from '../UnitRatesStrings.js';
import RacingLabModel from './model/RacingLabModel.js';
import RacingLabScreenView from './view/RacingLabScreenView.js';

export default class RacingLabScreen extends Screen<RacingLabModel, RacingLabScreenView> {

  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: UnitRatesStrings.screen.racingLabStringProperty,
      backgroundColorProperty: URColors.racingLabScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( racingLabScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new RacingLabModel( tandem.createTandem( 'model' ) ),
      model => new RacingLabScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

unitRates.register( 'RacingLabScreen', RacingLabScreen );