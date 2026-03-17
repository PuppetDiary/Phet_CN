// Copyright 2017-2026, University of Colorado Boulder

/**
 * Grid lines for proportional areas.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

// constants
const GRID_LINE_WIDTH = 0.5;
const HALF_GRID_LINE_WIDTH = GRID_LINE_WIDTH / 2;

class ProportionalAreaGridLinesNode extends Path {
  /**
   * @param {Property.<ProportionalArea>} areaProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   */
  constructor( areaProperty, modelViewTransformProperty ) {

    const shapeProperty = new DerivedProperty( [ areaProperty, modelViewTransformProperty ], ( area, modelViewTransform ) => {
      const maxX = modelViewTransform.modelToViewX( area.maximumSize );
      const maxY = modelViewTransform.modelToViewY( area.maximumSize );

      const shape = new Shape();
      for ( let i = area.gridSpacing; i < area.maximumSize; i += area.gridSpacing ) {
        const x = modelViewTransform.modelToViewX( i );
        const y = modelViewTransform.modelToViewY( i );

        shape.moveTo( HALF_GRID_LINE_WIDTH, y );
        shape.lineTo( maxX - HALF_GRID_LINE_WIDTH, y );

        shape.moveTo( x, HALF_GRID_LINE_WIDTH );
        shape.lineTo( x, maxY - HALF_GRID_LINE_WIDTH );
      }
      return shape;
    } );

    super( shapeProperty, {
      stroke: AreaModelCommonColors.gridLineProperty
    } );
  }
}

areaModelCommon.register( 'ProportionalAreaGridLinesNode', ProportionalAreaGridLinesNode );

export default ProportionalAreaGridLinesNode;