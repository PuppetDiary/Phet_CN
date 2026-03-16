// Copyright 2023-2025, University of Colorado Boulder

/**
 * Utilities used throughout this simulation.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Color from '../../../scenery/js/util/Color.js';
import { VSMFieldIdentifierValues } from '../common-vsm/model/VSMFieldIdentifier.js';
import projectileDataLab from '../projectileDataLab.js';
import { SAMPLE_SIZES } from '../sampling/model/SamplingModel.js';
import PDLColors from './PDLColors.js';
import PDLConstants from './PDLConstants.js';

export default class PDLUtils {

  // This method is used to transform the field to create a perspective effect,
  // where the parts of the field that are further away appear smaller.
  public static transformField( point: Vector2 ): Vector2 {
    const pointY = point.y + PDLConstants.FIELD_SCALING_FACTOR_VERTICAL * Math.abs( point.y );
    const horizontalDistanceFactor = point.x / ( 0.5 * PDLConstants.FIELD_WIDTH );
    const verticalDistanceFactor = pointY / ( 0.5 * PDLConstants.FIELD_HEIGHT );
    return new Vector2(
      point.x + PDLConstants.FIELD_SCALING_FACTOR_HORIZONTAL * horizontalDistanceFactor * verticalDistanceFactor,
      pointY );
  }

  // This method is used to determine the fill color of the field based on the index of the field in the array of fields.
  public static colorForFieldIndex( index: number ): Color {
    return PDLColors.fieldLightFillProperty.value.blend(
      PDLColors.fieldDarkFillProperty.value, index / ( VSMFieldIdentifierValues.length - 1 ) );
  }

  // This method is used to determine the fill color of the field based on the sample size.
  public static colorForSampleSize( sampleSize: number ): Color {
    const index = SAMPLE_SIZES.indexOf( sampleSize );

    return PDLColors.fieldLightFillProperty.value.blend(
      PDLColors.fieldDarkFillProperty.value, index / ( SAMPLE_SIZES.length - 1 ) );
  }
}
projectileDataLab.register( 'PDLUtils', PDLUtils );