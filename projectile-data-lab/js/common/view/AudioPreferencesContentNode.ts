// Copyright 2024-2025, University of Colorado Boulder

/**
 * AudioPreferencesContentNode displays sim-specific controls that affect the audio behavior and sonification of the simulation.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import PreferencesPanelContentNode from '../../../../joist/js/preferences/PreferencesPanelContentNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../../sun/js/ToggleSwitch.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import { LaunchSoundStrategy } from '../LaunchSoundStrategy.js';
import PDLPreferences from '../PDLPreferences.js';
import PDLText from './PDLText.js';

export default class AudioPreferencesContentNode extends PreferencesPanelContentNode {

  public constructor( tandem: Tandem ) {

    const launchSoundStrategyControlTandem = tandem.createTandem( 'launchSoundStrategyControl' );

    const launchSoundStrategyRadioButtonGroup = new VerticalAquaRadioButtonGroup<LaunchSoundStrategy>( PDLPreferences.launchSoundStrategyProperty, [ {
      createNode: () => new PDLText( ProjectileDataLabStrings.speedStringProperty, { maxWidth: 200 } ),
      value: 'speed',
      tandemName: 'speedRadioButton'
    }, {
      createNode: () => new PDLText( ProjectileDataLabStrings.angleStringProperty, { maxWidth: 200 } ),
      value: 'angle',
      tandemName: 'angleRadioButton'
    }, {
      createNode: () => new PDLText( ProjectileDataLabStrings.noneStringProperty, { maxWidth: 200 } ),
      value: 'none',
      tandemName: 'noneRadioButton'
    } ], {
      tandem: launchSoundStrategyControlTandem.createTandem( 'radioButtonGroup' ),
      isDisposable: false
    } );

    const launchSoundStrategyControl = new PreferencesControl( {
      labelNode: new PDLText( ProjectileDataLabStrings.launchSoundStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      descriptionNode: new RichText( ProjectileDataLabStrings.launchSoundPreferenceDescriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS ),
      controlNode: launchSoundStrategyRadioButtonGroup,
      tandem: launchSoundStrategyControlTandem,
      phetioFeatured: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    const playLandingSoundControlTandem = tandem.createTandem( 'playLandingSoundControl' );

    const toggleSwitch = new ToggleSwitch( PDLPreferences.playLandingSoundProperty, false, true, combineOptions<ToggleSwitchOptions>( {
      tandem: playLandingSoundControlTandem.createTandem( 'toggleSwitch' )
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );

    const playLandingSoundControl = new PreferencesControl( {
      labelNode: new PDLText( ProjectileDataLabStrings.playLandingSoundStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      descriptionNode: new RichText( ProjectileDataLabStrings.playLandingSoundPreferenceDescriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS ),
      controlNode: toggleSwitch,
      tandem: playLandingSoundControlTandem,
      phetioFeatured: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      layoutOptions: {
        yMargin: 8
      }
    } );

    super( {
      fill: null,
      xMargin: 0,
      content: [
        launchSoundStrategyControl,
        playLandingSoundControl
      ]
    } );
  }
}

projectileDataLab.register( 'AudioPreferencesContentNode', AudioPreferencesContentNode );