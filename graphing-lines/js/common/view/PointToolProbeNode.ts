// Copyright 2021-2025, University of Colorado Boulder

/**
 * PointToolProbeNode is the probe for the point tool. It's a triangle that points down, described from the upper-left.
 * Origin is at the upper-left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path, { PathOptions } from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import graphingLines from '../../graphingLines.js';
import GLColors from '../GLColors.js';

type SelfOptions = {
  size?: Dimension2;
};

type PointToolProbeNodeOptions = SelfOptions & NodeTranslationOptions & PickOptional<PathOptions, 'pickable'>;

export default class PointToolProbeNode extends Path {

  public constructor( providedOptions?: PointToolProbeNodeOptions ) {

    const options = optionize<PointToolProbeNodeOptions, SelfOptions, PathOptions>()( {

      // SelfOptions
      size: new Dimension2( 18, 21 ),

      // PathOptions
      fill: GLColors.pointToolColorProperty,
      stroke: Color.grayColor( 135 )
    }, providedOptions );

    const triangleShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( options.size.width, 0 )
      .lineTo( options.size.width / 2, options.size.height )
      .close();

    super( triangleShape, options );
  }
}

graphingLines.register( 'PointToolProbeNode', PointToolProbeNode );