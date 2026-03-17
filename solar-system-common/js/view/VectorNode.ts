// Copyright 2023-2025, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a gravity force vector or velocity vector.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode, { ArrowNodeOptions } from '../../../scenery-phet/js/ArrowNode.js';
import Body from '../model/Body.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = {
  // Normalization factor by which the vector will be scaled
  baseMagnitude?: number;

  // Power by which the scaling is offset. i.e. 2 means the vector will be originally scaled by 10^2
  scalingOffset?: number;
};

export type VectorNodeOptions = SelfOptions & ArrowNodeOptions;

export default class VectorNode extends ArrowNode {

  protected readonly tipPositionProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailPositionProperty: TReadOnlyProperty<Vector2>;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    vectorScalePowerProperty: TReadOnlyProperty<number>,
    providedOptions?: VectorNodeOptions
  ) {

    const options = optionize<VectorNodeOptions, SelfOptions, ArrowNodeOptions>()( {

      // SelfOptions
      baseMagnitude: 1500,
      scalingOffset: 0,

      // ArrowNodeOptions
      isDisposable: false, // see https://github.com/phetsims/my-solar-system/issues/230
      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true
    }, providedOptions );

    super( 0, 0, 0, 0, options );

    this.tailPositionProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    this.tipPositionProperty = new DerivedProperty( [ this.tailPositionProperty, vectorProperty, transformProperty, vectorScalePowerProperty ],
      ( tail, vector, transform, vectorScalePower ) => {
        const finalTip = vector.times( Math.pow( 10, vectorScalePower + options.scalingOffset ) );
        if ( finalTip.magnitude > 1e4 ) {
          finalTip.setMagnitude( 1e4 );
        }

        // Scaling the tip position for it to properly fit in the view
        finalTip.multiplyScalar( SolarSystemCommonConstants.VELOCITY_TO_VIEW_MULTIPLIER );
        const finalPosition = transform.modelToViewDelta( finalTip ).plus( tail );
        return finalPosition;
      } );

    Multilink.multilink( [ this.tailPositionProperty, this.tipPositionProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
      this.localBounds = Bounds2.point( tail ).addPoint( tip ).dilated( 10 ); // must set because boundsMethod: 'none'.
    } );

    this.addLinkedElement( body, {
      tandemName: 'body' // so that all VectorNode elements have the same linked element name
    } );
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );