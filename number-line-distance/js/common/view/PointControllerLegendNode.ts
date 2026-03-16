// Copyright 2024-2025, University of Colorado Boulder

/**
 * PointControllerLegendNode serves as a legend and control for swapping which representation is associated
 * with x1 and x2 (or y1 and y2).
 *
 * @author Saurabh Totey
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowShape, { ArrowShapeOptions } from '../../../../scenery-phet/js/ArrowShape.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import HBox, { HBoxOptions } from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node, { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import numberLineDistance from '../../numberLineDistance.js';
import NLDConstants from '../NLDConstants.js';

const TEXT_OPTIONS = {
  font: new MathSymbolFont( 30 ),
  maxWidth: 50
};
const TEXT_SPACING = 8;
const TEXT_ICON_SPACING = 15;

type SelfOptions = EmptySelfOptions;
type PointControllerLegendNodeOptions = SelfOptions & NodeTranslationOptions;

export default class PointControllerLegendNode extends HBox {

  public constructor(
    pointControllerRepresentation1: Node,
    pointControllerRepresentation2: Node,
    isPrimaryControllerSwappedProperty: Property<boolean>,
    orientationProperty: TReadOnlyProperty<Orientation>,
    providedOptions?: PointControllerLegendNodeOptions
  ) {

    const options = optionize<PointControllerLegendNodeOptions, SelfOptions, HBoxOptions>()( {

      // HBoxOptions
      spacing: 20
    }, providedOptions );

    // Make each pointControllerRepresentation have the same effective size, with the pointControllerRepresentation
    // centered in the bounds by default.
    const alignGroup = new AlignGroup();
    const representation1 = alignGroup.createBox( pointControllerRepresentation1 );
    const representation2 = alignGroup.createBox( pointControllerRepresentation2 );

    // x1 =
    // y1 =
    const symbol1StringProperty = new DerivedStringProperty(
      [ orientationProperty, NLDConstants.X_1_STRING, NLDConstants.Y_1_STRING ],
      ( orientation, x1, y1 ) => ( orientation === Orientation.HORIZONTAL ) ? x1 : y1 );
    const symbol1Text = new RichText( symbol1StringProperty, TEXT_OPTIONS );
    const equals1Text = new Text( MathSymbols.EQUAL_TO, TEXT_OPTIONS );
    const symbol1HBox = new HBox( {
      children: [ symbol1Text, equals1Text ],
      spacing: TEXT_SPACING
    } );

    // x2 =
    // y2 =
    const symbol2StringProperty = new DerivedStringProperty(
      [ orientationProperty, NLDConstants.X_2_STRING, NLDConstants.Y_2_STRING ],
      ( orientation, x2, y2 ) => ( orientation === Orientation.HORIZONTAL ) ? x2 : y2 );
    const symbol2Text = new RichText( symbol2StringProperty, TEXT_OPTIONS );
    const equals2Text = new Text( MathSymbols.EQUAL_TO, TEXT_OPTIONS );
    const symbol2HBox = new HBox( {
      children: [ symbol2Text, equals2Text ],
      spacing: TEXT_SPACING
    } );

    const topHBox = new HBox( {
      children: [ symbol1HBox, representation1 ],
      spacing: TEXT_ICON_SPACING
    } );
    const bottomHBox = new HBox( {
      children: [ symbol2HBox, representation2 ],
      spacing: TEXT_ICON_SPACING
    } );
    const vBox = new VBox( {
      children: [ topHBox, bottomHBox ],
      spacing: 1,
      align: 'left'
    } );

    // Button that swaps the primary point controller and secondary point controller when pressed.
    // Padding and dilations were determined empirically.
    const swapButton = new RectangularPushButton( {
      content: new SwapIcon(),
      baseColor: 'white',
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      listener: () => { isPrimaryControllerSwappedProperty.value = !isPrimaryControllerSwappedProperty.value; }
    } );

    options.children = [ vBox, swapButton ];

    super( options );

    // Swap the representations.
    isPrimaryControllerSwappedProperty.link( isPrimaryControllerSwapped => {

      // Don't have the Nodes handled by layout of multiple containers at once.
      topHBox.getChildren().forEach( child => child.detach() );
      bottomHBox.getChildren().forEach( child => child.detach() );

      if ( isPrimaryControllerSwapped ) {
        topHBox.children = [ symbol1HBox, representation2 ];
        bottomHBox.children = [ symbol2HBox, representation1 ];
      }
      else {
        topHBox.children = [ symbol1HBox, representation1 ];
        bottomHBox.children = [ symbol2HBox, representation2 ];
      }
    } );
  }
}

/**
 * A node that has paths that depict a 'swap' icon which is nearly a half-ellipse with arrows at the end.
 * The half-ellipse is on the right with arrows on the left pointing to the left.
 * All numbers/values used herein were determined empirically.
 */
class SwapIcon extends Node {

  public constructor() {

    const ellipseAngleInset = Math.PI / 12;
    const arrowSize = 5;
    const arrowShapeOptions: ArrowShapeOptions = {
      tailWidth: 0,
      headHeight: arrowSize,
      headWidth: arrowSize
    };
    const arrowXTranslation = 4;
    const arrowYTranslation = 10;

    const pathOptions = {
      stroke: 'black',
      lineWidth: 4
    };

    super( {
      children: [
        new Path(
          new Shape().ellipticalArc( 0, 0, 8, 12, 0,
            -Math.PI / 2 + ellipseAngleInset, Math.PI / 2 - ellipseAngleInset ),
          pathOptions
        ),
        new Path(
          new ArrowShape( 0, 0, -arrowSize, arrowSize, arrowShapeOptions )
            .transformed( Matrix3.translation( arrowXTranslation, arrowYTranslation ) ),
          pathOptions
        ),
        new Path(
          new ArrowShape( 0, 0, -arrowSize, -arrowSize, arrowShapeOptions )
            .transformed( Matrix3.translation( arrowXTranslation, -arrowYTranslation ) ),
          pathOptions
        )
      ]
    } );
  }
}

numberLineDistance.register( 'PointControllerLegendNode', PointControllerLegendNode );