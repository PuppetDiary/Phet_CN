// Copyright 2023-2025, University of Colorado Boulder

/**
 * CueingArrowsNode is the cueing arrows used to indicate that something can be dragged in some direction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import ArrowShape from '../../../scenery-phet/js/ArrowShape.js';
import { NodeTranslationOptions } from '../../../scenery/js/nodes/Node.js';
import Path, { PathOptions } from '../../../scenery/js/nodes/Path.js';
import solarSystemCommon from '../solarSystemCommon.js';

type SelfOptions = {
  length?: number;
  bodyRadius?: number;
};

type CueingArrowsNodeOptions = SelfOptions &
  PickOptional<PathOptions, 'fill' | 'stroke' | 'scale' | 'visibleProperty'> &
  NodeTranslationOptions;

export default class CueingArrowsNode extends Path {

  public constructor( providedOptions?: CueingArrowsNodeOptions ) {

    const options = optionize<CueingArrowsNodeOptions, SelfOptions, PathOptions>()( {

      // CueingArrowsNodeOptions
      bodyRadius: 10,
      length: 15,
      rotation: Math.PI / 4,

      // PathOptions
      fill: 'rgb( 0, 200, 0 )',
      stroke: 'black'

    }, providedOptions );

    super( createArrowsShape( options.bodyRadius + 5, options.length ), options );

    this.localBoundsProperty.link( localBounds => {
      this.touchArea = localBounds.dilated( 5 );
      this.mouseArea = localBounds.dilated( 3 );
    } );
  }
}

const ARROW_SHAPE_OPTIONS = {
  doubleHead: false,
  headWidth: 12,
  headHeight: 8,
  tailWidth: 3
};

/**
 * Creates the Shape for the cueing arrows.
 * @param spacing - spacing between the tails of the arrows
 * @param length - length of each arrow
 */
function createArrowsShape( spacing: number, length: number ): Shape {
  const leftArrowShape = new ArrowShape( -spacing, 0, -spacing - length, 0, ARROW_SHAPE_OPTIONS );
  const downArrowShape = new ArrowShape( 0, -spacing, 0, -spacing - length, ARROW_SHAPE_OPTIONS );
  const upArrowShape = new ArrowShape( 0, spacing, 0, spacing + length, ARROW_SHAPE_OPTIONS );
  const rightArrowShape = new ArrowShape( spacing, 0, spacing + length, 0, ARROW_SHAPE_OPTIONS );
  return Shape.union( [ leftArrowShape, downArrowShape, upArrowShape, rightArrowShape ] );
}

solarSystemCommon.register( 'CueingArrowsNode', CueingArrowsNode );