// Copyright 2024-2025, University of Colorado Boulder

/**
 * The FieldRadioButtonGroup is a group of buttons that allows the user to select a field.
 * This appears beneath the fields on the VSM screens.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import HotkeyData from '../../../../scenery/js/input/HotkeyData.js';
import KeyboardListener from '../../../../scenery/js/listeners/KeyboardListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RectangularRadioButtonGroup, { RectangularRadioButtonGroupOptions } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import multiSelectionSoundPlayerFactory from '../../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Field from '../../common/model/Field.js';
import PDLColors from '../../common/PDLColors.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

type SelfOptions = EmptySelfOptions;
type FieldRadioButtonGroupOptions = SelfOptions & RectangularRadioButtonGroupOptions;

export default class FieldRadioButtonGroup<T extends Field> extends RectangularRadioButtonGroup<T> {
  public constructor( fieldProperty: Property<T>, fields: T[], providedOptions: FieldRadioButtonGroupOptions ) {

    const options = optionize<FieldRadioButtonGroupOptions, SelfOptions, RectangularRadioButtonGroupOptions>()( {
      phetioFeatured: true,
      orientation: 'horizontal',
      spacing: 3,
      radioButtonOptions: {
        preferredWidth: 40,
        buttonAppearanceStrategyOptions: {
          selectedStroke: PDLColors.fieldSignTextFillProperty,
          selectedLineWidth: 3,
          overStroke: PDLColors.fieldSignTextFillProperty,
          deselectedStroke: PDLColors.fieldSignTextFillProperty,
          deselectedLineWidth: 2,
          deselectedButtonOpacity: 0.8
        }
      }
    }, providedOptions );

    const fieldRadioButtons = fields.map( field => {

      const fieldIndex = fields.indexOf( field );
      const fieldNumber = fieldIndex + 1;

      const dataIndicator = new Circle( 3, {
        visibleProperty: field.isContainingDataProperty,
        fill: PDLColors.fieldSignTextFillProperty,
        pickable: false
      } );

      const buttonText = new PDLText( fieldNumber.toString(), {
        fill: PDLColors.fieldSignTextFillProperty,
        fontSize: 20,
        fontWeight: 'bold'
      } );

      const buttonContents = new Rectangle( buttonText.bounds.dilatedX( 10 ).dilatedY( 1 ), {
        children: [ buttonText, dataIndicator ]
      } );

      dataIndicator.top = buttonContents.top;
      dataIndicator.left = buttonContents.left;

      buttonText.centerX = buttonContents.centerX;

      return {
        value: fieldProperty.validValues![ fieldIndex ],
        tandemName: 'field' + fieldNumber + 'RadioButton',
        createNode: () => buttonContents,
        options: {
          baseColor: field.color
        }
      };
    } );

    super( fieldProperty, fieldRadioButtons, options );

    const handleKeypress = ( fieldNumber: number ) => {

      const proposedField = fields[ fieldNumber - 1 ];
      const button = this.getButtonForValue( proposedField );
      if ( button.enabledProperty.value && button.visibleProperty.value ) {

        fieldProperty.value = fields[ fieldNumber - 1 ];

        // Play the sound associated with the selected field
        multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( fieldNumber - 1 ).play();

        // Move focus to the radio button that was selected. Without this line, focus would incorrectly remain
        // on the previous button. Only do this if a radio button already had focus, otherwise it would steal focus
        for ( let i = 0; i < fieldRadioButtons.length; i++ ) {
          const button = this.getButtonForValue( fieldRadioButtons[ i ].value );
          if ( button.focused ) {
            this.getButtonForValue( fieldProperty.value ).focus();
            break;
          }
        }
      }
    };

    // a listener that selects a field based on the keystroke, regardless of where focus is in the document
    KeyboardListener.createGlobal( this, {
      keyStringProperties: FieldRadioButtonGroup.GLOBAL_FIELD_SELECT_HOTKEY_DATA.keyStringProperties,
      fire: ( event, keysPressed ) => {
        const key = parseInt( keysPressed.substring( keysPressed.indexOf( '+' ) + 1 ), 10 );
        handleKeypress( key );
      }
    } );

    // a listener that selects the radio button when the radio button group has focus
    this.addInputListener( new KeyboardListener( {
      keyStringProperties: FieldRadioButtonGroup.FIELD_SELECT_HOTKEY_DATA.keyStringProperties,
      fire: ( event, keysPressed ) => {
        const key = parseInt( keysPressed, 10 );
        handleKeypress( key );
      }
    } ) );
  }

  public static readonly GLOBAL_FIELD_SELECT_HOTKEY_DATA = new HotkeyData( {
    keys: [
      'f+1', 'f+2', 'f+3',
      'f+4', 'f+5', 'f+6'
    ],
    repoName: projectileDataLab.name,
    keyboardHelpDialogLabelStringProperty: ProjectileDataLabStrings.goToFieldStringProperty,
    global: true
  } );

  public static readonly FIELD_SELECT_HOTKEY_DATA = new HotkeyData( {
    keys: [
      '1', '2', '3',
      '4', '5', '6'
    ],
    repoName: projectileDataLab.name,
    binderName: 'Go to field'
  } );
}

projectileDataLab.register( 'FieldRadioButtonGroup', FieldRadioButtonGroup );