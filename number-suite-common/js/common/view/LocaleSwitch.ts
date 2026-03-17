// Copyright 2023-2025, University of Colorado Boulder

/**
 * An ABSwitch for choosing the primary or secondary locale.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import localeProperty from '../../../../joist/js/i18n/localeProperty.js';
import NumberSuiteCommonPreferences from '../../../../number-suite-common/js/common/model/NumberSuiteCommonPreferences.js';
import NumberSuiteCommonUtteranceQueue from '../../../../number-suite-common/js/common/view/NumberSuiteCommonUtteranceQueue.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text, { TextOptions } from '../../../../scenery/js/nodes/Text.js';
import ABSwitch, { ABSwitchOptions } from '../../../../sun/js/ABSwitch.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';

type SelfOptions = EmptySelfOptions;
type LocaleSwitchOptions = SelfOptions & ABSwitchOptions;

// constants
const TOGGLE_SWITCH_SIZE = new Dimension2( 40, 20 );
const SPACING = 8;
const TEXT_OPTIONS: TextOptions = {
  font: new PhetFont( 14 )
};

export default class LocaleSwitch extends ABSwitch<boolean> {

  public constructor(
    preferences: Pick<NumberSuiteCommonPreferences, 'secondLocaleProperty' | 'secondLocaleEnabledProperty' | 'isPrimaryLocaleProperty' | 'autoHearEnabledProperty'>,
    utteranceQueue: NumberSuiteCommonUtteranceQueue,
    maxWidth: number,
    providedOptions?: LocaleSwitchOptions
  ) {

    const firstLanguageStringProperty = new DerivedProperty( [ localeProperty ], StringUtils.localeToLocalizedName );

    const secondLanguageStringProperty = new DerivedProperty( [ preferences.secondLocaleProperty ],
      StringUtils.localeToLocalizedName );

    TEXT_OPTIONS.maxWidth = ( maxWidth - TOGGLE_SWITCH_SIZE.width - SPACING * 2 ) / 2;
    const firstLanguageText = new Text( firstLanguageStringProperty, TEXT_OPTIONS );
    const secondLanguageText = new Text( secondLanguageStringProperty, TEXT_OPTIONS );

    const options = optionize<LocaleSwitchOptions, SelfOptions, ABSwitchOptions>()( {
      spacing: SPACING,
      toggleSwitchOptions: {
        size: TOGGLE_SWITCH_SIZE,
        enabledPropertyOptions: {
          phetioFeatured: true
        },
        visiblePropertyOptions: {
          phetioFeatured: false
        }
      },
      visibleProperty: new DerivedProperty( [ preferences.secondLocaleEnabledProperty ], showSecondLocale => showSecondLocale ),
      enabledPropertyOptions: {
        phetioFeatured: false
      }
    }, providedOptions );
    super( preferences.isPrimaryLocaleProperty,
      true, firstLanguageText,
      false, secondLanguageText,
      options
    );

    // Speak speechData if autoHear is turned on.
    this.onInputEmitter.addListener( () => preferences.autoHearEnabledProperty.value && utteranceQueue.speakSpeechData() );
  }
}

numberSuiteCommon.register( 'LocaleSwitch', LocaleSwitch );