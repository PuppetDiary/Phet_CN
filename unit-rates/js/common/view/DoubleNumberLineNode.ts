// Copyright 2016-2025, University of Colorado Boulder

/**
 * Displays a double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import unitRates from '../../unitRates.js';
import DoubleNumberLine from '../model/DoubleNumberLine.js';
import Marker from '../model/Marker.js';
import URConstants from '../URConstants.js';
import MarkerNode, { MarkerNodeOptions } from './MarkerNode.js';

type SelfOptions = {

  // common to all axes (horizontal and vertical)
  axisColor?: Color | string;
  axisLineWidth?: number;

  // horizontal axes
  axisViewLength?: number; // view length of doubleNumberLine's range
  arrowSize?: Dimension2; // size of arrows on axes
  axisYSpacing?: number; // vertical spacing between top and bottom axes
  labelFont?: PhetFont; // font for axis labels
  labelColor?: Color | string; // color of axis labels
  labelMaxWidth?: number;
  labelXSpacing?: number; // horizontal spacing between axis and its label

  // markers
  majorMarkerLength?: number;
  minorMarkerLength?: number;

  // Optional position indicator (vertical line).
  // Used in the Racing Lab screen to indicate the current position of the race car.
  indicatorXProperty?: TReadOnlyProperty<number> | null; // position of vertical indicator line, in model coordinates
  indicatorColor?: Color | string;
};

export type DoubleNumberLineNodeOptions = SelfOptions;

export default class DoubleNumberLineNode extends Node {

  public readonly axisViewLength: number;
  private readonly markersParent: Node; // parent for markers, to maintain rendering order
  public readonly outOfRangeXOffset: number; // position for things that are "out of range", halfway between arrows and labels

  public constructor( doubleNumberLine: DoubleNumberLine, providedOptions?: DoubleNumberLineNodeOptions ) {

    const options = optionize<DoubleNumberLineNodeOptions, SelfOptions, NodeOptions>()( {

      // DoubleNumberLineNodeOptions
      axisColor: 'black',
      axisLineWidth: 1.5,
      axisViewLength: 1000,
      arrowSize: new Dimension2( 8, 8 ),
      axisYSpacing: 20,
      labelFont: new PhetFont( 14 ),
      labelColor: 'black',
      labelMaxWidth: 70,
      labelXSpacing: 12,
      majorMarkerLength: URConstants.MAJOR_MARKER_LENGTH,
      minorMarkerLength: URConstants.MINOR_MARKER_LENGTH,
      indicatorXProperty: null,
      indicatorColor: 'green',

      // NodeOptions
      isDisposable: false
    }, providedOptions );

    super();

    this.axisViewLength = options.axisViewLength;

    // All other nodes are positioned relative to this one
    const verticalAxis = new Line( 0, -options.minorMarkerLength / 2, 0, options.minorMarkerLength / 2, {
      stroke: options.axisColor,
      lineWidth: options.axisLineWidth
    } );
    this.addChild( verticalAxis );

    // Double number line's maximum should be just to the left of the axis' arrow head
    const horizontalAxisLength = this.axisViewLength + options.arrowSize.height + 10;

    // numerator axis
    const numeratorAxisNode = new ArrowNode( 0, 0, horizontalAxisLength, 0, {
      fill: options.axisColor,
      stroke: null,
      headWidth: options.arrowSize.width,
      headHeight: options.arrowSize.height,
      tailWidth: options.axisLineWidth,
      x: verticalAxis.x,
      y: verticalAxis.centerY - ( options.axisYSpacing / 2 )
    } );
    this.addChild( numeratorAxisNode );

    // numerator axis label
    const numeratorAxisText = new Text( doubleNumberLine.numeratorAxis.unitsStringProperty, {
      font: options.labelFont,
      fill: options.labelColor,
      maxWidth: options.labelMaxWidth,
      left: numeratorAxisNode.right + options.labelXSpacing,
      centerY: numeratorAxisNode.centerY,
      children: [ new HStrut( options.labelMaxWidth ) ] // makes labels for all items the same width
    } );
    this.addChild( numeratorAxisText );

    // denominator axis
    const denominatorAxisNode = new ArrowNode( 0, 0, horizontalAxisLength, 0, {
      fill: options.axisColor,
      stroke: null,
      headWidth: options.arrowSize.width,
      headHeight: options.arrowSize.height,
      tailWidth: options.axisLineWidth,
      y: verticalAxis.centerY + ( options.axisYSpacing / 2 )
    } );
    this.addChild( denominatorAxisNode );

    // denominator axis label
    const denominatorAxisText = new Text( doubleNumberLine.denominatorAxis.unitsStringProperty, {
      font: options.labelFont,
      fill: options.labelColor,
      maxWidth: options.labelMaxWidth,
      left: denominatorAxisNode.right + options.labelXSpacing,
      centerY: denominatorAxisNode.centerY,
      children: [ new HStrut( options.labelMaxWidth ) ] // makes labels for all items the same width
    } );
    this.addChild( denominatorAxisText );

    // position indicator (vertical line)
    let indicatorXObserver: ( x: number ) => void;
    if ( options.indicatorXProperty ) {
      const indicatorNode = new Line( 0, 0, 0, options.axisYSpacing, {
        stroke: options.indicatorColor,
        lineWidth: 4,
        // horizontal position set by indicatorXObserver
        centerY: verticalAxis.centerY
      } );
      this.addChild( indicatorNode );

      indicatorXObserver = ( x: number ) => {
        indicatorNode.centerX = doubleNumberLine.modelToViewNumerator( x, this.axisViewLength );
      };
      options.indicatorXProperty.link( indicatorXObserver );
    }

    this.markersParent = new Node();
    this.addChild( this.markersParent );

    this.mutate( options );

    this.outOfRangeXOffset = horizontalAxisLength + ( options.labelXSpacing / 2 );

    // when a Marker is added, add a MarkerNode
    const markerAddedListener = ( marker: Marker ) => {

      // The model may contain markers that don't fit on the view scale
      if ( doubleNumberLine.markerIsInRange( marker ) ) {
        this.addMarkerNode( marker, {
          lineLength: marker.isMajor ? options.majorMarkerLength : options.minorMarkerLength,
          centerX: doubleNumberLine.modelToViewDenominator( marker.denominatorProperty.value, this.axisViewLength ),
          centerY: verticalAxis.centerY
        } );
      }
    };
    doubleNumberLine.markers.addItemAddedListener( markerAddedListener );

    // when a Marker is removed, remove the corresponding MarkerNode
    const markerRemovedListener = ( marker: Marker ) => {
      this.removeMarkerNode( marker );
    };
    doubleNumberLine.markers.addItemRemovedListener( markerRemovedListener );

    // Add a MarkNode for each initial Marker
    doubleNumberLine.markers.forEach( markerAddedListener.bind( this ) );
  }

  /**
  /**
   * Adds a MarkerNode to the double number line.
   */
  private addMarkerNode( marker: Marker, options?: MarkerNodeOptions ): void {
    phet.log && phet.log( `addMarker ${marker}` );
    assert && assert( !this.getMarkerNode( marker ), `already have a MarkerNode for ${marker}` );
    const markerNode = new MarkerNode( marker, options );
    this.markersParent.addChild( markerNode );
  }

  /**
   * Removes a MarkerNode from the double number line.
   */
  private removeMarkerNode( marker: Marker ): void {
    phet.log && phet.log( `removeMarker ${marker}` );

    // find the node that is associated with the marker
    const markerNode = this.getMarkerNode( marker );

    // the model may contain markers that aren't displayed, because they are outside the range of the view axes
    if ( markerNode ) {
      this.markersParent.removeChild( markerNode );
      markerNode.dispose();
    }
  }

  /**
   * Gets the MarkerNode that is associated with marker.
   * @returns null if there is no MarkerNode associated with marker
   */
  private getMarkerNode( marker: Marker ): MarkerNode | null {

    const markerNodes = this.markersParent.getChildren() as MarkerNode[];
    assert && assert( _.every( markerNodes, markerNode => markerNode instanceof MarkerNode ) );

    let markerNode: MarkerNode | null = null;
    for ( let i = 0; i < markerNodes.length && !markerNode; i++ ) {
      if ( markerNodes[ i ].marker === marker ) {
        markerNode = markerNodes[ i ];
      }
    }
    return markerNode;
  }
}

unitRates.register( 'DoubleNumberLineNode', DoubleNumberLineNode );