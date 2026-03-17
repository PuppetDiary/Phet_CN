// Copyright 2022-2025, University of Colorado Boulder

/**
 * A button that shows NoVoiceWarningDialog when pressed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import NoVoiceWarningDialog from './NoVoiceWarningDialog.js';
import { OopsDialogOptions } from '../../../../scenery-phet/js/OopsDialog.js';

type SelfOptions = {
  noVoiceWarningDialogOptions?: StrictOmit<OopsDialogOptions, 'tandem'>;
};
export type NoVoiceWarningButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content' | 'listener' | 'visibleProperty'>;

// constants
const SIDE_LENGTH = NumberSuiteCommonConstants.BUTTON_LENGTH;

class NoVoiceWarningButton extends RectangularPushButton {

  public constructor( hasVoiceProperty: TReadOnlyProperty<boolean>, providedOptions?: NoVoiceWarningButtonOptions ) {
    const warningDialogOptions = combineOptions<OopsDialogOptions>( { tandem: providedOptions?.tandem?.createTandem( 'warningDialog' ) }, providedOptions?.noVoiceWarningDialogOptions );
    const warningDialog = new NoVoiceWarningDialog( warningDialogOptions );

    const options = optionize<NoVoiceWarningButtonOptions, StrictOmit<SelfOptions, 'noVoiceWarningDialogOptions'>, RectangularPushButtonOptions>()( {
      content: new Path( exclamationTriangleSolidShape, {
        fill: new Color( 240, 79, 79 )
      } ),
      size: new Dimension2( SIDE_LENGTH, SIDE_LENGTH ),
      baseColor: Color.WHITE,
      listener: () => warningDialog.show(),
      visibleProperty: new DerivedProperty( [ hasVoiceProperty ], hasVoice => !hasVoice ),
      tandem: Tandem.OPTIONAL
    }, providedOptions );
    super( options );
  }
}

numberSuiteCommon.register( 'NoVoiceWarningButton', NoVoiceWarningButton );
export default NoVoiceWarningButton;