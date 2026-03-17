// Copyright 2017-2025, University of Colorado Boulder

/**
 * Model of the scale.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';
import ShoppingContainer, { ShoppingContainerOptions } from './ShoppingContainer.js';

type SelfOptions = {
  quantityUnitsStringProperty: TReadOnlyProperty<string>; // units for quantity
  quantityPerBag?: number; // quantity in each bag
};

type ScaleOptions = SelfOptions & ShoppingContainerOptions;

export default class Scale extends ShoppingContainer {

  public readonly quantityUnitsStringProperty: TReadOnlyProperty<string>;

  // description of pseudo-3D shape
  public readonly width = 350; // diameter of the top platter
  public readonly height = 60; // height of the front face
  public readonly depth = 45; // depth, after flattening to 2D
  public readonly perspectiveXOffset = 30; // offset for parallel perspective, after flattening to 2D

  public readonly yAboveScale: number; // any y value less than this is considered "above the scale"

  public quantityUpdateEnabled: boolean;
  public readonly quantityProperty: TReadOnlyProperty<number>;
  public readonly costProperty: TReadOnlyProperty<number>;

  public constructor( unitRateProperty: TReadOnlyProperty<number>, providedOptions: ScaleOptions ) {

    const options = optionize<ScaleOptions, SelfOptions, ShoppingContainerOptions>()( {

      // SelfOptions
      quantityPerBag: 5, // quantity in each bag

      // ShoppingContainer options
      position: new Vector2( 0, 0 ), // position of the center of the scale's top surface
      numberOfBags: 4, // maximum number of bags on the scale
      bagSize: new Dimension2( 100, 100 ), // dimensions of each bag
      bagRowYOffset: 5, // offset of bag row from scale origin
      numberOfItems: 15, // maximum number of items on the shelf
      itemSize: new Dimension2( 25, 25 ), // dimensions of each item
      backRowYOffset: -4, // offset of items back row from scale origin
      frontRowYOffset: 12 // offset of items front row from scale origin
    }, providedOptions );

    super( options );

    this.quantityUnitsStringProperty = options.quantityUnitsStringProperty;

    // Offset determined empirically, see https://github.com/phetsims/unit-rates/issues/174
    this.yAboveScale = this.position.y + 70;

    this.quantityUpdateEnabled = true;

    this.quantityProperty = new DerivedProperty(
      [ this.numberOfBagsProperty, this.numberOfItemsProperty ],
      ( numberOfBags, numberOfItems ) => {
        if ( this.quantityUpdateEnabled ) {
          return ( numberOfBags * options.quantityPerBag ) + numberOfItems;
        }
        else {
          return this.quantityProperty.value;
        }
      } );

    this.costProperty = new DerivedProperty(
      [ this.quantityProperty, unitRateProperty ],
      ( quantity, unitRate ) => quantity * unitRate
    );
  }
}

unitRates.register( 'Scale', Scale );