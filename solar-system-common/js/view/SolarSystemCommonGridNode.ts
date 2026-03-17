// Copyright 2023-2025, University of Colorado Boulder

/**
 * GridNode used in My Solar System and Kepler's Laws,
 * it supports the option of adding bolder axes lines.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';

const STROKE_PROPERTY = SolarSystemCommonColors.gridIconStrokeColorProperty;
const GRID_NODE_LINE_WIDTH = 0.5;
const ORIGIN_AXES_LINE_WIDTH = 2;

type SelfOptions = {
  boldOriginAxes?: boolean; // Adds a thicker grid line at the origin x=0 and y=0
};

type SolarSystemCommonGridNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem' | 'visibleProperty'>;

export default class SolarSystemCommonGridNode extends Node {

  public constructor(
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    spacing: number,
    center: Vector2,
    numberOfGridLines: number,
    providedOptions?: SolarSystemCommonGridNodeOptions ) {

    const options = optionize<SolarSystemCommonGridNodeOptions, SelfOptions, NodeOptions>()( {
      // SelfOptions
      boldOriginAxes: false
    }, providedOptions );

    // The primary grid lines
    const gridNode = new GridNode( transformProperty, spacing, center, numberOfGridLines, {
      lineWidth: GRID_NODE_LINE_WIDTH,
      stroke: STROKE_PROPERTY
    } );

    // Additional lines for the origin axes
    if ( options.boldOriginAxes ) {
      const originAxesNode = new Path( null, {
        lineWidth: ORIGIN_AXES_LINE_WIDTH,
        stroke: STROKE_PROPERTY
      } );
      transformProperty.link( ( transform: ModelViewTransform2 ) => {
        const shape = new Shape();

        const axisLength = numberOfGridLines * spacing;
        shape.moveTo( center.x - axisLength, center.y ).lineTo( center.x + axisLength, center.y ); // horizontal line
        shape.moveTo( center.x, center.y - axisLength ).lineTo( center.x, center.y + axisLength ); // vertical line

        originAxesNode.shape = transform.modelToViewShape( shape );
      } );

      options.children = [ gridNode, originAxesNode ];
    }
    else {
      options.children = [ gridNode ];
    }

    super( options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonGridNode', SolarSystemCommonGridNode );