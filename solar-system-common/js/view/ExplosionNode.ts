// Copyright 2023-2025, University of Colorado Boulder

/**
 *
 * A star shaped node that represents an explosion.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import { NodeTranslationOptions } from '../../../scenery/js/nodes/Node.js';
import Path, { PathOptions } from '../../../scenery/js/nodes/Path.js';
import Animation from '../../../twixt/js/Animation.js';
import Easing from '../../../twixt/js/Easing.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import BodyNode from './BodyNode.js';

type SelfOptions = EmptySelfOptions;
type ExplosionNodeOptions = SelfOptions & NodeTranslationOptions;

export default class ExplosionNode extends Path {

  public constructor( providedOptions?: ExplosionNodeOptions ) {

    const options = optionize<ExplosionNodeOptions, SelfOptions, PathOptions>()( {

      // PathOptions
      fill: SolarSystemCommonColors.explosionColorProperty
    }, providedOptions );

    const radius = 40;
    const numSegments = 14;

    const shape = new Shape();
    shape.moveTo( 0, 0 );
    for ( let i = 0; i < numSegments + 1; i++ ) {
      shape.lineToPoint( Vector2.createPolar( ( i % 2 === 0 ) ? radius * 2 : radius, i * Math.PI * 2 / numSegments ) );
    }
    shape.close();

    super( shape, options );
  }

  public static explode( node: BodyNode ): void {

    const explosionPath = new ExplosionNode( {
      center: node.translation
    } );

    node.parents[ 0 ].addChild( explosionPath );

    const startingRadius = 0.1;
    const maximumRadius = 1;

    // Not necessary to instrument for PhET-iO.
    const scaleProperty = new NumberProperty( startingRadius );

    scaleProperty.link( scale => explosionPath.setScaleMagnitude( scale ) );

    const duration = 0.16;
    const firstAnimation = new Animation( {
      property: scaleProperty,
      to: maximumRadius,
      duration: duration,
      easing: Easing.QUADRATIC_OUT
    } );
    const secondAnimation = new Animation( {
      property: scaleProperty,
      to: startingRadius,
      duration: duration,
      easing: Easing.QUADRATIC_IN
    } );

    firstAnimation.then( secondAnimation );
    firstAnimation.start();
    secondAnimation.finishEmitter.addListener( () => {
      explosionPath.detach();
    } );
  }
}

solarSystemCommon.register( 'ExplosionNode', ExplosionNode );