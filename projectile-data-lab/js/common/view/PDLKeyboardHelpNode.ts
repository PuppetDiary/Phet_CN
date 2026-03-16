// Copyright 2023-2024, University of Colorado Boulder

/**
 * PDLKeyboardHelpNode is the keyboard help for all screens. The majority of elements are relevant to all screens.
 * Elements that are not relevant to all screens may be omitted via providedOptions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent, { TwoColumnKeyboardHelpContentOptions } from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import FieldRadioButtonGroup from '../../common-vsm/view/FieldRadioButtonGroup.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import LaunchButton from './LaunchButton.js';

type SelfOptions = {

  // Whether to include the keyboard shortcut labeled 'Select a field', which is not relevant in the 'Sampling' screen.
  hasShowField1Through6Shortcut?: boolean;
};

type PDLKeyboardHelpNodeOptions = SelfOptions;

export default class PDLKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor( showSliderHelp: boolean, showDraggableItemHelp: boolean, additionalLeftColumnContent: KeyboardHelpSection[] = [], providedOptions?: PDLKeyboardHelpNodeOptions ) {

    const options = optionize<PDLKeyboardHelpNodeOptions, SelfOptions, TwoColumnKeyboardHelpContentOptions>()( {

      // SelfOptions
      hasShowField1Through6Shortcut: true
    }, providedOptions );

    const leftColumn = [
      new FromAnywhereInSimHelpSection( options.hasShowField1Through6Shortcut ),
      ...( showDraggableItemHelp ? [ new MoveDraggableItemsKeyboardHelpSection() ] : [] ),
      ...additionalLeftColumnContent
    ];

    const rightColumn = [
      ...( showSliderHelp ? [ new SliderControlsKeyboardHelpSection() ] : [] ),
      new BasicActionsKeyboardHelpSection( { withCheckboxContent: true } )
    ];

    super( leftColumn, rightColumn );
  }
}

/**
 * The section labeled 'Keyboard Shortcuts'.
 */
class FromAnywhereInSimHelpSection extends KeyboardHelpSection {

  public constructor( hasShowField1Through6Shortcut: boolean ) {

    // Press the launch button: [Opt][L]
    const rows = [
      KeyboardHelpSectionRow.fromHotkeyData( LaunchButton.LAUNCH_HOTKEY_DATA )
    ];

    // Go to field: [F][1]-[6]
    if ( hasShowField1Through6Shortcut ) {
      rows.push( KeyboardHelpSectionRow.fromHotkeyData( FieldRadioButtonGroup.GLOBAL_FIELD_SELECT_HOTKEY_DATA, {

        // A unique icon because we provide a simplified annotation for all of the number keys you can press
        icon: KeyboardHelpIconFactory.iconPlusIcon( new LetterKeyNode( 'F' ), KeyboardHelpIconFactory.iconToIcon( new NumberKeyNode( 1 ), new NumberKeyNode( 6 ) ) )
      } ) );
    }

    super( ProjectileDataLabStrings.fromAnywhereInSimStringProperty, rows, {
      textMaxWidth: 250,
      isDisposable: false
    } );
  }
}

projectileDataLab.register( 'PDLKeyboardHelpNode', PDLKeyboardHelpNode );