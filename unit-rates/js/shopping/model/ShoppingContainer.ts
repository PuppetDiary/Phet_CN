// Copyright 2017-2025, University of Colorado Boulder

/**
 * Container for bags and shopping items, used as the base type for Shelf and Scale.
 * Provides 1 row of bags, and 2 rows of shopping items (front and back).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Disposable from '../../../../axon/js/Disposable.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import unitRates from '../../unitRates.js';
import Bag from './Bag.js';
import RowOfMovables from './RowOfMovables.js';
import ShoppingItem from './ShoppingItem.js';

type SelfOptions = {
  position?: Vector2; // position of the container

  // bags
  numberOfBags?: number; // maximum number of bags on the shelf
  bagSize?: Dimension2; // dimensions of each bag
  bagRowYOffset?: number; // offset of bag row from the container's origin

  // items
  numberOfItems?: number;
  itemSize?: Dimension2;// dimensions of each item
  itemCellSpacing?: number; // horizontal spacing between cells in each row
  backRowYOffset?: number; // offset of items front row from the container's origin
  frontRowYOffset?: number; // offset of items back row from the container's origin
};

export type ShoppingContainerOptions = SelfOptions;

export default class ShoppingContainer {

  public readonly position: Vector2;
  public readonly bagRow: RowOfMovables; // row of bags
  public readonly backItemRow: RowOfMovables; // back row of items
  public readonly frontItemRow: RowOfMovables; // front row of items
  public readonly numberOfBagsProperty: TReadOnlyProperty<number>;
  public readonly numberOfItemsProperty: TReadOnlyProperty<number>;

  protected constructor( providedOptions?: ShoppingContainerOptions ) {

    const options = optionize<ShoppingContainerOptions, SelfOptions>()( {

      // SelfOptions
      position: new Vector2( 0, 0 ),
      numberOfBags: 4,
      bagSize: new Dimension2( 100, 100 ),
      bagRowYOffset: 0,
      numberOfItems: 1,
      itemSize: new Dimension2( 10, 10 ),
      itemCellSpacing: 8,
      backRowYOffset: 0,
      frontRowYOffset: 0
    }, providedOptions );

    this.position = options.position;

    this.bagRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.bagRowYOffset ),
      numberOfCells: options.numberOfBags,
      cellSize: options.bagSize,

      // These values were determined empirically, to look visually pleasing.
      // For fruit, the spacing affects how cells are populated when bags open to reveal items.
      cellSpacing: ( options.numberOfBags < 4 ) ? 25 : 15
    } );

    // Back row has 1 more cell than front row
    const backNumberOfCells = Math.floor( options.numberOfItems / 2 ) + 1;
    const frontNumberOfCells = options.numberOfItems - backNumberOfCells;
    assert && assert( backNumberOfCells + frontNumberOfCells === options.numberOfItems );

    this.backItemRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.backRowYOffset ),
      numberOfCells: backNumberOfCells,
      cellSize: options.itemSize,
      cellSpacing: options.itemCellSpacing
    } );

    this.frontItemRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.frontRowYOffset ),
      numberOfCells: frontNumberOfCells,
      cellSize: options.itemSize,
      cellSpacing: options.itemCellSpacing
    } );

    this.numberOfBagsProperty = new DerivedProperty(
      [ this.bagRow.numberOfMovablesProperty ],
      numberOfMovables => numberOfMovables
    );

    this.numberOfItemsProperty = new DerivedProperty(
      [ this.frontItemRow.numberOfMovablesProperty, this.backItemRow.numberOfMovablesProperty ],
      ( frontNumberOfMovables, backNumberOfMovables ) => frontNumberOfMovables + backNumberOfMovables
    );
  }

  public dispose(): void {
    Disposable.assertNotDisposable();
  }

  public reset(): void {
    this.bagRow.reset();
    this.backItemRow.reset();
    this.frontItemRow.reset();
  }

  public containsBag( bag: Bag ): boolean {
    return this.bagRow.contains( bag );
  }

  public containsItem( item: ShoppingItem ): boolean {
    return ( this.backItemRow.contains( item ) || this.frontItemRow.contains( item ) );
  }

  /**
   * Removes a bag.
   */
  public removeBag( bag: Bag ): void {
    assert && assert( this.containsBag( bag ), 'does not contain bag' );
    this.bagRow.remove( bag );

    // Make the bag move up a few pixels, to make it obvious that it has been removed.
    // See https://github.com/phetsims/unit-rates/issues/187
    bag.moveTo( bag.positionProperty.value.plusXY( 0, -5 ) );
  }

  /**
   * Removes an item.
   */
  public removeItem( item: ShoppingItem ): void {
    assert && assert( this.containsItem( item ), 'does not contain item' );

    if ( this.backItemRow.contains( item ) ) {
      this.backItemRow.remove( item );
    }
    else {
      this.frontItemRow.remove( item );
    }

    // Make the item move up a few pixels, to make it obvious that it has been removed.
    // See https://github.com/phetsims/unit-rates/issues/187
    item.moveTo( item.positionProperty.value.plusXY( 0, -5 ) );
  }

  /**
   * Is the specific item in the front row?
   */
  public isItemInFrontRow( item: ShoppingItem ): boolean {
    return this.frontItemRow.contains( item );
  }
}

unitRates.register( 'ShoppingContainer', ShoppingContainer );