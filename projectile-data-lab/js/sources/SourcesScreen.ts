// Copyright 2023-2024, University of Colorado Boulder

/**
 * The Sources Screen for Projectile Data Lab.
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
import SourcesModel from './model/SourcesModel.js';
import SourcesScreenView from './view/SourcesScreenView.js';

type SelfOptions = EmptySelfOptions;

type SourcesScreenOptions = SelfOptions & ScreenOptions;

export default class SourcesScreen extends Screen<SourcesModel, SourcesScreenView> {

  public constructor( providedOptions: SourcesScreenOptions ) {

    const options = optionize<SourcesScreenOptions, SelfOptions, ScreenOptions>()( {
      name: ProjectileDataLabStrings.screen.sourcesStringProperty,
      homeScreenIcon: PDLScreenIconFactory.createSourcesScreenIcon(),
      createKeyboardHelpNode: () => new PDLKeyboardHelpNode( true, true, [ new ComboBoxKeyboardHelpSection( {
        headingString: ProjectileDataLabStrings.keyboardHelpDialog.histogramBinControlsStringProperty
      } ) ] )
    }, providedOptions );

    super(
      () => new SourcesModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new SourcesScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

projectileDataLab.register( 'SourcesScreen', SourcesScreen );