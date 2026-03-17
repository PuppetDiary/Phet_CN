// Copyright 2017-2025, University of Colorado Boulder

/**
 * Model of a shopping item. Origin is at the bottom center of the item.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import URMovable, { URMovableOptions } from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';

type SelfOptions = {
  visible?: boolean; // is the item initially visible?
};

type ShoppingItemOptions = SelfOptions & URMovableOptions;

export default class ShoppingItem extends URMovable {

  public readonly nameStringProperty: TReadOnlyProperty<string>;
  public readonly image: HTMLImageElement;
  public readonly visibleProperty: BooleanProperty;

  /**
   * @param nameStringProperty - for internal use
   * @param image - image used by the view to represent this item
   * @param [providedOptions]
   */
  public constructor( nameStringProperty: TReadOnlyProperty<string>, image: HTMLImageElement, providedOptions?: ShoppingItemOptions ) {

    const options = optionize<ShoppingItemOptions, SelfOptions, URMovableOptions>()( {

      // SelfOptions
      visible: true,

      // URMovableOptions
      animationSpeed: 400
    }, providedOptions );

    super( options );

    this.nameStringProperty = nameStringProperty;
    this.image = image;
    this.visibleProperty = new BooleanProperty( options.visible );
  }

  public override reset(): void {
    this.visibleProperty.reset();
    super.reset();
  }
}

unitRates.register( 'ShoppingItem', ShoppingItem );