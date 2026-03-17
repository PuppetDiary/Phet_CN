// Copyright 2022-2025, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferences is the model for sim-specific preferences for all Number Suite sims, accessed via the
 * Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Disposable from '../../../../axon/js/Disposable.js';
import Property from '../../../../axon/js/Property.js';
import localeProperty, { Locale, LocaleProperty } from '../../../../joist/js/i18n/localeProperty.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonQueryParameters from '../NumberSuiteCommonQueryParameters.js';

class NumberSuiteCommonPreferences {

  // preference Properties directly controlled by UI

  // whether a second locale should be shown. A toggle switch is added on screens that support two locales when true.
  public readonly secondLocaleEnabledProperty: Property<boolean>;

  // the second locale
  public readonly secondLocaleProperty: LocaleProperty;

  // whether the Ones are included on the 'Lab' Screen
  public readonly showLabOnesProperty: Property<boolean>;

  // whether the sim speaks the model value of screens that use speech synthesis when the data or voice changes
  public readonly autoHearEnabledProperty: Property<boolean>;

  // whether the sim is using its primary locale or a second locale on screens that support two locales
  public readonly isPrimaryLocaleProperty: Property<boolean>;

  // the voice of the primary locale
  public readonly primaryVoiceProperty: Property<SpeechSynthesisVoice | null>;

  // the voice of the secondary locale
  public readonly secondVoiceProperty: Property<SpeechSynthesisVoice | null>;

  // helper Properties derived from preference Properties

  // URL to the {REPO}_all.html file for this simulation.
  public readonly allURL: string;

  public constructor( allURL: string ) {

    // if a valid second locale was provided via a query parameter, display the second locale on sim startup
    this.secondLocaleEnabledProperty = new BooleanProperty( !!NumberSuiteCommonQueryParameters.secondLocale );

    // if a secondLocale was provided via a query parameter, use that, otherwise default to the primaryLocale
    this.secondLocaleProperty = new LocaleProperty( NumberSuiteCommonQueryParameters.secondLocale as Locale || localeProperty.value );

    this.showLabOnesProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.showLabOnes );

    this.autoHearEnabledProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.autoHear );

    this.isPrimaryLocaleProperty = new BooleanProperty( true );

    this.primaryVoiceProperty = new Property<SpeechSynthesisVoice | null>( null );

    this.secondVoiceProperty = new Property<SpeechSynthesisVoice | null>( null );

    this.allURL = allURL;
  }

  public dispose(): void {
    Disposable.assertNotDisposable();
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferences', NumberSuiteCommonPreferences );
export default NumberSuiteCommonPreferences;