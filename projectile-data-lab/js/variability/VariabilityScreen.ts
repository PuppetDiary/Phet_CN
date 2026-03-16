// Copyright 2023-2024, University of Colorado Boulder

/**
 * The Variability Screen for Projectile Data Lab.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ComboBoxKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import PDLKeyboardHelpNode from '../common/view/PDLKeyboardHelpNode.js';
import PDLScreenIconFactory from '../common/view/PDLScreenIconFactory.js';
import projectileDataLab from '../projectileDataLab.js';
import ProjectileDataLabStrings from '../ProjectileDataLabStrings.js';
import VariabilityModel from './model/VariabilityModel.js';
import VariabilityScreenView from './view/VariabilityScreenView.js';

type SelfOptions = EmptySelfOptions;

type VariabilityScreenOptions = SelfOptions & ScreenOptions;

export default class VariabilityScreen extends Screen<VariabilityModel, VariabilityScreenView> {

  public constructor( providedOptions: VariabilityScreenOptions ) {

    const options = optionize<VariabilityScreenOptions, SelfOptions, ScreenOptions>()( {
      name: ProjectileDataLabStrings.screen.variabilityStringProperty,
      homeScreenIcon: PDLScreenIconFactory.createVariabilityScreenIcon(),
      createKeyboardHelpNode: () => new PDLKeyboardHelpNode( false, true, [ new ComboBoxKeyboardHelpSection( {
        headingString: ProjectileDataLabStrings.keyboardHelpDialog.histogramBinControlsStringProperty
      } ) ] )
    }, providedOptions );

    super(
      () => new VariabilityModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new VariabilityScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

projectileDataLab.register( 'VariabilityScreen', VariabilityScreen );