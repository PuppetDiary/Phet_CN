// Copyright 2017-2024, University of Colorado Boulder

/**
 * The fruit scene in the Shopping screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import unitRates from '../../unitRates.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingScene, { ShoppingSceneOptions } from './ShoppingScene.js';

type SelfOptions = EmptySelfOptions;
type FruitSceneOptions = SelfOptions & PickOptional<ShoppingSceneOptions, 'rate'>;

export default class FruitScene extends ShoppingScene {

  public constructor( itemData: ShoppingItemData, providedOptions?: FruitSceneOptions ) {

    const options = optionize<FruitSceneOptions, SelfOptions, ShoppingSceneOptions>()( {

      // ShoppingSceneOptions
      bagsOpen: true // Fruit bags open when placed on the scale
    }, providedOptions );

    super( itemData, options );
  }
}

unitRates.register( 'FruitScene', FruitScene );