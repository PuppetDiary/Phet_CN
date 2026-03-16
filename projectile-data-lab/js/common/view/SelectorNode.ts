// Copyright 2024-2025, University of Colorado Boulder

/**
 * Selector node for choosing between a projectile (VSM Screens) or sample (Sampling Screen). Adapted from NumberSpinner
 * in order to maintain a similar look and feel, but also to show arbitrary contents in the display area.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import InstanceRegistry from '../../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import platform from '../../../../phet-core/js/platform.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import KeyboardListener from '../../../../scenery/js/listeners/KeyboardListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import SceneryConstants from '../../../../scenery/js/SceneryConstants.js';
import Color from '../../../../scenery/js/util/Color.js';
import angleLeftSolidShape from '../../../../sherpa/js/fontawesome-5/angleLeftSolidShape.js';
import angleRightSolidShape from '../../../../sherpa/js/fontawesome-5/angleRightSolidShape.js';
import AccessibleNumberSpinner, { AccessibleNumberSpinnerOptions } from '../../../../sun/js/accessibility/AccessibleNumberSpinner.js';
import { FlatAppearanceStrategy } from '../../../../sun/js/buttons/ButtonNode.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = {
  playSound: ( selectedItem: number ) => void;
};
type ParentOptions = AccessibleNumberSpinnerOptions & NodeOptions;
export type SelectorNodeOptions = SelfOptions & StrictOmit<ParentOptions, 'children' | 'valueProperty' | 'enabledRangeProperty' | 'keyboardStep' | 'shiftKeyboardStep' | 'pageKeyboardStep'>;

export default class SelectorNode extends AccessibleNumberSpinner( Node, 0 ) {

  public constructor( contents: Node, numberProperty: TProperty<number> & PhetioObject, rangeProperty: TReadOnlyProperty<Range>, providedOptions?: SelectorNodeOptions ) {

    const options = optionize<SelectorNodeOptions, SelfOptions, ParentOptions>()( {

      // AccessibleSelectorNodeOptions
      valueProperty: numberProperty,
      enabledRangeProperty: rangeProperty,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // The focus highlight surrounds the entire component, but the spinner display is not interactive with
      // mouse and touch events so this highlight is hidden. Instead, default highlights surround the arrow buttons.
      interactiveHighlight: 'invisible',

      // Prevent a spurious white rectangle artifact that appears on Safari when the buttons become enable and disabled
      // which seems to be related to the filters used for the enabled/disabled appearance. See https://github.com/phetsims/projectile-data-lab/issues/178
      layerSplit: platform.safari,

      // PhET-iO
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'SelectorNode',
      phetioFeatured: true,
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    const arrowButtonOptions: RectangularPushButtonOptions = {
      buttonAppearanceStrategy: FlatAppearanceStrategy,
      buttonAppearanceStrategyOptions: {
        lineWidth: 0
      },
      baseColor: new Color( '#54258F' ),
      disabledColor: new Color( '#54258F' ).withAlpha( 0.5 ),
      minWidth: 30,
      xMargin: 5,
      yMargin: 10,
      layoutOptions: {
        stretch: true,
        grow: 0
      },
      fireOnHold: true,
      fireOnHoldInterval: 50,
      scale: 0.8,
      phetioEnabledPropertyInstrumented: false
    };

    // increment button
    const incrementButton = new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {
        soundPlayer: nullSoundPlayer,
        tandem: options.tandem.createTandem( 'incrementButton' ),
        listener: () => {
          numberProperty.set( numberProperty.value + 1 );
          options.playSound( numberProperty.value );
          this.focus();
        },
        content: new Path( angleRightSolidShape, { fill: 'white', scale: 0.05 } ),

        // Individual buttons are non-focusable. This works around a bug on Safari where the focus ring could move to an individual button, see https://github.com/phetsims/projectile-data-lab/issues/255
        focusable: false
      }, arrowButtonOptions )
    );

    // decrement button
    const decrementButton = new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {
        soundPlayer: nullSoundPlayer,
        tandem: options.tandem.createTandem( 'decrementButton' ),
        listener: () => {
          numberProperty.set( numberProperty.value - 1 );
          options.playSound( numberProperty.value );
          this.focus();
        },
        content: new Path( angleLeftSolidShape, { fill: 'white', scale: 0.05 } ),

        // Individual buttons are non-focusable. This works around a bug on Safari where the focus ring could move to an individual button, see https://github.com/phetsims/projectile-data-lab/issues/255
        focusable: false
      }, arrowButtonOptions )
    );

    // Because range may change via rangeProperty, the size of contents may change, in which case layout will need
    // to be revised. See https://github.com/phetsims/sun/issues/709
    const updateLayout = () => {
      incrementButton.left = contents.right + 6;
      decrementButton.right = contents.left - 6;
      incrementButton.centerY = decrementButton.centerY = contents.centerY;
    };
    contents.boundsProperty.link( () => updateLayout() );

    incrementButton.touchArea = incrementButton.localBounds.dilatedXY( 10, 10 );
    decrementButton.touchArea = decrementButton.localBounds.dilatedXY( 10, 10 );
    incrementButton.mouseArea = incrementButton.localBounds.dilatedXY( 10, 10 );
    decrementButton.mouseArea = decrementButton.localBounds.dilatedXY( 10, 10 );

    options.children = [ contents, incrementButton, decrementButton ];

    // pdom - SelectorNode uses AccessibleValueHandler for accessibility, but it was decided that keyboardStep
    // and shiftKeyboardStep should have the same behavior as the SelectorNode ArrowButtons AND the ArrowButtons
    // should look depressed when interacting with those keys. To accomplish this we actually press the ArrowButtons
    // in response to input with those keys. keyboardStep and shiftKeyboardStep are set to zero so the value isn't
    // modified again by AccessibleValueHandler.
    options.keyboardStep = 0;
    options.shiftKeyboardStep = 0;
    options.pageKeyboardStep = 0;

    super( options );

    // enable/disable arrow buttons
    const updateEnabled = () => {
      incrementButton.enabled = numberProperty.value + 1 <= rangeProperty.value.max;
      decrementButton.enabled = numberProperty.value - 1 >= rangeProperty.value.min;
    };

    // synchronize with number value
    numberProperty.link( updateEnabled );
    rangeProperty.link( updateEnabled );

    // pdom - click arrow buttons on press of arrow keys so that the Property value changes by deltaValue
    // and the buttons look depressed
    const increasedListener = ( isDown: boolean ) => isDown && incrementButton.pdomClick();
    const decreasedListener = ( isDown: boolean ) => isDown && decrementButton.pdomClick();
    this.pdomIncrementDownEmitter.addListener( increasedListener );
    this.pdomDecrementDownEmitter.addListener( decreasedListener );

    this.addLinkedElement( numberProperty );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'SelectorNode', this );

    let priorValue: number | null = null;

    assert && assert( this.startInput === _.noop, 'start input should be a no-op before we change it' );
    this.startInput = event => {

      // When input begins, record what the value was before it changes so that when we process a home/end event,
      // we do not play duplicate sounds if it was already at the home/end
      priorValue = numberProperty.value;
    };

    // Add sound effects for pressing the home/end keys. Note this callback is called after the number property was updated.
    // Do not use this.onInput since this would double some of the sounds when the buttons are interacted with in a certain way.
    // See notes in https://github.com/phetsims/sun/issues/886
    this.addInputListener( new KeyboardListener( {
      keys: [ 'home', 'end' ] as const,
      fire: () => {
        if ( numberProperty.value !== priorValue ) {
          options.playSound( numberProperty.value );
        }
      }
    } ) );
  }
}

projectileDataLab.register( 'SelectorNode', SelectorNode );