// Copyright 2016-2025, University of Colorado Boulder

/**
 * KeypadLayer handles creation and management of a modal keypad.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PressListener from '../../../../scenery/js/listeners/PressListener.js';
import Plane from '../../../../scenery/js/nodes/Plane.js';
import unitRates from '../../unitRates.js';
import KeypadPanel from './KeypadPanel.js';

type BeginEditOptions = {
  onBeginEdit?: ( () => void ) | null; // called by beginEdit
  onEndEdit?: ( () => void ) | null; // called by endEdit
  setKeypadPanelPosition?: ( ( keypadPanel: KeypadPanel ) => void ) | null; // called by beginEdit to set the KeypadPanel position
  maxDigits?: number; // maximum number of digits that can be entered on the keypad
  maxDecimals?: number; // maximum number of decimal places that can be entered on the keypad
  zeroIsValid?: boolean; //  is zero a valid value?
};

export default class KeypadLayer extends Plane {

  private valueProperty: Property<number | null> | null;
  private keypadPanel: KeypadPanel | null;
  private onEndEdit: ( () => void ) | null;
  private zeroIsValid: boolean;

  public constructor() {

    super( {
      isDisposable: false,
      fill: 'rgba( 0, 0, 0, 0.2 )',
      visible: false
    } );

    // clicking outside the keypad cancels the edit
    this.addInputListener( new PressListener( {
      attach: false,
      pressCursor: null,
      press: event => {
        if ( this.visible && event.trail.lastNode() === this ) {
          this.cancelEdit();
        }
      }
    } ) );

    // These will be set when the client calls beginEdit.
    this.valueProperty = null;
    this.keypadPanel = null;
    this.onEndEdit = null;
    this.zeroIsValid = true;
  }

  /**
   * Begins an edit, by opening a modal keypad.
   * @param valueProperty - the Property to be set by the keypad
   * @param [providedOptions]
   */
  public beginEdit( valueProperty: Property<number | null>, providedOptions?: BeginEditOptions ): void {

    // Ignore attempts to open another KeypadPanel. This can happen in unlikely multitouch scenarios.
    // See https://github.com/phetsims/unit-rates/issues/181
    if ( this.keypadPanel ) {
      phet.log && phet.log( 'ignoring attempt to open another KeypadPanel' );
      return;
    }

    const options = optionize<BeginEditOptions>()( {
      onBeginEdit: null,
      onEndEdit: null,
      setKeypadPanelPosition: null,
      maxDigits: 4,
      maxDecimals: 2,
      zeroIsValid: true
    }, providedOptions );

    this.valueProperty = valueProperty; // remove this reference in endEdit
    this.onEndEdit = options.onEndEdit;
    this.zeroIsValid = options.zeroIsValid;

    this.keypadPanel = new KeypadPanel( {
      maxDigits: options.maxDigits,
      maxDecimals: options.maxDecimals,
      enterButtonListener: this.commitEdit.bind( this )
    } );

    // display the KeypadPanel
    this.addChild( this.keypadPanel );
    this.visible = true;

    // position the keypad
    options.setKeypadPanelPosition && options.setKeypadPanelPosition( this.keypadPanel );

    // execute client-specific hook
    options.onBeginEdit && options.onBeginEdit();
  }

  /**
   * Ends an edit.
   */
  private endEdit(): void {

    // hide the keypad
    assert && assert( this.keypadPanel );
    this.visible = false;
    this.removeChild( this.keypadPanel! );
    this.keypadPanel!.dispose();
    this.keypadPanel = null;

    // execute client-specific hook
    this.onEndEdit && this.onEndEdit();

    // remove reference to valueProperty that was passed to beginEdit
    this.valueProperty = null;
  }

  /**
   * Commits an edit.
   */
  private commitEdit(): void {

    // get the value from the keypad
    assert && assert( this.keypadPanel );
    const keypadString = this.keypadPanel!.keypadString;
    const value = Number( keypadString ); // Careful! Empty keypadString will be converted to 0.

    // if the keypad contains a valid value ...
    if ( keypadString.length > 0 && isValidValue( value, this.zeroIsValid ) ) {
      assert && assert( this.valueProperty );
      this.valueProperty!.value = value;
      this.endEdit();
    }
    else {
      this.cancelEdit(); // not entering a value in the keypad is effectively a cancel
    }
  }

  /**
   * Cancels an edit.
   */
  private cancelEdit(): void {
    this.endEdit();
  }
}

/**
 * Determines if the value from the keypad is a valid entry.
 */
function isValidValue( value: number, zeroIsValid: boolean ): boolean {
  return !isNaN( value ) && !( value === 0 && !zeroIsValid );
}

unitRates.register( 'KeypadLayer', KeypadLayer );