// Copyright 2017-2024, University of Colorado Boulder

/**
 * RowOfMovables manages a row of URMovables (movable model elements).
 * Used to manage the position of bags and items on the scale and shelf.
 *
 * - Each row has N cells.
 * - Cells are indexed from left to right.
 * - At most 1 movable can occupy a cell.
 * - A movable cannot occupy more than 1 cell.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import URMovable from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';

type Cell = {
  movable: URMovable | null; // the URMovable that occupies cell, null if the cell is unoccupied
  position: Vector2;
};

type SelfOptions = {
  position?: Vector2; // bottom center of the row
  numberOfCells?:number; // number of cells in the row
  cellSize?: Dimension2; // dimensions of each cell
  cellSpacing?: number; // horizontal space between cells
};

type RowOfMovablesOptions = SelfOptions;

export default class RowOfMovables {

  public readonly position?: Vector2;
  public readonly cellSize: Dimension2;
  public readonly cells: Cell[]; // the container's cells
  public readonly numberOfMovablesProperty: NumberProperty; // number of movables in the row (number of occupied cells)

  public constructor( providedOptions?: RowOfMovablesOptions ) {

    const options = optionize<RowOfMovablesOptions, SelfOptions>()( {

      // SelfOptions
      position: new Vector2( 0, 0 ),
      numberOfCells: 4,
      cellSize: new Dimension2( 100, 100 ),
      cellSpacing: 0
    }, providedOptions );

    this.position = options.position;
    this.cellSize = options.cellSize;

    this.cells = createCells( options.numberOfCells, options.position, options.cellSize, options.cellSpacing );

    this.numberOfMovablesProperty = new NumberProperty( 0, {
      numberType: 'Integer'
    } );
  }

  public reset(): void {

    // empty all cells
    this.cells.forEach( cell => {
      cell.movable = null;
    } );
    this.numberOfMovablesProperty.reset();
  }

  /**
   * Gets the index of the first unoccupied cell. Cells are visited left to right.
   * @returns cell index, -1 if all cells are occupied
   */
  public getFirstUnoccupiedCell(): number {
    let index = -1;
    for ( let i = 0; i < this.cells.length; i++ ) {
      if ( this.isEmptyCell( i ) ) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Gets the index of the closest unoccupied cell.
   * @param position
   * @returns cell index, -1 if all cells are occupied
   */
  public getClosestUnoccupiedCell( position: Vector2 ): number {
    let index = this.getFirstUnoccupiedCell();
    if ( index !== -1 ) {
      for ( let i = index + 1; i < this.cells.length; i++ ) {
        if ( this.isEmptyCell( i ) ) {
          if ( this.getDistanceFromCell( i, position ) < this.getDistanceFromCell( index, position ) ) {
            index = i;
          }
          else {
            break;
          }
        }
      }
    }
    return index;
  }

  /**
   * Puts a movable in the specified cell.
   * The cell must be empty, and the movable cannot occupy more than 1 cell.
   */
  public put( movable: URMovable, index: number ): void {

    assert && assert( !this.contains( movable ),
      `movable is already in row at index ${this.indexOf( movable )}` );
    assert && assert( this.isValidCellIndex( index ), `invalid index: ${index}` );
    assert && assert( this.isEmptyCell( index ), `cell is occupied: ${index}` );

    // put in cell
    this.cells[ index ].movable = movable;
    this.numberOfMovablesProperty.value++;

    // move immediately to cell
    movable.moveTo( this.getCellPosition( index ) );
  }

  /**
   * Removes a movable from the container.
   */
  public remove( movable: URMovable ): void {
    const index = this.indexOf( movable );
    assert && assert( this.isValidCellIndex( index ), `invalid index: ${index}` );
    this.cells[ index ].movable = null;
    this.numberOfMovablesProperty.value--;
  }

  /**
   * Does the row contain a specified movable?
   */
  public contains( movable: URMovable ): boolean {
    return ( this.indexOf( movable ) !== -1 );
  }

  /**
   * Is the specified cell empty?
   */
  public isEmptyCell( index: number ): boolean {
    assert && assert( this.isValidCellIndex( index ), `invalid index: ${index}` );
    return ( this.cells[ index ].movable === null );
  }

  /**
   * Gets the position of a cell.
   */
  public getCellPosition( index: number ): Vector2 {
    assert && assert( this.isValidCellIndex( index ), `invalid index: ${index}` );
    return this.cells[ index ].position;
  }

  /**
   * Gets the number of cells in the row.
   */
  public getNumberOfCells(): number {
    return this.cells.length;
  }

  /**
   * Gets the index of the cell that is occupied by a specified movable.
   * @param movable
   * @returns -1 if the movable is not found
   */
  private indexOf( movable: URMovable ): number {
    let index = -1;
    for ( let i = 0; i < this.cells.length; i++ ) {
      if ( this.cells[ i ].movable === movable ) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Gets the distance between a cell and a position.
   */
  private getDistanceFromCell( index: number, position: Vector2 ): number {
    assert && assert( this.isValidCellIndex( index ), `invalid index: ${index}` );
    return this.getCellPosition( index ).distance( position );
  }

  /**
   * Is the cell index valid?
   */
  private isValidCellIndex( index: number ): boolean {
    return ( Number.isInteger( index ) && index >= 0 && index < this.cells.length );
  }
}

/**
 * Creates a row of empty cells.
 * @param numberOfCells
 * @param position - bottom center of the row
 * @param cellSize
 * @param cellSpacing
 */
function createCells( numberOfCells: number, position: Vector2, cellSize: Dimension2, cellSpacing: number ): Cell[] {

  // distance between the centers of adjacent cells
  const deltaX = cellSize.width + cellSpacing;

  // distance between the centers of the left-most and right-most cells
  const leftToRightDistance = deltaX * ( numberOfCells - 1 );

  // center of the first (left-most) cell
  const firstCenterX = position.x - ( leftToRightDistance / 2 );

  // Each cell contains a data structure with this format:
  // {URMovable|null} movable - the movable that occupies the cell, null if the cell is empty
  // {Vector} position - bottom center of the cell
  const cells = [];
  for ( let i = 0; i < numberOfCells; i++ ) {
    cells.push( {
      movable: null,
      position: new Vector2( firstCenterX + ( i * deltaX ), position.y )
    } );
  }

  return cells;
}

unitRates.register( 'RowOfMovables', RowOfMovables );