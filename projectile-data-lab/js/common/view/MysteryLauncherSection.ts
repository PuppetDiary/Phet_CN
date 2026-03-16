// Copyright 2023-2024, University of Colorado Boulder

/**
 * The MysteryLauncherSection shows the mystery launcher radio buttons.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import Launcher from '../model/Launcher.js';
import MysteryLauncherControl from './MysteryLauncherControl.js';
import PDLPanelSection, { PDLPanelSectionOptions } from './PDLPanelSection.js';

type SelfOptions = EmptySelfOptions;
type MysteryLauncherSectionOptions = SelfOptions & WithRequired<PDLPanelSectionOptions, 'tandem'>;

export default class MysteryLauncherSection extends PDLPanelSection {

  public constructor( mysteryLauncherProperty: PhetioProperty<Launcher>, providedOptions: MysteryLauncherSectionOptions ) {
    super( ProjectileDataLabStrings.mysteryLauncherStringProperty, new MysteryLauncherControl( mysteryLauncherProperty, providedOptions ), providedOptions );
  }
}

projectileDataLab.register( 'MysteryLauncherSection', MysteryLauncherSection );