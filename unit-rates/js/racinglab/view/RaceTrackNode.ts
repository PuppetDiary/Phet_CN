// Copyright 2017-2025, University of Colorado Boulder

/**
 * Displays a complete race track in the 'Racing Lab' screen, including:
 * - track
 * - start and finish flags
 * - race car
 * - timer
 *
 * The starting line flag is at x = 0.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import finishFlag_png from '../../../images/finishFlag_png.js';
import startFlag_png from '../../../images/startFlag_png.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import RaceCar from '../model/RaceCar.js';
import RaceTimerNode from './RaceTimerNode.js';

// constants
const NEGATIVE_TRACK_LENGTH = 65; // length of track to left of starting flag, in view coordinates
const CUE_ARROW_LENGTH = 28; // length of the 'drag cue' arrows around the finish flag
const CUE_ARROW_OPTIONS = {
  fill: 'rgb( 33, 190, 156 )',
  lineWidth: 0.5,
  headWidth: 20,
  headHeight: 16,
  tailWidth: 7
};
const TRACK_MARKER_SIDE_LENGTH = 5;
const TRACK_MARKER_OPTIONS = {
  fill: 'black',
  stroke: null
};

type SelfOptions = {
  trackViewLength: number; // view length of the track
  timerTitleStringProperty: TReadOnlyProperty<string>; // title for the timer accordion box
};

type RaceTrackNodeOptions = SelfOptions & NodeTranslationOptions;

export default class RaceTrackNode extends Node {

  /**
   * @param car
   * @param timerExpandedProperty
   * @param arrowsVisibleProperty - are the 'drag cue' arrows are visible?
   * @param providedOptions
   */
  public constructor( car: RaceCar, timerExpandedProperty: BooleanProperty, arrowsVisibleProperty: BooleanProperty,
                      providedOptions: RaceTrackNodeOptions ) {

    const options = optionize<RaceTrackNodeOptions, SelfOptions, NodeOptions>()( {

      // NodeOptions
      isDisposable: false
    }, providedOptions );

    // maps 'miles' between model and view coordinate frames
    const modelToView = new LinearFunction( 0, car.track.maxLength, 0, options.trackViewLength );

    // Dashed line shows the maximum track length, revealed when the track is shortened.
    const dashedLineNode = new Line( 0, 0, options.trackViewLength, 0, {
      stroke: 'gray',
      lineWidth: 0.5,
      lineDash: [ 5, 5 ]
    } );

    // Solid line shows the actual track length.
    const solidLineNode = new Line( -NEGATIVE_TRACK_LENGTH, 0, options.trackViewLength, 0, {
      stroke: 'black',
      lineWidth: 1
    } );

    // markers below the track
    const markerNodes: Node[] = [];
    for ( let x = 0; x <= car.track.maxLength; ) {

      // create marker
      const markerNode = createMarkerNode();
      markerNodes.push( markerNode );

      // position marker
      markerNode.centerX = modelToView.evaluate( x );
      markerNode.top = solidLineNode.bottom;

      // next marker
      x = x + car.track.markerSpacing;
    }
    const markersParent = new Node( { children: markerNodes } );
    markersParent.top = solidLineNode.centerY;

    // Flag at starting line
    const startFlagNode = new Image( startFlag_png, {
      scale: 0.5,
      left: 0,
      bottom: 0
    } );

    // Flag at finish line
    const finishFlagNode = new Image( finishFlag_png, {
      cursor: 'pointer',
      scale: 0.5,
      left: modelToView.evaluate( car.track.lengthProperty.value ),
      bottom: 0
    } );
    finishFlagNode.touchArea = finishFlagNode.localBounds.dilatedX( 30 );
    finishFlagNode.mouseArea = finishFlagNode.localBounds.dilatedX( 30 );

    // green arrows around the finish flag, cues the user to drag the flag
    const cueArrowsNode = new HBox( {
      interruptSubtreeOnInvisible: false, // because arrows are draggable, see https://github.com/phetsims/unit-rates/issues/229
      cursor: 'pointer',
      spacing: 9,
      children: [
        new ArrowNode( 0, 0, -CUE_ARROW_LENGTH, 0, CUE_ARROW_OPTIONS ),
        new ArrowNode( 0, 0, CUE_ARROW_LENGTH, 0, CUE_ARROW_OPTIONS )
      ],
      centerX: finishFlagNode.left,
      bottom: finishFlagNode.bottom - 2
    } );

    // Timer, dispose required
    const timerNode = new RaceTimerNode( car.timeProperty, timerExpandedProperty, options.timerTitleStringProperty );

    // Label that indicates the length of the track
    const lengthNode = new Text( '', {
      font: new PhetFont( 12 ),
      maxWidth: timerNode.width // i18n
    } );

    // Car
    const carNode = new Image( car.image, {
      scale: 0.5,
      right: startFlagNode.left,
      bottom: solidLineNode.top
    } );

    options.children = [ dashedLineNode, solidLineNode, markersParent,
      startFlagNode, finishFlagNode, timerNode, lengthNode, cueArrowsNode, carNode ];

    // Synchronize track length with the model
    Multilink.multilink( [ car.track.lengthProperty, UnitRatesStrings.pattern_0value_1unitsStringProperty, UnitRatesStrings.milesStringProperty ],
      ( length, patternString, milesString ) => {

        const finishX = modelToView.evaluate( length );

        // adjust track length
        solidLineNode.setLine( -NEGATIVE_TRACK_LENGTH, 0, finishX, 0 );

        // flag at finish line
        finishFlagNode.left = finishX;
        finishFlagNode.bottom = solidLineNode.centerY;

        // timer above finish flag
        timerNode.centerX = finishX;
        timerNode.bottom = finishFlagNode.top - 3;

        // distance label below finish flag
        lengthNode.string = StringUtils.format( patternString, length, milesString );
        lengthNode.top = solidLineNode.bottom + TRACK_MARKER_SIDE_LENGTH + 4;
        lengthNode.centerX = finishX;

        // grey out markers that are past finish line
        for ( let i = 0; i < markerNodes.length; i++ ) {
          const enabled = ( i * car.track.markerSpacing <= length );
          markerNodes[ i ].opacity = ( enabled ? 1 : 0.4 );
        }
      } );

    super( options );

    // {number} where the drag started relative to the finish flag's current position, in parent view coordinates
    let startDragXOffset: number;

    // Drag the finish flag to change the track length
    const dragListener = new DragListener( {

      // allow touch swipes across a bag to pick it up
      allowTouchSnag: true,

      // Called when a drag sequence starts.
      start: event => {

        // compute offset from current track length
        startDragXOffset = finishFlagNode.globalToParentPoint( event.pointer.point ).x -
                           modelToView.evaluate( car.track.lengthProperty.value );
      },

      // Called when the pointer moves during a drag sequence.
      drag: event => {

        // hide the 'drag cue' arrows
        arrowsVisibleProperty.value = false;

        // compute track length in view coordinates
        const viewLength = finishFlagNode.globalToParentPoint( event.pointer.point ).x - startDragXOffset;

        // convert to model coordinates, constrain to the track length range
        const modelLength = Utils.clamp( modelToView.inverse( viewLength ), 0, car.track.maxLength );

        // update the model, constrain to integer values
        car.track.lengthProperty.value = Utils.toFixedNumber( modelLength, 0 );
      }
    } );
    finishFlagNode.addInputListener( dragListener );
    cueArrowsNode.addInputListener( dragListener );

    // Synchronize car position with model
    // unlink not needed, exists for sim lifetime
    car.distanceProperty.link( distance => {
      carNode.right = modelToView.evaluate( distance );
    } );

    // unlink not needed, exists for sim lifetime
    arrowsVisibleProperty.link( visible => {
      cueArrowsNode.visible = visible;
    } );
  }
}

/**
 * Creates a track marker, an equilateral triangle, with origin at tip.
 */
function createMarkerNode(): Node {
  const markerShape = new Shape()
    .moveTo( 0, 0 )
    .lineTo( TRACK_MARKER_SIDE_LENGTH / 2, TRACK_MARKER_SIDE_LENGTH )
    .lineTo( -TRACK_MARKER_SIDE_LENGTH / 2, TRACK_MARKER_SIDE_LENGTH )
    .close();
  return new Path( markerShape, TRACK_MARKER_OPTIONS );
}

unitRates.register( 'RaceTrackNode', RaceTrackNode );