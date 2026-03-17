// Copyright 2014-2025, University of Colorado Boulder

/**
 * Type that represents a dataPoint in the view.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import DataPoint from '../model/DataPoint.js';

export default class DataPointNode extends Node {

  /**
   * @param dataPoint - The DataPoint model instance.
   * @param representation - The visual representation Node of the DataPoint.
   * @param modelViewTransform - The ModelViewTransform2 instance for coordinate transformations.
   */
  public constructor(
    dataPoint: DataPoint,
    representation: Node,
    modelViewTransform: ModelViewTransform2
  ) {
    super( { cursor: 'pointer', children: [ representation ] } );

    // Create a listener to the position of the dataPoint
    const centerPositionListener = ( position: Vector2 ) => {
      this.center = modelViewTransform.modelToViewPosition( position );
    };

    // Move this node as the model representation moves
    dataPoint.positionProperty.link( centerPositionListener );

    this.disposeEmitter.addListener( () => {
      dataPoint.positionProperty.unlink( centerPositionListener );
    } );
  }
}

leastSquaresRegression.register( 'DataPointNode', DataPointNode );