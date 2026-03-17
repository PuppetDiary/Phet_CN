// Copyright 2022-2025, University of Colorado Boulder

/**
 * Message dialog displayed when the NoVoiceWarningButton is pressed that warns users that there are no voices for the
 * selected language.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import OopsDialog, { OopsDialogOptions } from '../../../../scenery-phet/js/OopsDialog.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';

type SelfOptions = EmptySelfOptions;
type NoVoiceWarningDialogOptions = SelfOptions & StrictOmit<OopsDialogOptions, 'iconNode' | 'title'>;

class NoVoiceWarningDialog extends OopsDialog {

  public constructor( providedOptions?: NoVoiceWarningDialogOptions ) {

    const messageProperty = new DerivedProperty( [
        NumberSuiteCommonStrings.noVoiceFoundDescriptionStringProperty,
        NumberSuiteCommonStrings.yourDeviceMaySupportDescriptionStringProperty ],
      ( noVoiceFoundDescriptionString, yourDeviceMaySupportDescription ) => {
        return `<br>${noVoiceFoundDescriptionString}<br><br>${yourDeviceMaySupportDescription}`;
      } );

    const options = optionize<NoVoiceWarningDialogOptions, SelfOptions, OopsDialogOptions>()( {
      richTextOptions: {
        font: new PhetFont( 18 )
      },
      title: new Path( exclamationTriangleSolidShape, {
        fill: new Color( 240, 79, 79 ),
        maxWidth: 35
      } ),
      iconNode: new Node()
    }, providedOptions );
    super( messageProperty, options );
  }
}

numberSuiteCommon.register( 'NoVoiceWarningDialog', NoVoiceWarningDialog );
export default NoVoiceWarningDialog;