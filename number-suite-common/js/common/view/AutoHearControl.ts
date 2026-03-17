// Copyright 2022-2025, University of Colorado Boulder

/**
 * A toggle control in the Preferences Dialog that controls whether the sim automatically reads the current data out
 * loud when the data is updated or the voice is changed. It also includes a warning message below the toggle control
 * that is visible if there is no voice.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text, { TextOptions } from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';

const MISSING_VOICE_WARNING_TEXT_OPTIONS: TextOptions = {
  font: new PhetFont( 14 ),
  maxWidth: PreferencesDialogConstants.CONTENT_MAX_WIDTH
};

type SelfOptions = EmptySelfOptions;

type AutoHearControlOptions = SelfOptions & NodeOptions;

export default class AutoHearControl extends Node {

  public constructor(
    autoHearEnabledProperty: Property<boolean>,
    hasVoiceProperty: TReadOnlyProperty<boolean>,
    labelStringProperty: TReadOnlyProperty<string>,
    descriptionStringProperty: TReadOnlyProperty<string>,
    providedOptions?: AutoHearControlOptions
  ) {

    const options = optionize<AutoHearControlOptions, SelfOptions, NodeOptions>()( {

      // NodeOptions
      isDisposable: false,
      tandem: Tandem.OPT_OUT,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    super( options );

    const toggleSwitch = new ToggleSwitch( autoHearEnabledProperty, false, true,
      combineOptions<ToggleSwitchOptions>( {}, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS, {
        tandem: options.tandem.createTandem( 'toggleSwitch' )
      } ) );

    const control = new PreferencesControl( {
      labelNode: new Text( labelStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      descriptionNode: new RichText( descriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS ),
      controlNode: toggleSwitch,
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    } );
    this.addChild( control );

    const warningIcon = new Path( exclamationTriangleSolidShape, {
      fill: new Color( 240, 79, 79 ),
      maxWidth: 30
    } );

    const noVoiceFoundDescriptionText = new Text(
      NumberSuiteCommonStrings.noVoiceFoundDescriptionStringProperty,
      MISSING_VOICE_WARNING_TEXT_OPTIONS
    );
    const yourDeviceMaySupportDescriptionText = new Text(
      NumberSuiteCommonStrings.yourDeviceMaySupportDescriptionStringProperty,
      MISSING_VOICE_WARNING_TEXT_OPTIONS
    );

    const missingVoiceWarningMessage = new VBox( {
      children: [ noVoiceFoundDescriptionText, yourDeviceMaySupportDescriptionText ],
      spacing: 8,
      align: 'left'
    } );

    const missingVoiceWarningNode = new VBox( {
      children: [ warningIcon, missingVoiceWarningMessage ],
      spacing: 14,
      align: 'center',
      visibleProperty: new DerivedProperty(
        [ autoHearEnabledProperty, hasVoiceProperty ],
        ( autoHearEnabled, hasVoice ) => autoHearEnabled && !hasVoice
      )
    } );
    this.addChild( missingVoiceWarningNode );

    missingVoiceWarningNode.left = control.left;
    missingVoiceWarningNode.top = control.bottom + 24;
  }
}

numberSuiteCommon.register( 'AutoHearControl', AutoHearControl );