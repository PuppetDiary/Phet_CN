// Copyright 2023-2025, University of Colorado Boulder

/**
 * The FieldSignNode contains the field sign, which displays text about the field number and landed projectiles.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox, { VBoxOptions } from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import projectileDataLab from '../../projectileDataLab.js';
import Field from '../model/Field.js';
import PDLColors from '../PDLColors.js';
import SelectorNode from './SelectorNode.js';

type SelfOptions = EmptySelfOptions;
export type FieldSignNodeOptions = SelfOptions & VBoxOptions;

export default class FieldSignNode extends VBox {
  public constructor(
    fieldProperty: TReadOnlyProperty<Field>,
    headingText: Node,
    selectorNode: SelectorNode,
    signPostHeight: number,
    providedOptions: FieldSignNodeOptions ) {

    const options = optionize<FieldSignNodeOptions, SelfOptions, VBoxOptions>()( {
      stretch: true
    }, providedOptions );

    super( options );

    const headingContainer = new Path( Shape.rect( 0, 0, 1, 1 ) );
    headingContainer.addChild( headingText );

    fieldProperty.link( field => {
      headingContainer.fill = field.color.darkerColor( 0.9 );
    } );

    const selectorContainer = new Path( Shape.rect( 0, 0, 1, 1 ), {
      fill: 'white'
    } );

    selectorContainer.addChild( selectorNode );
    selectorContainer.center = headingContainer.center;

    // The minimum height of the text node
    const MIN_HEADING_AREA_HEIGHT = 29;

    // The vertical margin around the text in the heading container
    const HEADING_MARGIN_Y = 6;

    // The margins around the selector node
    const SIGN_MARGIN_X = 7;
    const SELECTOR_MARGIN_Y = 12;

    ManualConstraint.create( this, [ headingText, selectorNode ], ( headingTextProxy, selectorNodeProxy ) => {

      const signWidth = Math.max( headingTextProxy.width + 2 * SIGN_MARGIN_X, selectorNodeProxy.width + 2 * SIGN_MARGIN_X );
      const headingTextHeight = Math.max( headingTextProxy.height + 2 * HEADING_MARGIN_Y, MIN_HEADING_AREA_HEIGHT );

      headingContainer.shape = Shape.roundedRectangleWithRadii( 0, 0, signWidth, headingTextHeight, {
        bottomLeft: 0,
        bottomRight: 0,
        topRight: 5,
        topLeft: 5
      } );

      selectorContainer.shape = Shape.roundedRectangleWithRadii( 0, 0, signWidth, selectorNodeProxy.height + 2 * SELECTOR_MARGIN_Y, {
        bottomLeft: 5,
        bottomRight: 5,
        topRight: 0,
        topLeft: 0
      } );

      headingText.centerX = headingContainer.width / 2;
      headingText.centerY = headingContainer.height / 2;

      selectorNode.centerX = selectorContainer.width / 2;
      selectorNode.centerY = selectorContainer.height / 2;
    } );

    const createSignPost = () => {
      const signPostWidth = 5;
      const signPostEllipseHeight = 3;

      const signPostRect = new Rectangle( 0, -0, signPostWidth, signPostHeight, {
        fill: PDLColors.fieldSignPostFillProperty
      } );

      const signPostBase = new Path( new Shape().ellipse( new Vector2( 0.5 * signPostWidth, signPostHeight ),
        0.5 * signPostWidth, 0.5 * signPostEllipseHeight, 0 ), {
        fill: PDLColors.fieldSignPostFillProperty
      } );

      return new Node( {
        children: [ signPostRect, signPostBase ]
      } );
    };

    const leftPost = createSignPost();
    const rightPost = createSignPost();

    const signPostContainer = new HBox( {
      xMargin: 28,
      children: [ leftPost, rightPost ]
    } );

    this.addChild( headingContainer );
    this.addChild( selectorContainer );
    this.addChild( signPostContainer );
  }
}
projectileDataLab.register( 'FieldSignNode', FieldSignNode );