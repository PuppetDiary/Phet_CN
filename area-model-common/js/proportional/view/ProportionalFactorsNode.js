// Copyright 2017-2026, University of Colorado Boulder

/**
 * Displays and allows editing of the total width and height of the contained area.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import validate from '../../../../axon/js/validate.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonQueryParameters from '../../common/AreaModelCommonQueryParameters.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

class ProportionalFactorsNode extends Node {
  /**
   * @param {Property.<Area>} currentAreaProperty
   * @param {OrientationPair.<Property.<number>>} activeTotalProperties
   * @param {number} decimalPlaces - The number of decimal places to show in the picker (when needed)
   * @param {Emitter} interruptDragListenerEmitter - Emits when user input should interrupt drag listeners
   */
  constructor( currentAreaProperty, activeTotalProperties, decimalPlaces, interruptDragListenerEmitter ) {
    super();
    this.interruptDragListenerEmitter = interruptDragListenerEmitter;

    if ( AreaModelCommonQueryParameters.rawMath ) {
      this.tagName = 'div';
      this.innerContent = new PatternStringProperty( AreaModelCommonStrings.a11y.factorsTimesPatternStringProperty, {
        width: activeTotalProperties.horizontal,
        height: activeTotalProperties.vertical
      } );
    }
    else {
      const ns = 'http://www.w3.org/1998/Math/MathML';
      const verticalNode = new Node( {

        // pdom
        tagName: 'mn',
        pdomNamespace: ns
      } );
      activeTotalProperties.vertical.link( verticalTotal => {
        verticalNode.innerContent = `${verticalTotal}`;
      } );
      const horizontalNode = new Node( {

        // pdom
        tagName: 'mn',
        pdomNamespace: ns
      } );
      activeTotalProperties.horizontal.link( horizontalTotal => {
        horizontalNode.innerContent = `${horizontalTotal}`;
      } );

      const mathNode = new Node( {
        tagName: 'math',
        pdomNamespace: ns,
        children: [
          new Node( {
            tagName: 'mrow',
            pdomNamespace: ns,
            children: [
              verticalNode,
              new Node( {
                tagName: 'mo',
                pdomNamespace: ns,
                innerContent: '&times;'
              } ),
              horizontalNode
            ]
          } )
        ]
      } );
      this.addChild( mathNode );
    }

    this.addChild( new HBox( {
      children: [
        this.createPicker( Orientation.VERTICAL, currentAreaProperty, decimalPlaces ),
        new Text( MathSymbols.TIMES, { font: AreaModelCommonConstants.FACTORS_TERM_FONT } ),
        this.createPicker( Orientation.HORIZONTAL, currentAreaProperty, decimalPlaces )
      ],
      spacing: 10
    } ) );
  }

  /**
   * Creates a picker that adjusts the specified orientation's total size.
   * @private
   *
   * @param {Orientation} orientation
   * @param {Property.<Area>} currentAreaProperty
   * @param {number} decimalPlaces
   */
  createPicker( orientation, currentAreaProperty, decimalPlaces ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    // {Property.<Property.<Polynomial|null>>}
    const currentTotalProperty = new DerivedProperty( [ currentAreaProperty ], area => area.activeTotalProperties.get( orientation ) );

    // {Property.<Polynomial|null>}
    const bidirectionalProperty = new DynamicProperty( currentTotalProperty, {
      bidirectional: true
    } );

    // {Property.<Range>}
    const rangeProperty = new DerivedProperty( [ currentAreaProperty ], area => new Range( area.minimumSize, area.maximumSize ) );

    return new NumberPicker( bidirectionalProperty, rangeProperty, {
      onInput: () => this.interruptDragListenerEmitter.emit(),
      incrementFunction: value => Utils.toFixedNumber( value + currentAreaProperty.value.snapSize, decimalPlaces ),
      decrementFunction: value => Utils.toFixedNumber( value - currentAreaProperty.value.snapSize, decimalPlaces ),
      decimalPlaces: decimalPlaces,
      scale: 1.5,
      formatValue: value => {
        // Epsilon chosen to avoid round-off errors while not "rounding" any values in the decimals sims improperly.
        if ( Utils.equalsEpsilon( value, Utils.roundSymmetric( value ), 1e-6 ) ) {
          return Utils.toFixed( value, 0 );
        }
        else {
          return Utils.toFixed( value, 1 );
        }
      },
      color: AreaModelCommonColors.proportionalColorProperties.get( orientation ),

      // pdom
      labelContent: orientation === Orientation.HORIZONTAL ? AreaModelCommonStrings.a11y.horizontalPickerStringProperty : AreaModelCommonStrings.a11y.verticalPickerStringProperty,
      descriptionContent: orientation === Orientation.HORIZONTAL ? AreaModelCommonStrings.a11y.horizontalPickerDescriptionStringProperty : AreaModelCommonStrings.a11y.verticalPickerDescriptionStringProperty,
      mapPDOMValue: value => Utils.toFixedNumber( value, decimalPlaces )
    } );
  }
}

areaModelCommon.register( 'ProportionalFactorsNode', ProportionalFactorsNode );

export default ProportionalFactorsNode;