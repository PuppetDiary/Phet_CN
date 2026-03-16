// Copyright 2020-2025, University of Colorado Boulder

/**
 * TotalValueIndicatorNode is a Scenery node that takes a background node and shows a total value over it, and fills
 * the total value node with different colors based on the total value.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isLeftToRightProperty from '../../../../joist/js/i18n/isLeftToRightProperty.js';
import FillableBackgroundNode from '../../../../number-line-common/js/view/FillableBackgroundNode.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';
import removeEmbeddingMarks from './removeEmbeddingMarks.js';

type SelfOptions = {
  labelCenterOffset?: Vector2; // offset of the label from the center of the background node
  isCurrency?: boolean; // if false, just shows the number, if true, uses a currency symbol and pattern
  zeroFill?: Color; //color values used, and interpolated between, as the total value changes
  mostPositiveFill?: Color;
  leastPositiveFill?: Color;
  mostNegativeFill?: Color;
  leastNegativeFill?: Color;
  labelMaxWidth?: number;
};

type TotalValueIndicatorNodeOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

class TotalValueIndicatorNode extends Node {

  public constructor(
    totalValueProperty: Property<number>,
    fillableBackgroundNode: FillableBackgroundNode,
    range: Range,
    providedOptions: TotalValueIndicatorNodeOptions ) {

    const options = optionize<TotalValueIndicatorNodeOptions, SelfOptions, NodeOptions>()( {
      labelCenterOffset: Vector2.ZERO,
      isCurrency: false,
      zeroFill: Color.WHITE,
      mostPositiveFill: new Color( '#1fb493' ),
      leastPositiveFill: new Color( '#a5e1d4' ),
      mostNegativeFill: new Color( '#fb1d25' ),
      leastNegativeFill: new Color( '#fda5a8' ),
      labelMaxWidth: 54
    }, providedOptions );

    const signProperty = new DerivedProperty( [ totalValueProperty ], totalValue => totalValue < 0 ? '-' : '' );

    let valueStringProperty;
    if ( options.isCurrency ) {
      valueStringProperty = new PatternStringProperty(
        NumberLineOperationsStrings.currencyValuePatternStringProperty,
        {
          sign: signProperty,
          currencyUnits: NumberLineOperationsStrings.currencyUnitsStringProperty,
          value: totalValueProperty
        },
        {
          maps: {
            value: value => Math.abs( value )
          }
        }
      );
    }
    else {
      valueStringProperty = new PatternStringProperty( NumberLineOperationsStrings.currencyValuePatternStringProperty, {
        sign: signProperty,
        currencyUnits: '',
        value: totalValueProperty
      }, {
        maps: { value: value => Math.abs( value ) }
      } );
    }

    // Remove embedding marks from the value string if the text direction is right-to-left.  This is necessary because
    // the code above assembles the sign, currency units, and value into a single string, and our default embedding that
    // was being done messed up the way this looked.  See https://github.com/phetsims/phetcommon/issues/68.
    const nonEmbeddedValueStringProperty = new DerivedProperty( [ valueStringProperty ], valueString =>
      isLeftToRightProperty.value ? valueString : removeEmbeddingMarks( valueString )
    );

    // label that represents the value
    const labelNode = new Text( nonEmbeddedValueStringProperty, {
      font: new PhetFont( 22 ),
      lineWidth: 0.8,
      fill: 'white',
      stroke: 'black',
      center: Vector2.ZERO,
      maxWidth: options.labelMaxWidth
    } );

    const labelAlignBox = new AlignBox( labelNode, { alignBounds: fillableBackgroundNode.bounds, xAlign: 'center' } );

    super( combineOptions<NodeOptions>( { children: [ fillableBackgroundNode, labelAlignBox ] }, options ) );

    // Update the fill and label as the total value changes.  Instances of this type are assumed to exist for the
    // duration of the sim, so no unlink is necessary.
    totalValueProperty.link( totalValue => {

      // Reposition the label.
      labelAlignBox.center = fillableBackgroundNode.center.plus( options.labelCenterOffset );

      // Set the fill.
      let fill = options.zeroFill;
      if ( totalValue < 0 ) {
        fill = Color.interpolateRGBA(
          options.leastNegativeFill,
          options.mostNegativeFill,
          totalValue / range.min
        );
      }
      else if ( totalValue > 0 ) {
        fill = Color.interpolateRGBA(
          options.leastPositiveFill,
          options.mostPositiveFill,
          totalValue / range.max
        );
      }
      fillableBackgroundNode.fill = fill;
    } );
  }
}

numberLineOperations.register( 'TotalValueIndicatorNode', TotalValueIndicatorNode );
export default TotalValueIndicatorNode;