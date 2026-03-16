// Copyright 2023-2025, University of Colorado Boulder
/**
 * PDLText is a Text with the default font for the Projectile Data Lab.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Text, { TextOptions } from '../../../../scenery/js/nodes/Text.js';
import projectileDataLab from '../../projectileDataLab.js';
import PDLConstants from '../PDLConstants.js';

type SelfOptions = EmptySelfOptions;
type PDLTextOptions = SelfOptions & TextOptions;

export default class PDLText extends Text {
  public constructor( text: TReadOnlyProperty<string> | string, providedOptions?: PDLTextOptions ) {
    const options = optionize<PDLTextOptions, SelfOptions, TextOptions>()( {
      font: PDLConstants.PRIMARY_FONT
    }, providedOptions );
    super( text, options );
  }
}

projectileDataLab.register( 'PDLText', PDLText );