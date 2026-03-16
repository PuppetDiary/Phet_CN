// Copyright 2023-2025, University of Colorado Boulder

/**
 * The LauncherFlashNode is the visual representation of the flash that occurs when the launcher is fired.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
type LauncherFlashNodeOptions = SelfOptions & NodeOptions;

export default class LauncherFlashNode extends Node {

  public constructor( providedOptions: LauncherFlashNodeOptions ) {

    // the flames are the shape of tear drops
    const tearDropShapeStrength = 3;
    const flameShape = new Shape();
    const radius = 5; // in view coordinates
    flameShape.moveTo( -radius, 0 );
    let t;
    for ( t = Math.PI / 24; t < 2 * Math.PI; t += Math.PI / 24 ) {
      const x = Math.cos( t ) * radius;
      const y = Math.sin( t ) * Math.pow( Math.sin( 0.5 * t ), tearDropShapeStrength ) * radius;
      flameShape.lineTo( x, y );
    }
    flameShape.lineTo( -radius, 0 );

    // create paths based on shape
    const outerFlame = new Path( flameShape, { fill: 'rgb( 255, 255, 0 )', stroke: null } );
    const innerFlame = new Path( flameShape, { fill: 'rgb( 255, 200, 0 )', stroke: null } );
    innerFlame.setScaleMagnitude( 0.7 );
    outerFlame.left = 0;
    innerFlame.left = 0;
    const options = optionize<LauncherFlashNodeOptions, SelfOptions, NodeOptions>()( {
      children: [ outerFlame, innerFlame ]
    }, providedOptions );
    super( options );
  }
}

projectileDataLab.register( 'LauncherFlashNode', LauncherFlashNode );