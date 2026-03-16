// Copyright 2023-2025, University of Colorado Boulder

/**
 * Render the paths and projectiles for the Projectile Data Lab.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode, { CanvasNodeOptions } from '../../../../scenery/js/nodes/CanvasNode.js';
import cannonball_png from '../../../images/cannonball_png.js';
import cannonballLanded_png from '../../../images/cannonballLanded_png.js';
import cannonballLandedSelected_png from '../../../images/cannonballLandedSelected_png.js';
import forceField_png from '../../../images/forceField_png.js';
import piano_png from '../../../images/piano_png.js';
import pianoLanded_png from '../../../images/pianoLanded_png.js';
import pianoLandedSelected_png from '../../../images/pianoLandedSelected_png.js';
import pumpkin1Landed_png from '../../../images/pumpkin1Landed_png.js';
import pumpkin1LandedSelected_png from '../../../images/pumpkin1LandedSelected_png.js';
import pumpkin2Landed_png from '../../../images/pumpkin2Landed_png.js';
import pumpkin2LandedSelected_png from '../../../images/pumpkin2LandedSelected_png.js';
import pumpkin3Landed_png from '../../../images/pumpkin3Landed_png.js';
import pumpkin3LandedSelected_png from '../../../images/pumpkin3LandedSelected_png.js';
import pumpkin_png from '../../../images/pumpkin_png.js';
import projectileDataLab from '../../projectileDataLab.js';
import Field from '../model/Field.js';
import Projectile from '../model/Projectile.js';
import { PIANO, PUMPKIN } from '../model/ProjectileType.js';
import PDLColors from '../PDLColors.js';
import PDLConstants from '../PDLConstants.js';

type SelfOptions = EmptySelfOptions;
export type PDLCanvasNodeOptions = SelfOptions & CanvasNodeOptions;

const PUMPKIN_LANDED_IMAGES = [ pumpkin1Landed_png, pumpkin2Landed_png, pumpkin3Landed_png ];
const PUMPKIN_LANDED_SELECTED_IMAGES = [ pumpkin1LandedSelected_png, pumpkin2LandedSelected_png, pumpkin3LandedSelected_png ];

export default abstract class PDLCanvasNode<T extends Field> extends CanvasNode {
  protected constructor(
    protected readonly fieldProperty: Property<T>,
    protected readonly isPathsVisibleProperty: Property<boolean>,
    protected readonly modelViewTransform: ModelViewTransform2,
    selectedSampleNumberProperty: TReadOnlyProperty<number> | null,
    providedOptions: PDLCanvasNodeOptions ) {

    const options = optionize<PDLCanvasNodeOptions, SelfOptions, CanvasNodeOptions>()( {
      layerSplit: true // ensure we're on our own layer
    }, providedOptions );

    super( options );

    this.fieldProperty = fieldProperty;

    const myBoundListener = () => this.invalidatePaint();
    this.fieldProperty.link( ( newField, oldField ) => {
      if ( oldField ) {
        oldField.projectilesChangedEmitter.removeListener( myBoundListener );
      }
      newField.projectilesChangedEmitter.addListener( myBoundListener );
      this.invalidatePaint();
    } );

    // When any of the path colors change, repaint
    PDLColors.pathAirborneStrokeProperty.link( myBoundListener );
    PDLColors.pathLandedInitialStrokeProperty.link( myBoundListener );
    PDLColors.pathLandedFinalStrokeProperty.link( myBoundListener );
    PDLColors.pathHighlightedStrokeProperty.link( myBoundListener );

    // When the path visibility changes or the selected sample changes, repaint
    isPathsVisibleProperty.link( myBoundListener );
    selectedSampleNumberProperty && selectedSampleNumberProperty.link( myBoundListener );

    this.modelViewTransform = modelViewTransform;
  }

  // This method checks to see if landed projectiles are off the field, and if so, draws a 'force field' graphic behind them.
  protected drawOutlierGraphicsForLandedProjectiles( landedProjectiles: Projectile[], context: CanvasRenderingContext2D ): void {

    // Force field graphics for landed outliers
    landedProjectiles.forEach( projectile => {
      if ( projectile.x > 100 || projectile.x < 0 ) {
        const viewPoint = this.modelViewTransform.modelToViewXY( projectile.x, projectile.y );
        context.save();
        context.translate( viewPoint.x, viewPoint.y );
        context.scale( PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR, PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR );
        context.drawImage( forceField_png, -forceField_png.width / 2, -forceField_png.height / 4 );
        context.restore();
      }
    } );
  }

  // This method draws the path for a projectile, which is a parabolic curve from the launch point to the projectile's current position.
  protected drawPathForProjectile( context: CanvasRenderingContext2D, projectile: Projectile ): void {
    context.beginPath();
    let pathStarted = false;

    const drawLineToProjectileAtTime = ( t: number ): void => {
      const pathX = Projectile.getProjectileX( projectile.launchSpeed, projectile.launchAngle, t );
      const pathY = Projectile.getProjectileY( projectile.launchSpeed, projectile.launchAngle, projectile.launchHeight, t );
      const viewPoint = this.modelViewTransform.modelToViewXY( pathX, pathY );

      if ( !pathStarted ) {
        context.moveTo( viewPoint.x, viewPoint.y );
        pathStarted = true;
      }

      context.lineTo( viewPoint.x, viewPoint.y );
    };

    for ( let t = 0; t < projectile.timeAirborne; t += 0.02 ) {
      drawLineToProjectileAtTime( t );
    }

    drawLineToProjectileAtTime( projectile.timeAirborne );
    context.stroke();
  }

  // This method draws the projectile, which is a pumpkin, piano, or cannonball, depending on the projectile type.
  // It also draws a different image if the projectile is landed, and if it is selected.
  protected drawProjectile( context: CanvasRenderingContext2D, projectile: Projectile, isLanded: boolean, isSelected: boolean ): void {

    const viewPoint = this.modelViewTransform.modelToViewXY( projectile.x, projectile.y );
    let image: HTMLImageElement;

    if ( projectile.type === PUMPKIN ) {
      if ( isLanded ) {
        image = isSelected ? PUMPKIN_LANDED_SELECTED_IMAGES[ projectile.landedImageIndex ] : PUMPKIN_LANDED_IMAGES[ projectile.landedImageIndex ];
      }
      else {
        image = pumpkin_png;
      }
    }
    else if ( projectile.type === PIANO ) {
      image = isLanded ? ( isSelected ? pianoLandedSelected_png : pianoLanded_png ) : piano_png;
    }
    else {
      image = isLanded ? ( isSelected ? cannonballLandedSelected_png : cannonballLanded_png ) : cannonball_png;
    }

    // Save the current state of the canvas
    context.save();

    // Move to the center of where we want to draw our image
    context.translate( viewPoint.x, viewPoint.y );

    const imageScaleX = projectile.isFlippedHorizontally ? -1 : 1;
    context.scale( imageScaleX * PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR, PDLConstants.PROJECTILE_IMAGE_SCALE_FACTOR );

    // Draw the image on the flipped context
    // Since the context is flipped, adjust the position by negating half of the width
    context.drawImage( image, -image.width / 2, -image.height / 2 );

    // Restore the context to its original state
    context.restore();
  }
}

projectileDataLab.register( 'PDLCanvasNode', PDLCanvasNode );