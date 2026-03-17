// Copyright 2013-2025, University of Colorado Boulder

/**
 * Manipulator for changing a line's (x2,y2) point.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../../dot/js/Range.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import Line from '../../model/Line.js';
import Manipulator from './Manipulator.js';
import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import { clamp } from '../../../../../dot/js/util/clamp.js';
import SoundDragListener from '../../../../../scenery-phet/js/SoundDragListener.js';

export default class X2Y2Manipulator extends Manipulator {

  private readonly disposeX2Y2Manipulator: () => void;

  public constructor( radius: number,
                      lineProperty: Property<Line>,
                      x2RangeProperty: TReadOnlyProperty<Range>,
                      y2RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    super( radius, GLColors.pointX2Y2ColorProperty, { haloAlpha: GLColors.HALO_ALPHA.x2y2 } );

    // move the manipulator to match the line's (x2,y2) point
    const lineObserver = ( line: Line ) => {
      this.translation = modelViewTransform.modelToViewPosition( new Vector2( line.x2, line.y2 ) );
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    const dragListener = new X2Y2DragListener( this, lineProperty, x2RangeProperty, y2RangeProperty, modelViewTransform );
    this.addInputListener( dragListener );

    this.disposeX2Y2Manipulator = () => {
      lineProperty.unlink( lineObserver );
      dragListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeX2Y2Manipulator();
    super.dispose();
  }
}

/**
 * Drag listener for (x2,y2) manipulator.
 */
class X2Y2DragListener extends SoundDragListener {

  public constructor( targetNode: Node,
                      lineProperty: Property<Line>,
                      x2RangeProperty: TReadOnlyProperty<Range>,
                      y2RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    let startOffset: Vector2; // where the drag started, relative to (x2,y2), in parent view coordinates

    super( {

      // note where the drag started
      start: event => {
        const line = lineProperty.value;
        const position = modelViewTransform.modelToViewXY( line.x2, line.y2 );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: event => {

        const line = lineProperty.value;
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to range, snap to grid
        const x2 = roundSymmetric( clamp( position.x, x2RangeProperty.value.min, x2RangeProperty.value.max ) );
        const y2 = roundSymmetric( clamp( position.y, y2RangeProperty.value.min, y2RangeProperty.value.max ) );

        if ( x2 !== line.x1 || y2 !== line.y1 ) {
          // Don't allow points to be the same, this would result in slope=0/0 (undefined line.)
          // Keep (x1,y1) constant, change (x2,y2) and slope.
          lineProperty.value = new Line( line.x1, line.y1, x2, y2, line.color );
        }
      }
    } );
  }
}

graphingLines.register( 'X2Y2Manipulator', X2Y2Manipulator );