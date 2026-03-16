// Copyright 2023-2024, University of Colorado Boulder

/**
 * The SourcesLaunchPanel extends VSMLaunchPanel and adds the CustomLauncherSection which allows the user to select
 * between the custom and mystery launchers.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import CustomLauncherSection from '../../common-vsm/view/CustomLauncherSection.js';
import VSMLaunchPanel, { VSMLaunchPanelOptions } from '../../common-vsm/view/VSMLaunchPanel.js';
import { LauncherOrientation } from '../../common/model/LauncherOrientation.js';
import ProjectileType from '../../common/model/ProjectileType.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
type SourcesLaunchPanelOptions = SelfOptions & VSMLaunchPanelOptions;

export default class SourcesLaunchPanel extends VSMLaunchPanel {

  public constructor( launcherOrientationProperty: PhetioProperty<LauncherOrientation>,
                      projectileTypeProperty: PhetioProperty<ProjectileType>,
                      customLauncherMechanismProperty: PhetioProperty<LauncherMechanism>,
                      angleStabilityProperty: PhetioProperty<number>,
                      providedOptions: SourcesLaunchPanelOptions ) {

    const customLauncherSection = new CustomLauncherSection( customLauncherMechanismProperty,
      angleStabilityProperty, {
        tandem: providedOptions.tandem.createTandem( 'customLauncherSection' )
      } );

    super( [ customLauncherSection ], launcherOrientationProperty, projectileTypeProperty, providedOptions );
  }
}
projectileDataLab.register( 'SourcesLaunchPanel', SourcesLaunchPanel );