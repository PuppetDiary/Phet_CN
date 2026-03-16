// Copyright 2023-2024, University of Colorado Boulder

/**
 * The SamplingScreen represents the Sampling Screen for the Projectile Data Lab.
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
import SamplingModel from './model/SamplingModel.js';
import SamplingScreenView from './view/SamplingScreenView.js';

type SelfOptions = EmptySelfOptions;

type SamplingScreenOptions = SelfOptions & ScreenOptions;

export default class SamplingScreen extends Screen<SamplingModel, SamplingScreenView> {

  public constructor( providedOptions: SamplingScreenOptions ) {

    const options = optionize<SamplingScreenOptions, SelfOptions, ScreenOptions>()( {
      name: ProjectileDataLabStrings.screen.samplingStringProperty,
      homeScreenIcon: PDLScreenIconFactory.createSamplingScreenIcon(),
      createKeyboardHelpNode: () => new PDLKeyboardHelpNode( false, false, [ new ComboBoxKeyboardHelpSection( {
        headingString: ProjectileDataLabStrings.keyboardHelpDialog.histogramBinControlsStringProperty
      } ) ], { hasShowField1Through6Shortcut: false } )
    }, providedOptions );

    super(
      () => new SamplingModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new SamplingScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

projectileDataLab.register( 'SamplingScreen', SamplingScreen );