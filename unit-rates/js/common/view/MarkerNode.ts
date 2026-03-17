// Copyright 2016-2025, University of Colorado Boulder

/**
 * Marker on the double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import unitRates from '../../unitRates.js';
import Marker from '../model/Marker.js';
import URConstants from '../URConstants.js';
import URUtils from '../URUtils.js';

type SelfOptions = {
  ySpacing?: number;
  font?: PhetFont;
  lineLength?: number;
  lineWidth?: number;
};

export type MarkerNodeOptions = SelfOptions & NodeTranslationOptions;

export default class MarkerNode extends Node {

  public readonly marker: Marker;
  private readonly disposeMarkerNode: () => void;

  public constructor( marker: Marker, providedOptions?: MarkerNodeOptions ) {

    const options = optionize<MarkerNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      ySpacing: 1,
      font: new PhetFont( 12 ),
      lineLength: URConstants.MAJOR_MARKER_LENGTH,
      lineWidth: 1
    }, providedOptions );

    // vertical line
    const lineNode = new Line( 0, 0, 0, options.lineLength, {
      lineWidth: options.lineWidth
    } );

    // numerator
    const numeratorNode = new Text( '', { font: options.font } );
    const numeratorObserver = ( numerator: number ) => {
      numeratorNode.string = URUtils.numberToString( numerator, marker.numeratorAxis.maxDecimals, marker.numeratorAxis.trimZeros );
      numeratorNode.centerX = lineNode.centerX;
      numeratorNode.bottom = lineNode.top - options.ySpacing;
    };
    marker.numeratorProperty.link( numeratorObserver );

    // denominator
    const denominatorNode = new Text( '', { font: options.font } );
    const denominatorObserver = ( denominator: number ) => {
      denominatorNode.string = URUtils.numberToString( denominator, marker.denominatorAxis.maxDecimals, marker.denominatorAxis.trimZeros );
      denominatorNode.centerX = lineNode.centerX;
      denominatorNode.top = lineNode.bottom + options.ySpacing;
    };
    marker.denominatorProperty.link( denominatorObserver );

    options.children = [ numeratorNode, lineNode, denominatorNode ];

    super( options );

    this.marker = marker;

    // update the marker's color
    const colorObserver = ( color: Color | string ) => {
      lineNode.stroke = color;
      numeratorNode.fill = color;
      denominatorNode.fill = color;
    };
    marker.colorProperty.link( colorObserver );

    this.disposeMarkerNode = () => {
      marker.numeratorProperty.unlink( numeratorObserver );
      marker.denominatorProperty.unlink( denominatorObserver );
      marker.colorProperty.unlink( colorObserver );
    };
  }

  public override dispose(): void {
    this.disposeMarkerNode();
    super.dispose();
  }
}

unitRates.register( 'MarkerNode', MarkerNode );