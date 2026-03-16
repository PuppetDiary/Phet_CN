// Copyright 2023-2024, University of Colorado Boulder

/**
 * Render the paths and projectiles for the Variability, Sources and Measures screens of Projectile Data Lab.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Projectile from '../../common/model/Projectile.js';
import PDLColors from '../../common/PDLColors.js';
import PDLCanvasNode, { PDLCanvasNodeOptions } from '../../common/view/PDLCanvasNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import VSMField from '../model/VSMField.js';

type SelfOptions = EmptySelfOptions;
type VSMCanvasNodeOptions = SelfOptions & PDLCanvasNodeOptions;

export default class VSMCanvasNode<T extends VSMField> extends PDLCanvasNode<T> {
  public constructor( fieldProperty: Property<T>, isPathsVisibleProperty: Property<boolean>,
                      modelViewTransform: ModelViewTransform2,
                      providedOptions: VSMCanvasNodeOptions ) {

    const options = optionize<VSMCanvasNodeOptions, SelfOptions, PDLCanvasNodeOptions>()( {}, providedOptions );

    super( fieldProperty, isPathsVisibleProperty, modelViewTransform, null, options );
  }

  public override paintCanvas( context: CanvasRenderingContext2D ): void {

    // Order of drawing:
    // 1. Force field graphics for landed outliers
    // 2: Paths for landed projectile that are not the most recent (if paths are visible)
    // 3: Landed projectiles that are not the most recent
    // 4: Path for most recent landed projectile (if paths are visible)
    // 5: Paths for flying projectiles (if paths are visible)
    // 6: Flying projectiles
    // 7: Most recent landed projectile

    const landedProjectiles = this.fieldProperty.value.landedProjectiles;
    const airborneProjectiles = this.fieldProperty.value.airborneProjectiles;
    const highlightedProjectile: Projectile | null = this.fieldProperty.value.selectedProjectileProperty.value;

    // 1. Force field graphics for landed outliers are drawn in PDLCanvasNode
    super.drawOutlierGraphicsForLandedProjectiles( landedProjectiles, context );

    // 2: Paths for landed projectile that are not the most recent (if paths are visible)
    if ( this.isPathsVisibleProperty.value ) {
      context.lineWidth = 1;

      // Set the path color to be a blend of the initial and final colors, based on the number of projectiles that have landed
      // This is to avoid the landed paths from becoming too dark when overlapping
      const numLandedProjectiles = landedProjectiles.length;

      // This is the minimum number of projectiles that will cause the path color to be the final color
      const PROJECTILES_FOR_FINAL_STROKE_COLOR = 300;

      const colorRatio = Math.min( numLandedProjectiles / PROJECTILES_FOR_FINAL_STROKE_COLOR, 1 );
      const pathColor = PDLColors.pathLandedInitialStrokeProperty.value.blend( PDLColors.pathLandedFinalStrokeProperty.value, colorRatio );
      context.strokeStyle = pathColor.toCSS();

      landedProjectiles.forEach( projectile => {
        if ( projectile !== highlightedProjectile ) {
          this.drawPathForProjectile( context, projectile );
        }
      } );
    }

    // 3: Landed projectiles that are not the most recent
    landedProjectiles.forEach( projectile => {
      if ( projectile !== highlightedProjectile ) {
        this.drawProjectile( context, projectile, true, false );
      }
    } );

    // 4: Path for most recent landed projectile (if paths are visible)
    if ( this.isPathsVisibleProperty.value && highlightedProjectile ) {
      context.strokeStyle = PDLColors.pathHighlightedStrokeProperty.value.toCSS();
      this.drawPathForProjectile( context, highlightedProjectile );
    }

    // 5: Paths for flying projectiles (if paths are visible)
    if ( this.isPathsVisibleProperty.value ) {
      context.strokeStyle = PDLColors.pathAirborneStrokeProperty.value.toCSS();
      airborneProjectiles.forEach( projectile => {
        this.drawPathForProjectile( context, projectile );
      } );
    }

    // 6: Flying projectiles
    for ( let i = 0; i < airborneProjectiles.length; i++ ) {
      this.drawProjectile( context, airborneProjectiles[ i ], false, false );
    }

    // 7: Most recent landed projectile
    if ( highlightedProjectile ) {
      this.drawProjectile( context, highlightedProjectile, true, true );
    }
  }
}

projectileDataLab.register( 'VSMCanvasNode', VSMCanvasNode );