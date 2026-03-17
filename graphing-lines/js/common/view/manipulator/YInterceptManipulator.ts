// Copyright 2013-2025, University of Colorado Boulder

/**
 * Manipulator for changing a line's y-intercept.
 * This manipulates (x1,y1), keeping x1 constrained to zero, and effectively dragging along the y-axis.
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
import { clamp } from '../../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import SoundDragListener from '../../../../../scenery-phet/js/SoundDragListener.js';

export default class YInterceptManipulator extends Manipulator {

  private readonly disposeYInterceptManipulator: () => void;

  public constructor( radius: number,
                      lineProperty: Property<Line>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    super( radius, GLColors.interceptColorProperty, { haloAlpha: GLColors.HALO_ALPHA.intercept } );

    // move the manipulator to match the line's (x1,y1) point
    const lineObserver = ( line: Line ) => {
      this.translation = modelViewTransform.modelToViewPosition( new Vector2( line.x1, line.y1 ) );
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    const dragListener = new YInterceptDragListener( this, lineProperty, y1RangeProperty, modelViewTransform );
    this.addInputListener( dragListener );

    this.disposeYInterceptManipulator = () => {
      lineProperty.unlink( lineObserver );
      dragListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeYInterceptManipulator();
    super.dispose();
  }
}

/**
 * Drag listener for y-intercept manipulator.
 */
class YInterceptDragListener extends SoundDragListener {

  public constructor( targetNode: Node,
                      lineProperty: Property<Line>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    let startOffset: Vector2; // where the drag started, relative to the y-intercept, in parent view coordinates

    super( {

      // note where the drag started
      start: event => {
        const line = lineProperty.value;
        const position = modelViewTransform.modelToViewXY( line.x1, line.y1 );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: event => {

        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to range, snap to grid
        const y1 = roundSymmetric( clamp( position.y, y1RangeProperty.value.min, y1RangeProperty.value.max ) );
        const line = lineProperty.value;

        // Keep slope constant, change y1.
        lineProperty.value = Line.createSlopeIntercept( line.rise, line.run, y1, line.color );
      }
    } );
  }
}

graphingLines.register( 'YInterceptManipulator', YInterceptManipulator );