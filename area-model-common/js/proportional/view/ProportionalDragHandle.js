// Copyright 2017-2026, University of Colorado Boulder

/**
 * Shows a draggable circle to the lower-right of a proportional area that, when dragged, adjusts the width/height to
 * match.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Shape from '../../../../kite/js/Shape.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import KeyboardDragListener from '../../../../scenery/js/listeners/KeyboardDragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

// constants
const DRAG_OFFSET = 8;
const DRAG_RADIUS = 10.5;
const CIRCLE_DRAG_OFFSET = DRAG_OFFSET + Math.sqrt( 2 ) / 2 * DRAG_RADIUS;

class ProportionalDragHandle extends Node {
  /**
   * @param {Property.<ProportionalArea>} areaProperty
   * @param {OrientationPair.<Property.<number>>} activeTotalProperties
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Emitter} interruptDragListenerEmitter
   */
  constructor(
    areaProperty,
    activeTotalProperties,
    modelViewTransformProperty,
    interruptDragListenerEmitter ) {

    // {Property.<boolean>} - Whether this is being dragged (we only apply offsets when dragged)
    const draggedProperty = new BooleanProperty( false );

    // The current view "offset" from where the pointer is compared to the point it is controlling
    const offsetProperty = new Vector2Property( new Vector2( 0, 0 ) );

    const line = new Line( {
      stroke: AreaModelCommonColors.proportionalDragHandleBorderProperty
    } );

    const circle = new Circle( DRAG_RADIUS, combineOptions( {}, AccessibleDraggableOptions, {
      touchArea: Shape.circle( 0, 0, DRAG_RADIUS * 2 ),
      focusHighlight: Shape.circle( 0, 0, DRAG_RADIUS * 1.5 ),
      fill: AreaModelCommonColors.proportionalDragHandleBackgroundProperty,
      stroke: AreaModelCommonColors.proportionalDragHandleBorderProperty,
      cursor: 'pointer',

      // pdom
      accessibleName: AreaModelCommonStrings.a11y.dragHandleStringProperty
    } ) );

    // Potential workaround for https://github.com/phetsims/area-model-common/issues/173 (Safari SVG dirty region issue)
    circle.addChild( new Circle( DRAG_RADIUS + 10, {
      pickable: false,
      fill: 'transparent'
    } ) );

    circle.descriptionContent = new PatternStringProperty( AreaModelCommonStrings.a11y.dragHandleDescriptionPatternStringProperty, {
      width: new DerivedProperty( [ areaProperty ], area => area.maximumSize ),
      height: new DerivedProperty( [ areaProperty ], area => area.maximumSize )
    } );

    let initialOffset;

    // Range of the sounds changes based on the current area changing
    const soundPlayerRangeProperty = new DerivedProperty( [ areaProperty ], area => new Range( area.minimumSize, area.maximumSize ) );
    const valueChangeSoundPlayer = new ValueChangeSoundPlayer( soundPlayerRangeProperty );

    function updateOffsetProperty( event, listener ) {
      const area = areaProperty.value;
      const modelViewTransform = modelViewTransformProperty.value;

      // We use somewhat complicated drag code, since we both snap AND have an offset from where the pointer
      // actually is (and we want it to be efficient).
      const pointerViewPoint = listener.parentPoint;
      const viewPoint = pointerViewPoint.minusScalar( CIRCLE_DRAG_OFFSET ).minus( initialOffset );
      const modelPoint = modelViewTransform.viewToModelPosition( viewPoint );

      const snapSizeInverse = 1 / area.snapSize;

      let width = Utils.roundSymmetric( modelPoint.x * snapSizeInverse ) / snapSizeInverse;
      let height = Utils.roundSymmetric( modelPoint.y * snapSizeInverse ) / snapSizeInverse;

      width = Utils.clamp( width, area.minimumSize, area.maximumSize );
      height = Utils.clamp( height, area.minimumSize, area.maximumSize );

      // Treat each orientation as a separate "slider-like" slider interaction, but never play two sounds at once.
      const oldWidth = activeTotalProperties.horizontal.value;
      const oldHeight = activeTotalProperties.vertical.value;
      if ( oldWidth !== width ) {
        valueChangeSoundPlayer.playSoundForValueChange( width, oldWidth );
      }
      else if ( oldHeight !== height ) {
        valueChangeSoundPlayer.playSoundForValueChange( height, oldHeight );
      }

      activeTotalProperties.horizontal.value = width;
      activeTotalProperties.vertical.value = height;

      offsetProperty.value = new Vector2(
        viewPoint.x - modelViewTransform.modelToViewX( width ),
        viewPoint.y - modelViewTransform.modelToViewY( height )
      );
    }

    super( {
      children: [
        line,
        circle
      ]
    } );

    const dragListener = new SoundDragListener( {
      targetNode: this,
      applyOffset: false,
      start: ( event, listener ) => {
        initialOffset = listener.localPoint.minusScalar( CIRCLE_DRAG_OFFSET );
        updateOffsetProperty( event, listener );
      },
      drag: updateOffsetProperty
    } );
    dragListener.isPressedProperty.link( draggedProperty.set.bind( draggedProperty ) );

    // Interrupt the drag when one of our parameters changes
    areaProperty.lazyLink( dragListener.interrupt.bind( dragListener ) );
    modelViewTransformProperty.lazyLink( dragListener.interrupt.bind( dragListener ) );
    circle.addInputListener( dragListener );

    interruptDragListenerEmitter.addListener( () => {
      dragListener.interrupt();
    } );

    const positionProperty = new Vector2Property( new Vector2( 0, 0 ) );

    function updatePositionProperty() {
      positionProperty.value = new Vector2(
        activeTotalProperties.horizontal.value,
        activeTotalProperties.vertical.value
      );
    }

    updatePositionProperty();
    positionProperty.lazyLink( position => {
      activeTotalProperties.horizontal.value = position.x;
      activeTotalProperties.vertical.value = position.y;
    } );
    activeTotalProperties.horizontal.lazyLink( updatePositionProperty );
    activeTotalProperties.vertical.lazyLink( updatePositionProperty );

    let keyboardListener;
    Multilink.multilink( [ areaProperty, modelViewTransformProperty ], ( area, modelViewTransform ) => {
      if ( keyboardListener ) {
        circle.interruptInput();
        circle.removeInputListener( keyboardListener );
        keyboardListener.dispose();
      }
      keyboardListener = new KeyboardDragListener( {
        dragDelta: modelViewTransform.modelToViewDeltaX( area.snapSize ),
        shiftDragDelta: modelViewTransform.modelToViewDeltaX( area.snapSize ),
        transform: modelViewTransform,
        drag: ( event, listener ) => {
          const delta = listener.modelDelta;

          let width = activeTotalProperties.horizontal.value;
          let height = activeTotalProperties.vertical.value;

          width += delta.x;
          height += delta.y;

          width = Utils.roundToInterval( Utils.clamp( width, area.minimumSize, area.maximumSize ), area.snapSize );
          height = Utils.roundToInterval( Utils.clamp( height, area.minimumSize, area.maximumSize ), area.snapSize );

          activeTotalProperties.horizontal.value = width;
          activeTotalProperties.vertical.value = height;
        },
        moveOnHoldDelay: 750,
        moveOnHoldInterval: 70
      } );

      circle.addInputListener( keyboardListener );
    } );

    // Apply offsets while dragging for a smoother experience.
    // See https://github.com/phetsims/area-model-common/issues/3
    Multilink.multilink( [ draggedProperty, offsetProperty ], ( dragged, offset ) => {
      let combinedOffset = 0;
      if ( dragged ) {
        // Project to the line y=x, and limit for when the user goes to 1x1 or the max.
        combinedOffset = Utils.clamp( ( offset.x + offset.y ) / 2, -10, 10 );
      }
      line.x2 = line.y2 = combinedOffset + DRAG_OFFSET;
      circle.x = circle.y = combinedOffset + CIRCLE_DRAG_OFFSET;
    } );

    // Update the offset of the drag handle
    Orientation.enumeration.values.forEach( orientation => {
      Multilink.multilink(
        [ activeTotalProperties.get( orientation ), modelViewTransformProperty ],
        ( value, modelViewTransform ) => {
          this[ orientation.coordinate ] = orientation.modelToView( modelViewTransform, value );
        } );
    } );
  }
}

areaModelCommon.register( 'ProportionalDragHandle', ProportionalDragHandle );

export default ProportionalDragHandle;