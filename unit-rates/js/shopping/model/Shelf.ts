// Copyright 2017-2024, University of Colorado Boulder

/**
 * Model of the shelf.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';
import ShoppingContainer, { ShoppingContainerOptions } from './ShoppingContainer.js';

type SelfOptions = EmptySelfOptions;

type ShelfOptions = SelfOptions & ShoppingContainerOptions;

export default class Shelf extends ShoppingContainer {

  // Description of pseudo-3D shape
  public readonly width = 350; // width of the top face, at its center
  public readonly height = 15; // height of the front face
  public readonly depth = 45; // depth, after flattening to 2D
  public readonly perspectiveXOffset = 30; // offset for parallel perspective, after flattening to 2D

  public constructor( providedOptions?: ShelfOptions ) {

    const options = optionize<ShelfOptions, SelfOptions, ShoppingContainerOptions>()( {

      // ShoppingContainerOptions
      position: new Vector2( 0, 0 ), // position of the center of the shelf's top face
      numberOfBags: 4, // maximum number of bags on the shelf
      bagSize: new Dimension2( 100, 100 ), // dimensions of each bag
      bagRowYOffset: 0, // offset of bag row from shelf origin
      numberOfItems: 15, // maximum number of items on the shelf
      itemSize: new Dimension2( 25, 25 ), // dimensions of each item
      backRowYOffset: 8, // offset of items back row from shelf origin
      frontRowYOffset: 16 // offset of items front row from shelf origin
    }, providedOptions );

    super( options );
  }
}

unitRates.register( 'Shelf', Shelf );