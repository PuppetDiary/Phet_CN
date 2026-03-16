// Copyright 2023-2025, University of Colorado Boulder

/**
 * IntervalToolNode displays the IntervalTool, which allows the user to select an interval in the data set. It can be
 * dragged by either handle and also by the main readout (to translate). It can also be dragged via keyboard.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import isResettingAllProperty from '../../../../scenery-phet/js/isResettingAllProperty.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import DragListener, { DragListenerOptions, PressedDragListener } from '../../../../scenery/js/listeners/DragListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import AccessibleSlider, { AccessibleSliderOptions } from '../../../../sun/js/accessibility/AccessibleSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import phetAudioContext from '../../../../tambo/js/phetAudioContext.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import intervalTool_wav from '../../../sounds/intervalTool_wav.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import IntervalTool from '../model/IntervalTool.js';

const edgeFilter = new BiquadFilterNode( phetAudioContext, {
  type: 'lowpass',
  Q: 1,
  frequency: 800
} );

const centerFilter = new BiquadFilterNode( phetAudioContext, {
  type: 'bandpass',
  Q: 1,
  frequency: 600
} );

const edgeSoundClip = new SoundClip( intervalTool_wav, {
  additionalAudioNodes: [ edgeFilter ],
  initialOutputLevel: 0.4
} );
const centerSoundClip = new SoundClip( intervalTool_wav, {
  additionalAudioNodes: [ centerFilter ],
  initialOutputLevel: 0.6
} );
const minSoundClip = new SoundClip( intervalTool_wav, {
  initialPlaybackRate: 0.8,
  initialOutputLevel: 0.2
} );
const maxSoundClip = new SoundClip( intervalTool_wav, {
  initialPlaybackRate: 2.5,
  initialOutputLevel: 0.2
} );

soundManager.addSoundGenerator( edgeSoundClip );
soundManager.addSoundGenerator( centerSoundClip );
soundManager.addSoundGenerator( minSoundClip );
soundManager.addSoundGenerator( maxSoundClip );

type SelfOptions = {
  isIcon: boolean;
};
export type IntervalToolNodeOptions = SelfOptions & WithRequired<NodeOptions, 'tandem'>;

const SPHERE_RADIUS = 9;
const TEXT_PANEL_BOUNDS_DILATION = 5;

export default class IntervalToolNode extends Node {

  // The horizontal arrow indicates the width of the interval
  private readonly arrowNode: ArrowNode;

  // The edge 1 label is only visible while the interval tool is being stretched via the edge1 handle
  private readonly edge1Label: PDLText;

  // The edge 2 label is only visible while the interval tool is being stretched via the edge2 handle
  private readonly edge2Label: PDLText;

  // The center line label is only visible while the interval tool is being translated via the center readout
  private readonly centerLineLabel: PDLText;

  // The center line is only visible while the interval tool is being translationally dragged (via keyboard or mouse)
  private readonly centerLineNode: Line;

  // This Property represents whether the user is dragging via the edge1 handle, which stretches the interval.
  private readonly isEdge1DraggingProperty = new BooleanProperty( false );

  // This Property represents whether the user is dragging via the edge2 handle, which stretches the interval.
  private readonly isEdge2DraggingProperty = new BooleanProperty( false );

  // This Property represents whether the user is dragging via the center readout, which translates the entire interval.
  private readonly isCenterDraggingProperty = new BooleanProperty( false );

  public constructor( intervalTool: IntervalTool, isIntervalToolVisibleProperty: TReadOnlyProperty<boolean>, modelViewTransform: ModelViewTransform2, providedOptions: IntervalToolNodeOptions ) {

    const options = optionize<IntervalToolNodeOptions, SelfOptions, NodeOptions>()( {
      phetioFeatured: true,
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions );
    super( options );

    const lineOptions = {
      stroke: PDLColors.intervalToolLineStrokeProperty,
      lineWidth: 2
    };

    const edge1Line = new Line( Vector2.ZERO, Vector2.ZERO, lineOptions );
    const edge2Line = new Line( Vector2.ZERO, Vector2.ZERO, lineOptions );
    this.addChild( edge1Line );
    this.addChild( edge2Line );

    // This is a downstream Property (only updated in the update function) that is used for sonification and the center position label.
    // IntervalTool.centerXProperty may go out of range, so we use this Property to clamp the value.
    const centerPositionSonificationProperty = new NumberProperty( ( intervalTool.edge1Property.value + intervalTool.edge2Property.value ) / 2 );

    class DraggableShadedSphereNode extends AccessibleSlider( Node, 0 ) {
      public constructor( options: AccessibleSliderOptions ) {
        super( options );

        this.addChild( new ShadedSphereNode( 2 * SPHERE_RADIUS, {
          mainColor: PDLColors.intervalToolSphereFillProperty,
          translation: Vector2.ZERO
        } ) );
      }
    }

    const edge1Sphere = new DraggableShadedSphereNode( {
      valueProperty: intervalTool.edge1Property,
      enabledRangeProperty: new Property( new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ) )
    } );
    const edge2Sphere = new DraggableShadedSphereNode( {
      valueProperty: intervalTool.edge2Property,
      enabledRangeProperty: new Property( new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ) )
    } );

    const height = 71;
    edge1Sphere.touchArea = edge1Sphere.localBounds.dilatedY( height ).shiftY( height );
    edge2Sphere.touchArea = edge2Sphere.localBounds.dilatedY( height ).shiftY( height );

    edge1Sphere.mouseArea = edge1Sphere.localBounds.dilatedY( height ).shiftY( height );
    edge2Sphere.mouseArea = edge2Sphere.localBounds.dilatedY( height ).shiftY( height );

    this.addChild( edge1Sphere );
    this.addChild( edge2Sphere );

    const ARROW_HEAD_WIDTH = 8;

    this.arrowNode = new ArrowNode( 0, 0, 0, 0, {
      doubleHead: true,
      isHeadDynamic: true,
      scaleTailToo: true,
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_WIDTH,
      fractionalHeadHeight: 0.3,
      tailWidth: 1,
      stroke: 'black'
    } );

    this.addChild( this.arrowNode );

    const roundedValueProperty = ( numberProperty: Property<number> ) => new DerivedProperty( [ numberProperty ], number => {
      return Utils.toFixed( number, 1 );
    } );

    const edge1HasFocusProperty = new BooleanProperty( edge1Sphere.focused );
    edge1Sphere.addInputListener( {
      focus: () => { edge1HasFocusProperty.value = true; },
      blur: () => { edge1HasFocusProperty.value = false; }
    } );

    const edge2HasFocusProperty = new BooleanProperty( edge2Sphere.focused );
    edge2Sphere.addInputListener( {
      focus: () => { edge2HasFocusProperty.value = true; },
      blur: () => { edge2HasFocusProperty.value = false; }
    } );

    this.edge1Label = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.meanMPatternStringProperty, {
      mean: roundedValueProperty( intervalTool.edge1Property )
    } ), {
      font: PDLConstants.INTERVAL_TOOL_FONT,
      maxWidth: 100,
      visibleProperty: DerivedProperty.or( [ this.isEdge1DraggingProperty, edge1HasFocusProperty ] )
    } );

    this.edge2Label = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.meanMPatternStringProperty, {
      mean: roundedValueProperty( intervalTool.edge2Property )
    } ), {
      font: PDLConstants.INTERVAL_TOOL_FONT,
      maxWidth: 100,
      visibleProperty: DerivedProperty.or( [ this.isEdge2DraggingProperty, edge2HasFocusProperty ] )
    } );

    this.addChild( this.edge1Label );
    this.addChild( this.edge2Label );

    const getIntervalString = () => {
      return Utils.toFixed( Math.abs( intervalTool.edge2Property.value - intervalTool.edge1Property.value ), 1 );
    };

    const intervalProperty = new Property( getIntervalString() );
    intervalTool.edge1Property.link( () => {
      intervalProperty.value = getIntervalString();
    } );
    intervalTool.edge2Property.link( () => {
      intervalProperty.value = getIntervalString();
    } );

    // Pattern for the interval readout, not instrumented and hence does not support studio autoselect.
    const intervalReadoutStringProperty = new PatternStringProperty( ProjectileDataLabStrings.intervalMPatternStringProperty, {
      interval: intervalProperty
    } );

    const intervalText = new PDLText( intervalReadoutStringProperty, {
      font: PDLConstants.INTERVAL_TOOL_FONT,
      maxWidth: 100
    } );
    const intervalReadout = new Panel( intervalText );

    const nonNullProperty = new DerivedProperty( [ intervalTool.dataFractionProperty ], fraction => {
      if ( fraction === null ) {
        return 0;
      }
      else {
        return Utils.toFixed( fraction * 100, 1 );
      }
    } );

    // Pattern for the percent readout, not instrumented and hence does not support studio autoselect.
    const percentPatternProperty = new PatternStringProperty( ProjectileDataLabStrings.percentPatternStringProperty, {
      percent: nonNullProperty
    } );

    const percentReadout = new Panel( new PDLText( percentPatternProperty, {
      font: PDLConstants.INTERVAL_TOOL_FONT,
      maxWidth: 100
    } ) );
    percentPatternProperty.link( () => {
      percentReadout.mouseArea = percentReadout.localBounds.dilatedXY( TEXT_PANEL_BOUNDS_DILATION, TEXT_PANEL_BOUNDS_DILATION );
      percentReadout.touchArea = percentReadout.localBounds.dilatedXY( TEXT_PANEL_BOUNDS_DILATION, TEXT_PANEL_BOUNDS_DILATION );
    } );

    class ReadoutVBox extends AccessibleSlider( Node, 0 ) {
      public constructor( options: AccessibleSliderOptions ) {
        super( options );
        this.addChild( new VBox( {
          children: [ intervalReadout, percentReadout ],
          spacing: 4
        } ) );
      }
    }

    // This is where the UI wants to put the center.
    const desiredCenterLocationProperty = new Property( new Vector2( 50, 0 ), {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // The drag listener requires a Vector2 instead of a number, so we need to create a DynamicProperty to convert between the two
    const createDynamicAdapterProperty = ( property: Property<number> ) => {
      return new DynamicProperty( new Property( property ), {
        bidirectional: true,
        map: function( value: number ) { return new Vector2( value, 0 );},
        inverseMap: function( value: Vector2 ) { return value.x; }
      } );
    };

    // Vector2 => number
    const createAlternateDynamicProperty = ( property: Property<Vector2> ) => {
      return new DynamicProperty( new Property( property ), {
        bidirectional: true,
        map: function( value: Vector2 ) { return value.x; },
        inverseMap: function( value: number ) { return new Vector2( value, 0 ); }
      } );
    };

    const separation = Math.abs( intervalTool.edge1Property.value - intervalTool.edge2Property.value );
    const centerDragBoundsProperty = new Property( new Bounds2( separation / 2, -1000, PDLConstants.MAX_FIELD_DISTANCE - separation / 2, 1000 ) );

    const centerDragBounds1DProperty = new DerivedProperty( [ centerDragBoundsProperty ], bounds => new Range( bounds.minX, bounds.maxX ) );

    const readoutVBox = new ReadoutVBox( {
      valueProperty: createAlternateDynamicProperty( desiredCenterLocationProperty ),
      enabledRangeProperty: centerDragBounds1DProperty,
      startDrag: () => { this.isCenterDraggingProperty.value = true; },
      endDrag: () => { this.isCenterDraggingProperty.value = false; }
    } );

    const centerHasFocusProperty = new BooleanProperty( readoutVBox.focused );
    readoutVBox.addInputListener( {
      focus: () => { centerHasFocusProperty.value = true; },
      blur: () => { centerHasFocusProperty.value = false; }
    } );

    // The correct geometry for the center line will be set in update()
    this.centerLineNode = new Line( 0, 0, 0, 0, {
      stroke: 'black',
      lineWidth: 1,
      visibleProperty: DerivedProperty.or( [ this.isCenterDraggingProperty, centerHasFocusProperty ] )
    } );

    this.addChild( this.centerLineNode );

    this.centerLineLabel = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.meanMPatternStringProperty, {
      mean: roundedValueProperty( centerPositionSonificationProperty )
    } ), {
      font: PDLConstants.INTERVAL_TOOL_FONT,
      maxWidth: 100,
      visibleProperty: DerivedProperty.or( [ this.isCenterDraggingProperty, centerHasFocusProperty ] )
    } );

    this.addChild( this.centerLineLabel );
    this.addChild( readoutVBox );

    const update = () => {
      const viewEdge1X = modelViewTransform.modelToViewX( intervalTool.edge1Property.value );
      const viewEdge2X = modelViewTransform.modelToViewX( intervalTool.edge2Property.value );

      const SPHERE_Y = modelViewTransform.modelToViewY( 17.2 );
      const LABEL_Y = modelViewTransform.modelToViewY( 18.7 );
      const ARROW_Y = modelViewTransform.modelToViewY( 14.25 );

      // The icon has shorter legs
      const y0 = modelViewTransform.modelToViewY( options.isIcon ? 5 : 0 );

      edge1Sphere.center = new Vector2( viewEdge1X, SPHERE_Y );
      edge2Sphere.center = new Vector2( viewEdge2X, SPHERE_Y );

      edge1Line.setLine( viewEdge1X, SPHERE_Y, viewEdge1X, y0 );
      edge2Line.setLine( viewEdge2X, SPHERE_Y, viewEdge2X, y0 );

      this.edge1Label.centerX = viewEdge1X;
      this.edge2Label.centerX = viewEdge2X;

      this.edge1Label.bottom = LABEL_Y;
      this.edge2Label.bottom = LABEL_Y;
      this.centerLineLabel.bottom = LABEL_Y;

      const centerX = ( viewEdge1X + viewEdge2X ) / 2;
      this.centerLineLabel.centerX = centerX;
      this.centerLineNode.setLine( centerX, SPHERE_Y - SPHERE_RADIUS, centerX, y0 );

      // Note if the edge1 and edge2 are the same, the arrow will have the empty bounds
      this.arrowNode.setTailAndTip( viewEdge1X, ARROW_Y, viewEdge2X, ARROW_Y );

      intervalReadout.mouseArea = intervalReadout.localBounds.dilatedXY( TEXT_PANEL_BOUNDS_DILATION, TEXT_PANEL_BOUNDS_DILATION );
      intervalReadout.touchArea = intervalReadout.localBounds.dilatedXY( TEXT_PANEL_BOUNDS_DILATION, TEXT_PANEL_BOUNDS_DILATION );

      readoutVBox.centerX = ( viewEdge1X + viewEdge2X ) / 2;
      readoutVBox.top = ARROW_Y - intervalReadout.height / 2;

      // Update the downstream Property which is only used for sonification.
      centerPositionSonificationProperty.value = ( intervalTool.edge1Property.value + intervalTool.edge2Property.value ) / 2;
    };

    intervalTool.dataFractionProperty.link( update );
    intervalTool.edge1Property.link( update );
    intervalTool.edge2Property.link( update );

    update();
    percentPatternProperty.link( update );
    intervalReadoutStringProperty.link( update );

    const moveToFront = ( node: Node ) => {
      return () => {
        node.moveToFront();

        // The readout should always be in front of the handles
        readoutVBox.moveToFront();
      };
    };

    const dragListenerOptions: DragListenerOptions = {
      useInputListenerCursor: true,
      dragBoundsProperty: new Property<Bounds2 | null>( new Bounds2( 0, 0, PDLConstants.MAX_FIELD_DISTANCE, 0 ) )
    };

    const edge1DragListenerOptions = {
      start: () => { this.isEdge1DraggingProperty.value = true; },
      end: () => { this.isEdge1DraggingProperty.value = false; },
      transform: modelViewTransform
    };

    const edge2DragListenerOptions = {
      start: () => { this.isEdge2DraggingProperty.value = true; },
      end: () => { this.isEdge2DraggingProperty.value = false; },
      transform: modelViewTransform
    };

    const centerDragListenerOptions = {
      start: () => {this.isCenterDraggingProperty.value = true;},
      end: () => { this.isCenterDraggingProperty.value = false;},
      transform: modelViewTransform
    };

    edge1Sphere.addInputListener( new DragListener( combineOptions<DragListenerOptions<PressedDragListener>>( {
      positionProperty: createDynamicAdapterProperty( intervalTool.edge1Property ),
      tandem: providedOptions.tandem.createTandem( 'edge1DragListener' ),
      drag: moveToFront( edge1Sphere )
    }, edge1DragListenerOptions, dragListenerOptions ) ) );

    edge2Sphere.addInputListener( new DragListener( combineOptions<DragListenerOptions<PressedDragListener>>( {
      positionProperty: createDynamicAdapterProperty( intervalTool.edge2Property ),
      tandem: providedOptions.tandem.createTandem( 'edge2DragListener' ),
      drag: moveToFront( edge2Sphere )
    }, edge2DragListenerOptions, dragListenerOptions ) ) );

    desiredCenterLocationProperty.lazyLink( ( value: Vector2, oldValue: Vector2 ) => {

      // During a drag, update the edge positions based on the center drag. During a reset all, this would cause an
      // infinite loop, and the edges are reset elsewhere, so this can be avoided during reset all.
      if ( this.isCenterDraggingProperty.value && !isResettingAllProperty.value ) {
        let delta = value.x - oldValue.x;

        const max = Math.max( intervalTool.edge1Property.value, intervalTool.edge2Property.value );
        const min = Math.min( intervalTool.edge1Property.value, intervalTool.edge2Property.value );

        if ( max + delta > PDLConstants.MAX_FIELD_DISTANCE ) {
          delta = PDLConstants.MAX_FIELD_DISTANCE - max;
        }
        if ( min + delta < 0 ) {
          delta = -min;
        }

        intervalTool.edge1Property.setDeferred( true );
        intervalTool.edge2Property.setDeferred( true );

        // If the interval tool handles move within this distance of the edge of the field, put them on the edge.
        // This may cause a negligible change in the interval tool width, but it is necessary to ensure that the
        // handles play a 'min' or 'max' sound when they reach the edge of the field. Note that there is already some
        // imprecision in the interval tool width (even when not at the edges of the field) due to floating point arithmetic.
        const EDGE_SOUND_THRESHOLD = 1e-10;

        const desiredEdge1Position = intervalTool.edge1Property.value + delta;
        const desiredEdge2Position = intervalTool.edge2Property.value + delta;

        if ( desiredEdge1Position <= EDGE_SOUND_THRESHOLD ) {
          intervalTool.edge1Property.value = 0;
        }
        else if ( desiredEdge1Position >= PDLConstants.MAX_FIELD_DISTANCE - EDGE_SOUND_THRESHOLD ) {
          intervalTool.edge1Property.value = PDLConstants.MAX_FIELD_DISTANCE;
        }
        else {
          intervalTool.edge1Property.value = desiredEdge1Position;
        }

        if ( desiredEdge2Position <= EDGE_SOUND_THRESHOLD ) {
          intervalTool.edge2Property.value = 0;
        }
        else if ( desiredEdge2Position >= PDLConstants.MAX_FIELD_DISTANCE - EDGE_SOUND_THRESHOLD ) {
          intervalTool.edge2Property.value = PDLConstants.MAX_FIELD_DISTANCE;
        }
        else {
          intervalTool.edge2Property.value = desiredEdge2Position;
        }

        const a = intervalTool.edge1Property.setDeferred( false );
        const b = intervalTool.edge2Property.setDeferred( false );

        a && a();
        b && b();

      }
    } );

    // When the user stops dragging either edge, synchronize the center with the midpoint of the edges.
    // We do not subscribe to intervalTool.edge1Property or intervalTool.edge2Property because we only want to update the desiredCenterLocationProperty when the user stops dragging.
    Multilink.multilink( [ this.isEdge1DraggingProperty, this.isEdge2DraggingProperty ], ( isEdge1Dragging, isEdge2Dragging ) => {
      if ( !isEdge1Dragging || !isEdge2Dragging ) {
        desiredCenterLocationProperty.value = new Vector2( ( intervalTool.edge1Property.value + intervalTool.edge2Property.value ) / 2, 0 );
      }
    } );

    // When dragging an edge or resetting, update the drag bounds of the center so that it can't go out of bounds with the new separation.
    Multilink.multilink( [ intervalTool.edge1Property, intervalTool.edge2Property, this.isCenterDraggingProperty,
        this.isEdge1DraggingProperty, this.isEdge2DraggingProperty, isResettingAllProperty ],
      ( edge1, edge2, isCenterDragging, isEdge1Dragging, isEdge2Dragging, isResettingAll ) => {
        const isDraggingEdgeOnly = ( isEdge1Dragging || isEdge2Dragging ) && !isCenterDragging;
        if ( isDraggingEdgeOnly || isResettingAll ) {
          desiredCenterLocationProperty.value = new Vector2( ( edge1 + edge2 ) / 2, 0 );

          const separation = Math.abs( edge1 - edge2 );
          centerDragBoundsProperty.value = new Bounds2( separation / 2, -1000, PDLConstants.MAX_FIELD_DISTANCE - separation / 2, 1000 );
        }
      } );

    readoutVBox.addInputListener( new DragListener( combineOptions<DragListenerOptions<PressedDragListener>>( {
      applyOffset: true,
      useParentOffset: true,
      positionProperty: desiredCenterLocationProperty,
      tandem: providedOptions.tandem.createTandem( 'centerDragListener' )
    }, centerDragListenerOptions, {
      useInputListenerCursor: true,
      dragBoundsProperty: centerDragBoundsProperty
    } ) ) );

    // Play a ratcheting sound as either edge is dragged. The sound is played when passing thresholds on the field,
    // but the sound played is a function of the width of the interval.
    const edgePlaybackRateMapper = ( value: number ) => Utils.linear( 0, 100, 3, 1, value );

    const edgeValueChangeSoundPlayer = new ValueChangeSoundPlayer( new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ), {
      middleMovingUpSoundPlayer: edgeSoundClip,
      middleMovingDownSoundPlayer: edgeSoundClip,
      middleMovingUpPlaybackRateMapper: edgePlaybackRateMapper,
      middleMovingDownPlaybackRateMapper: edgePlaybackRateMapper,
      interThresholdDelta: 2,
      minSoundPlayer: nullSoundPlayer,
      maxSoundPlayer: nullSoundPlayer
    } );

    const createEdgeSonificationListener = ( otherEdgeProperty: { value: number } ) => {
      return ( newValue: number, oldValue: number ) => {
        if ( isResettingAllProperty.value ) {
          return;
        }

        if ( !this.isCenterDraggingProperty.value ) {
          const newWidth = otherEdgeProperty.value - newValue;
          const oldWidth = otherEdgeProperty.value - oldValue;

          edgeValueChangeSoundPlayer.playSoundIfThresholdReached( Math.abs( newWidth ), Math.abs( oldWidth ) );
        }

        // Play the boundary sound if the edges reach the min/max, either by stretching or translating the tool
        if ( newValue === 0 ) {
          minSoundClip.play();
        }
        else if ( newValue === PDLConstants.MAX_FIELD_DISTANCE ) {
          maxSoundClip.play();
        }
      };
    };

    intervalTool.edge1Property.lazyLink( createEdgeSonificationListener( intervalTool.edge2Property ) );
    intervalTool.edge2Property.lazyLink( createEdgeSonificationListener( intervalTool.edge1Property ) );

    // Play a sound when the interval tool is being translated, and its center crosses a threshold value.
    // The sound played is a function of the horizontal position of the center position.
    const centerPlaybackRateMapper = ( value: number ) => Utils.linear( 0, 100, 0.8, 3, value );

    const centerValueChangeSoundPlayer = new ValueChangeSoundPlayer( new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ), {
      middleMovingUpSoundPlayer: centerSoundClip,
      middleMovingDownSoundPlayer: centerSoundClip,
      middleMovingUpPlaybackRateMapper: centerPlaybackRateMapper,
      middleMovingDownPlaybackRateMapper: centerPlaybackRateMapper,
      interThresholdDelta: 2,
      minSoundPlayer: nullSoundPlayer,
      maxSoundPlayer: nullSoundPlayer
    } );

    centerPositionSonificationProperty.lazyLink( ( newValue: number, oldValue: number ) => {
      if ( this.isCenterDraggingProperty.value && !isResettingAllProperty.value ) {
        centerValueChangeSoundPlayer.playSoundIfThresholdReached( newValue, oldValue );
      }
    } );

    this.pdomOrder = [
      edge1Sphere,
      edge2Sphere,
      readoutVBox
    ];

    this.addLinkedElement( intervalTool );

    isIntervalToolVisibleProperty.link( visible => {
      if ( !visible ) {
        this.interruptSubtreeInput();
      }
    } );
  }
}

projectileDataLab.register( 'IntervalToolNode', IntervalToolNode );