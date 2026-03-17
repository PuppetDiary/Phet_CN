// Copyright 2017-2025, University of Colorado Boulder

/**
 * Button that resets a race in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import resetRaceButton_png from '../../../images/resetRaceButton_png.js';
import unitRates from '../../unitRates.js';

type SelfOptions = EmptySelfOptions;

type ResetRaceButtonOptions = SelfOptions & NodeTranslationOptions & PickRequired<RectangularPushButtonOptions, 'listener'>;

export default class ResetRaceButton extends RectangularPushButton {

  public constructor( providedOptions: ResetRaceButtonOptions ) {
    super( optionize<ResetRaceButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      // RectangularPushButtonOptions
      isDisposable: false,
      content: new Image( resetRaceButton_png, { scale: 0.5 } ),
      xMargin: 12,
      yMargin: 8
    }, providedOptions ) );
  }
}

unitRates.register( 'ResetRaceButton', ResetRaceButton );