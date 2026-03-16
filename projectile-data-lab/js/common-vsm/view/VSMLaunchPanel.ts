// Copyright 2023-2025, University of Colorado Boulder

/**
 * The VSMLaunchPanel presents a UI so the user can choose the launcher orientation and projectile type.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { LauncherOrientation } from '../../common/model/LauncherOrientation.js';
import ProjectileType from '../../common/model/ProjectileType.js';
import LauncherOrientationSection from '../../common/view/LauncherOrientationSection.js';
import { PDLLaunchPanel, PDLLaunchPanelOptions } from '../../common/view/PDLLaunchPanel.js';
import ProjectileTypeSection from '../../common/view/ProjectileTypeSection.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
export type VSMLaunchPanelOptions = SelfOptions & PDLLaunchPanelOptions;

export default class VSMLaunchPanel extends PDLLaunchPanel {

  public constructor( content: Node[], orientationProperty: PhetioProperty<LauncherOrientation>,
                      projectileTypeProperty: PhetioProperty<ProjectileType>, providedOptions: VSMLaunchPanelOptions ) {

    const launcherOrientationSection = new LauncherOrientationSection( orientationProperty, {
      tandem: providedOptions.tandem.createTandem( 'launcherOrientationSection' )
    } );

    const projectileTypeSection = new ProjectileTypeSection( projectileTypeProperty, {
      tandem: providedOptions.tandem.createTandem( 'projectileTypeSection' )
    } );

    super( [ launcherOrientationSection, projectileTypeSection, ...content ], providedOptions );
  }
}
projectileDataLab.register( 'VSMLaunchPanel', VSMLaunchPanel );