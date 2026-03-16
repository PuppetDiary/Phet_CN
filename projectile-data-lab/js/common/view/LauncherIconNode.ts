// Copyright 2024-2025, University of Colorado Boulder

/**
 * The LauncherIconNode is the iconic representation of the projectile launcher used in the Projectile Selector component.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Shape from '../../../../kite/js/Shape.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import CustomLauncherNode from '../../common-vsm/view/CustomLauncherNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import Launcher, { MYSTERY_LAUNCHERS } from '../model/Launcher.js';
import { LauncherOrientation, MEAN_LAUNCH_ANGLES } from '../model/LauncherOrientation.js';
import { MysteryOrCustom, MysteryOrCustomValues } from '../model/MysteryOrCustom.js';
import PDLConstants from '../PDLConstants.js';

type SelfOptions = EmptySelfOptions;
type LauncherIconNodeOptions = SelfOptions & NodeOptions;

export default class LauncherIconNode extends Node {

  // Create adapters that will reflect the values for the selected launcher.
  private launcherOrientationProperty = new Property<LauncherOrientation>( 'angle30' );
  private launchAngleProperty = new NumberProperty( 30 );
  private launchHeightProperty = new NumberProperty( 0 );
  private mysteryOrCustomProperty = new StringUnionProperty<MysteryOrCustom>( 'mystery', {
    validValues: MysteryOrCustomValues
  } );
  private mysteryLauncherProperty = new Property( MYSTERY_LAUNCHERS[ 0 ] );
  private launcherMechanismProperty = new Property<LauncherMechanism>( LauncherMechanism.SPRING );
  private standardDeviationAngleProperty = new Property( 0 );
  private latestLaunchSpeedProperty = new Property( 0 );

  public constructor( providedOptions?: LauncherIconNodeOptions ) {

    super( providedOptions );

    const launcherNode = new CustomLauncherNode(
      ModelViewTransform2.createIdentity(),
      this.launcherOrientationProperty,
      this.launchAngleProperty,
      this.launchHeightProperty,
      this.mysteryOrCustomProperty,
      this.mysteryLauncherProperty,
      this.launcherMechanismProperty,
      this.standardDeviationAngleProperty,
      this.latestLaunchSpeedProperty,
      null, {
        scale: 0.2
      } );

    this.addChild( launcherNode );
  }

  public updateIcon( launcherOrientation: LauncherOrientation,
                     mysteryOrCustom: MysteryOrCustom,
                     mysteryLauncher: Launcher,
                     launcherMechanism: LauncherMechanism,
                     standardDeviationAngle: number ): void {

    this.launcherOrientationProperty.value = launcherOrientation;
    this.launchAngleProperty.value = MEAN_LAUNCH_ANGLES[ launcherOrientation ];
    this.launchHeightProperty.value = launcherOrientation === 'angle0Raised' ? PDLConstants.RAISED_LAUNCHER_HEIGHT : 0;
    this.mysteryOrCustomProperty.value = mysteryOrCustom;

    if ( mysteryOrCustom === 'mystery' ) {
      this.mysteryLauncherProperty.value = mysteryLauncher;
    }
    else {
      this.launcherMechanismProperty.value = launcherMechanism;
      this.standardDeviationAngleProperty.value = standardDeviationAngle;
    }

    // Clear the clip area, so we can get an unclipped measurement of the localBounds.height
    this.clipArea = null;

    const height = this.localBounds.height * ( launcherOrientation === 'angle0Raised' ? 0.6 : 0.5 );

    // The launcher has a long pedestal that gets clipped off.
    this.clipArea = Shape.rect(
      this.localBounds.minX,
      this.localBounds.minY,
      this.localBounds.width,
      height
    );
  }
}

projectileDataLab.register( 'LauncherIconNode', LauncherIconNode );