// Copyright 2017-2025, University of Colorado Boulder

/**
 * Used for debugging purposes to see the cells in each RowOfMovable instance.
 * See URQueryParameters.showCells.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import TPaint from '../../../../scenery/js/util/TPaint.js';
import unitRates from '../../unitRates.js';
import RowOfMovables from '../model/RowOfMovables.js';

export default class RowOfMovablesNode extends Path {

  public constructor( rowOfMovables: RowOfMovables, stroke: TPaint ) {

    const cellWidth = rowOfMovables.cellSize.width;
    const cellHeight = rowOfMovables.cellSize.height;

    // add a rectangle for each cell
    const shape = new Shape();
    rowOfMovables.cells.forEach( cell => {
      const x = cell.position.x - ( cellWidth / 2 );
      const y = cell.position.y - cellHeight;
      shape.rect( x, y, cellWidth, cellHeight );
    } );

    super( shape, {
      stroke: stroke
    } );
  }
}

unitRates.register( 'RowOfMovablesNode', RowOfMovablesNode );