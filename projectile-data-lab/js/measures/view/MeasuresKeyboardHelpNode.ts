// Copyright 2024, University of Colorado Boulder

/**
 * MeasuresKeyboardHelpNode shows keyboard help specific to the Measures screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import PDLKeyboardHelpNode from '../../common/view/PDLKeyboardHelpNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

export default class MeasuresKeyboardHelpNode extends PDLKeyboardHelpNode {

  public constructor() {

    const intervalToolSection = new SliderControlsKeyboardHelpSection( {
      headingStringProperty: ProjectileDataLabStrings.keyboardHelpDialog.measuresScreen.movePointerIntervalHandleOrIntervalBlockStringProperty,
      sliderStringProperty: ProjectileDataLabStrings.keyboardHelpDialog.measuresScreen.objectStringProperty,
      verbStringProperty: ProjectileDataLabStrings.keyboardHelpDialog.measuresScreen.moveStringProperty,
      maximumStringProperty: ProjectileDataLabStrings.keyboardHelpDialog.measuresScreen.endOfNumberLineStringProperty,
      minimumStringProperty: ProjectileDataLabStrings.keyboardHelpDialog.measuresScreen.startOfNumberLineStringProperty
    } );

    super( true, true, [ intervalToolSection ], {} );
  }
}

projectileDataLab.register( 'MeasuresKeyboardHelpNode', MeasuresKeyboardHelpNode );