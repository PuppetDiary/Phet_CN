// Copyright 2020-2025, University of Colorado Boulder

/**
 * DynamicOperationDescription instances are used to provide a textual description of a number line operation BEFORE it
 * becomes active on the number line.  It updates, fades in and out, and animates as the user prepares and ultimately
 * adds the operation to the number line.  Instances of this class position themselves in view space based on what the
 * user is doing with an operation, so they are not meant to be positioned by the client. This class is very specific to
 * the Number Line Operation simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import Operation from '../../common/model/Operation.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

// constants
const FADE_TIME = 0.25; // in seconds
const TRAVEL_TIME = 0.7; // in seconds
const FONT = new PhetFont( 22 );

class DynamicOperationDescription extends Node {

  /**
   * @param {BooleanProperty} operationDescriptionsVisibleProperty - general viz param, the label will never be shown
   * when this is false
   * @param {Vector2} inactivePosition
   * @param {Vector2} activePosition
   * @param {NumberLineOperation} operation
   * @param {number} operationIDNumber - number that is used in conjunction with the selected selectedOperationIDProperty
   * to determine if this is the operation that the user is manipulating
   * @param {NumberProperty} selectedOperationIDProperty - the ID number of the operation that the user is manipulating
   * @param {OperationTrackingNumberLine} numberLine - the number line on which this operation is affiliated
   * @param {BooleanProperty} resetInProgressProperty - used to distinguish changes due to user interaction from those
   * caused by a reset
   * @param {BooleanProperty} operationEntryCarouselInFocusProperty - used to prevent this from being shown when
   * user actions from outside the operation entry carousels, such as an erase, causes changes to the operation
   * @param {Object} [options]
   */
  constructor(
    operationDescriptionsVisibleProperty,
    inactivePosition,
    activePosition,
    operation,
    operationIDNumber,
    selectedOperationIDProperty,
    numberLine,
    resetInProgressProperty,
    operationEntryCarouselInFocusProperty,
    options
  ) {

    // This is intended to be constructed prior to the operation becoming active.
    assert && assert( !operation.isActiveProperty.value, 'operation must be inactive when this node is constructed' );

    const addOrRemoveProperty = new DerivedProperty( [ operation.operationTypeProperty, NumberLineOperationsStrings.addStringProperty, NumberLineOperationsStrings.removeStringProperty ],
      ( operationType, addString, removeString ) => operationType === Operation.ADDITION ? addString : removeString );

    const addRemoveZeroStringProperty = new PatternStringProperty( NumberLineOperationsStrings.addRemoveZeroCurrencyPatternStringProperty, {
      addOrRemove: addOrRemoveProperty,
      currencyUnits: NumberLineOperationsStrings.currencyUnitsStringProperty
    } );

    const assetOrDebtProperty = new DerivedProperty( [ operation.amountProperty, NumberLineOperationsStrings.assetStringProperty, NumberLineOperationsStrings.debtStringProperty ],
      ( amount, assetString, debtString ) => amount > 0 ? assetString : debtString );
    const addRemoveAssetDebtStringProperty = new PatternStringProperty( NumberLineOperationsStrings.addRemoveAssetDebtPatternStringProperty, {
      addOrRemove: addOrRemoveProperty,
      assetOrDebt: assetOrDebtProperty,
      currencyUnits: NumberLineOperationsStrings.currencyUnitsStringProperty,
      value: operation.amountProperty
    }, {
      maps: {
        value: value => Math.abs( value )
      }
    } );


    const addRemoveZeroText = new Text( addRemoveZeroStringProperty, merge( {
      font: FONT,
      center: inactivePosition,
      visibleProperty: DerivedProperty.valueEqualsConstant( operation.amountProperty, 0 )
    }, options ) );

    const addRemoveAssetDebtText = new Text( addRemoveAssetDebtStringProperty, merge( {
      font: FONT,
      center: inactivePosition,
      visibleProperty: new DerivedProperty( [ operation.amountProperty ], amount => amount !== 0 )
    }, options ) );

    // Construct with no initial text and in the inactive position.
    super( {
      children: [ addRemoveZeroText, addRemoveAssetDebtText ],
      visible: false,
      opacity: 0,
      excludeInvisibleChildrenFromBounds: true
    } );

    // @private - location to which the description will animate when becoming active on the number line
    this.activePosition = activePosition;

    // Control overall visibility, unlink not needed.
    operationDescriptionsVisibleProperty.linkAttribute( this, 'visible' );

    // Update the text as the attributes of the operation change.
    Multilink.multilink(
      [ operation.amountProperty, operation.operationTypeProperty ],
      () => {
        this.center = inactivePosition;
      }
    );

    // Listen for changes to the attributes of the operation and, if the other conditions check out, initiate a fade-in
    // when changes occur.
    Multilink.lazyMultilink(
      [ operationDescriptionsVisibleProperty, operation.amountProperty, operation.operationTypeProperty ],
      () => {
        if ( !resetInProgressProperty.value && operationDescriptionsVisibleProperty.value &&
             operationEntryCarouselInFocusProperty.value &&
             selectedOperationIDProperty.value === operationIDNumber && !operation.isActiveProperty.value &&
             this.opacity === 0 ) {
          this.initiateFadeIn();
        }
      }
    );

    // Handle changes to the selected operation.  No unlink is necessary.
    selectedOperationIDProperty.lazyLink( selectedOperationID => {

      if ( !operation.isActiveProperty.value && operationEntryCarouselInFocusProperty.value ) {

        // Fade out if visible and a different operation gets selected, fade in if this one becomes selected.
        if ( selectedOperationID !== operationIDNumber && this.opacity > 0 ) {
          this.initiateFadeOut();
        }
        else if ( selectedOperationID === operationIDNumber && this.opacity === 0 ) {
          this.initiateFadeIn();
        }
      }
    } );

    // Fade out if visible and the focus moves away from the operation entry controls.  No unlink needed.
    operationEntryCarouselInFocusProperty.link( operationEntryCarouselInFocus => {
      if ( this.opacity > 0 && !operationEntryCarouselInFocus ) {
        this.initiateFadeOut();
      }
    } );

    ManualConstraint.create( this, [ addRemoveZeroText, addRemoveAssetDebtText ], () => {
      if ( operation.isActiveProperty.value ) {
        this.center = this.activePosition;
      }
      else {
        this.center = inactivePosition;
      }
    } );

    // Handle changes to the 'isActive' state of the operation.  The description for active operations is shown near the
    // operation, whereas the description for inactive operations are shown in a different position or not at all.  No
    // unlink is needed.  No unlink is necessary.
    operation.isActiveProperty.lazyLink( isActive => {

      if ( isActive ) {

        if ( this.opacity !== 1 ) {

          // If the operation becomes active while invisible or fading in, instantly make it fully visible.
          this.cancelInProgressAnimations();
          this.opacity = 1;
        }

        // Head to the "active" position.
        this.initiateMovementToActivePosition();
      }
      else {

        // Go back to the inactive position (without animation).
        this.center = inactivePosition;

        // If the focus is on the carousel, that indicates that the operation was erased from the number line using the
        // operation entry control.  In this case, fade in.
        if ( operationEntryCarouselInFocusProperty.value ) {
          this.initiateFadeIn();
        }
        else {

          // The operation was cleared due to a reset or external erase by the user, so this should be invisible.
          this.opacity = 0;
        }
      }
    } );

    // Go instantly invisible on a reset, unlink not needed.
    resetInProgressProperty.lazyLink( resetInProgress => {
      if ( resetInProgress ) {
        this.cancelInProgressAnimations();
        this.opacity = 0;
      }
    } );

    // @private {Animation|null} - animations that are used to fade and move this node, null when inactive
    this.movementAnimation = null;
    this.fadeAnimation = null;
  }

  /**
   * @private
   */
  initiateFadeIn( preFadeInDelay = 0 ) {

    this.cancelInProgressAnimations();

    // Create and start the fade-in animation.
    this.fadeAnimation = new Animation( {
      duration: FADE_TIME,
      delay: preFadeInDelay,
      targets: [
        {
          object: this,
          attribute: 'opacity',
          from: this.opacity,
          to: 1,
          easing: Easing.LINEAR
        }
      ]
    } );
    this.fadeAnimation.finishEmitter.addListener( () => {
      this.fadeAnimation = null;
    } );
    this.fadeAnimation.start();
  }

  /**
   * Cancel the fade animation if it exists, do nothing if it doesn't.
   * @private
   */
  cancelInProgressAnimations() {
    if ( this.fadeAnimation ) {
      this.fadeAnimation.stop();
    }
    if ( this.movementAnimation ) {
      this.movementAnimation.stop();
    }
  }

  /**
   * @private
   */
  initiateFadeOut() {

    this.cancelInProgressAnimations();

    // Create and start the fade-out animation.
    this.fadeAnimation = new Animation( {
      duration: FADE_TIME,
      targets: [
        {
          object: this,
          attribute: 'opacity',
          from: this.opacity,
          to: 0,
          easing: Easing.LINEAR
        }
      ]
    } );
    this.fadeAnimation.finishEmitter.addListener( () => {
      this.fadeAnimation = null;
    } );
    this.fadeAnimation.start();
  }

  /**
   * @private
   */
  initiateMovementToActivePosition() {

    // If the node is already on its way, there is no need to re-initiate.
    if ( !this.movementAnimation ) {

      // Create and start the fade-out animation.
      this.movementAnimation = new Animation( {
        duration: TRAVEL_TIME,
        targets: [
          {
            object: this,
            attribute: 'centerY',
            from: this.centerY,
            to: this.activePosition.y,
            easing: Easing.QUINTIC_IN
          }
        ]
      } );
      this.movementAnimation.finishEmitter.addListener( () => {
        this.movementAnimation = null;
        this.initiateFadeOut();
      } );
      this.movementAnimation.start();
    }
  }
}

numberLineOperations.register( 'DynamicOperationDescription', DynamicOperationDescription );
export default DynamicOperationDescription;