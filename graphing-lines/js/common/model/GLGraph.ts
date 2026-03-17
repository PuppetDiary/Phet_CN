// Copyright 2025, University of Colorado Boulder

/**
 * Model of a simple 2D graph.  Used in the icon as well as the sim screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Range from '../../../../dot/js/Range.js';
import graphingLines from '../../graphingLines.js';
import Line from './Line.js';
import Graph from './Graph.js';

export default class GLGraph extends Graph {

  public readonly lines: ObservableArray<Line>; // lines that the graph is currently displaying

  public constructor( xRange: Range, yRange: Range ) {
    super( xRange, yRange );
    this.lines = createObservableArray();
  }
}

graphingLines.register( 'GLGraph', GLGraph );