// Copyright 2023-2025, University of Colorado Boulder

/**
 * SpeechSynthesisControl is the control for speech synthesis. It groups SpeechSynthesisButton and
 * NoVoiceWarningButton, which should always appear together.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import VBox, { VBoxOptions } from '../../../../scenery/js/layout/nodes/VBox.js';
import { NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NoVoiceWarningButton, { NoVoiceWarningButtonOptions } from './NoVoiceWarningButton.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import SpeechSynthesisButton, { SpeechSynthesisButtonOptions } from './SpeechSynthesisButton.js';

type SelfOptions = {

  // options propagated to (and required by) SpeechSynthesisButton
  speechSynthesisButtonOptions?: SpeechSynthesisButtonOptions;

  // options propagated to (and required by) NoVoiceWarningButton
  noVoiceWarningButtonOptions?: NoVoiceWarningButtonOptions;
};

type SpeechSynthesisControlOptions = SelfOptions & NodeTranslationOptions & PickOptional<NodeOptions, 'tandem'>;

export default class SpeechSynthesisControl extends VBox {

  public constructor( speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                      utteranceQueue: NumberSuiteCommonUtteranceQueue,
                      providedOptions: SpeechSynthesisControlOptions ) {

    const vBoxSpacing = 12;
    const options = optionize<SpeechSynthesisControlOptions, SelfOptions, VBoxOptions>()( {
      speechSynthesisButtonOptions: {
        tandem: providedOptions.tandem?.createTandem( 'speechSynthesisButton' ),
        touchAreaXDilation: vBoxSpacing / 2,
        touchAreaYDilation: vBoxSpacing / 2,
        phetioVisiblePropertyInstrumented: false
      },
      noVoiceWarningButtonOptions: {
        touchAreaXDilation: vBoxSpacing / 2,
        touchAreaYDilation: vBoxSpacing / 2,
        tandem: providedOptions.tandem?.createTandem( 'noVoiceWarningButton' ),
        phetioVisiblePropertyInstrumented: false,
        phetioDocumentation: 'This button is only available when the second language is turned on, and a compatible voice is not available.',
        phetioReadOnly: true
      },

      // VBoxOptions
      align: 'center',
      spacing: vBoxSpacing,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    const speechSynthesisButton = new SpeechSynthesisButton(
      speechSynthesisAnnouncer,
      utteranceQueue,
      options.speechSynthesisButtonOptions
    );

    const noVoiceWarningButton = new NoVoiceWarningButton(
      speechSynthesisAnnouncer.hasVoiceProperty,
      options.noVoiceWarningButtonOptions
    );

    options.children = [ speechSynthesisButton, noVoiceWarningButton ];

    super( options );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisControl', SpeechSynthesisControl );