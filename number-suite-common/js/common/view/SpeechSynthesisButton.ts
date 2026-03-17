// Copyright 2021-2025, University of Colorado Boulder

/**
 * A button that speaks the speech data of the provided NumberSuiteCommonUtteranceQueue when pressed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import audioManager from '../../../../joist/js/audioManager.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import bullhornSolidShape from '../../../../sherpa/js/fontawesome-5/bullhornSolidShape.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';

type SelfOptions = {
  comparisonSignsAndTextVisibleProperty?: TReadOnlyProperty<boolean>;
};
export type SpeechSynthesisButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'listener' | 'enabledProperty' | 'content'>;

// constants
const SIDE_LENGTH = NumberSuiteCommonConstants.BUTTON_LENGTH;

class SpeechSynthesisButton extends RectangularPushButton {

  public constructor(
    speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
    utteranceQueue: NumberSuiteCommonUtteranceQueue,
    providedOptions?: SpeechSynthesisButtonOptions ) {

    const options = optionize<SpeechSynthesisButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {
      comparisonSignsAndTextVisibleProperty: new BooleanProperty( true ),
      content: new Path( bullhornSolidShape, {
        fill: Color.BLACK
      } ),
      size: new Dimension2( SIDE_LENGTH, SIDE_LENGTH ),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      listener: () => utteranceQueue.speakSpeechData(),
      enabledProperty: new DerivedProperty( [
        audioManager.audioEnabledProperty,
        providedOptions?.comparisonSignsAndTextVisibleProperty || new BooleanProperty( true ),
        speechSynthesisAnnouncer.hasVoiceProperty
      ], ( audioEnabled, comparisonSignsAndTextVisible, hasVoice ) =>
        audioEnabled && comparisonSignsAndTextVisible && hasVoice ),
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    super( options );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisButton', SpeechSynthesisButton );
export default SpeechSynthesisButton;