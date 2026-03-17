// Copyright 2017-2024, University of Colorado Boulder

/**
 * The vegetable scene in the Shopping screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import unitRates from '../../unitRates.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingScene, { ShoppingSceneOptions } from './ShoppingScene.js';

type SelfOptions = EmptySelfOptions;
type VegetableSceneOptions = SelfOptions & PickOptional<ShoppingSceneOptions, 'rate'>;

export default class VegetableScene extends ShoppingScene {

  public constructor( itemData: ShoppingItemData, providedOptions?: VegetableSceneOptions ) {
    super( itemData, providedOptions );
  }
}

unitRates.register( 'VegetableScene', VegetableScene );