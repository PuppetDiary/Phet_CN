// Copyright 2023-2025, University of Colorado Boulder

/**
 * Render the paths and projectiles for the Variability, Sources and Measures screens of Projectile Data Lab.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import cannonball_png from '../../../images/cannonball_png.js';
import cannonballLanded_png from '../../../images/cannonballLanded_png.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLCanvasNode, { PDLCanvasNodeOptions } from '../../common/view/PDLCanvasNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import SamplingField from '../model/SamplingField.js';

type SelfOptions = EmptySelfOptions;
type SamplingCanvasNodeOptions = SelfOptions & PDLCanvasNodeOptions;

export default class SamplingCanvasNode extends PDLCanvasNode<SamplingField> {
  public constructor( fieldProperty: Property<SamplingField>,
                      isPathsVisibleProperty: Property<boolean>,
                      modelViewTransform: ModelViewTransform2,
                      selectedSampleNumberProperty: TReadOnlyProperty<number>,
                      providedOptions: SamplingCanvasNodeOptions ) {

    const options = optionize<SamplingCanvasNodeOptions, SelfOptions, PDLCanvasNodeOptions>()( {}, providedOptions );

    super( fieldProperty, isPathsVisibleProperty, modelViewTransform, selectedSampleNumberProperty, options );
  }

  public override paintCanvas( context: CanvasRenderingContext2D ): void {

    // Order of drawing:
    // 1. Force field graphics for outliers
    // 2: Paths
    // 3: Projectiles

    const field = this.fieldProperty.value;
    const phase = field.phaseProperty.value;
    const isShowingLatestSample = field.selectedSampleNumberProperty.value === field.numberOfStartedSamplesProperty.value;

    const projectiles = field.getProjectilesInSelectedSample();
    const landedProjectiles = field.getLandedProjectilesInSelectedSample();

    // 1. Force field graphics for landed outliers are drawn in PDLCanvasNode
    super.drawOutlierGraphicsForLandedProjectiles( projectiles, context );

    // 2. Paths
    if ( isShowingLatestSample ) {
      context.lineWidth = 1;

      for ( let i = 0; i < projectiles.length; i++ ) {
        const isAirborne = !landedProjectiles.includes( projectiles[ i ] );
        const showHighlightedPath = phase === 'showingAirborneProjectiles' && isAirborne;

        const pathStrokeColorProperty = showHighlightedPath ? PDLColors.pathAirborneStrokeProperty : PDLColors.pathSamplingStrokeProperty;
        context.strokeStyle = pathStrokeColorProperty.value.toCSS();
        this.drawPathForProjectile( context, projectiles[ i ] );
      }
    }

    // 3. Projectiles
    for ( let i = 0; i < projectiles.length; i++ ) {
      const projectile = projectiles[ i ];

      const viewPoint = this.modelViewTransform.modelToViewXY( projectile.x, projectile.y );
      const image = phase === 'showingCompleteSampleWithMean' ? cannonballLanded_png : cannonball_png;

      context.save();

      // Move to the center of where we want to draw our image, similar to code in PDLCanvasNode
      context.translate( viewPoint.x, viewPoint.y );
      context.scale( PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR, PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR );
      context.drawImage( image, -image.width / 2, -image.height / 2 );

      context.restore();
    }
  }
}

projectileDataLab.register( 'SamplingCanvasNode', SamplingCanvasNode );