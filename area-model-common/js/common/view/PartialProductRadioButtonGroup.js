// Copyright 2017-2026, University of Colorado Boulder

/**
 * Shows radio buttons that allow selecting between different ways of showing partial products in partitioned areas.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import OrientationPair from '../../../../phet-core/js/OrientationPair.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
import PartialProductsChoice from '../model/PartialProductsChoice.js';
import AreaModelCommonRadioButtonGroup from './AreaModelCommonRadioButtonGroup.js';

class PartialProductRadioButtonGroup extends AreaModelCommonRadioButtonGroup {

  /**
   * @param {AreaModelCommonModel} model
   * @param {AlignGroup} selectionButtonAlignGroup
   */
  constructor( model, selectionButtonAlignGroup ) {

    // hardcoded strings since they shouldn't be translatable
    const templateLabels = OrientationPair.create( orientation => {
      return new Text( orientation === Orientation.HORIZONTAL ? 'b' : 'a', {
        font: AreaModelCommonConstants.SYMBOL_FONT,
        fill: new DerivedProperty(
          [ model.partialProductsChoiceProperty, model.colorProperties.get( orientation ) ],
          ( value, color ) => value === PartialProductsChoice.FACTORS ? color : 'black' )
      } );
    } );

    // Both are built here so it is a consistent size across screens.
    const iconGroup = new AlignGroup();
    const exponentsIcon = new AlignBox( createExponentIcon( templateLabels ), {
      group: iconGroup
    } );
    const noExponentsIcon = new AlignBox( createNonExponentIcon( templateLabels ), {
      group: iconGroup
    } );

    super( model.partialProductsChoiceProperty, [
      {
        value: PartialProductsChoice.HIDDEN,
        createNode: () => new AlignBox( new Path( eyeSlashSolidShape, { scale: 0.05249946193736533, fill: 'black' } ), { group: selectionButtonAlignGroup } ),
        options: {

          // pdom
          accessibleName: AreaModelCommonStrings.a11y.hidePartialProductsStringProperty
        }
      },
      {
        value: PartialProductsChoice.PRODUCTS,

        // Hardcoded 'A' string since we don't want it to be translatable
        createNode: () => new AlignBox( new Text( 'A', { font: AreaModelCommonConstants.SYMBOL_FONT } ), { group: selectionButtonAlignGroup } ),
        options: {

          // pdom
          accessibleName: AreaModelCommonStrings.a11y.showPartialProductsStringProperty
        }
      },
      {
        value: PartialProductsChoice.FACTORS,
        createNode: () => new AlignBox( model.allowExponents ? exponentsIcon : noExponentsIcon, { group: selectionButtonAlignGroup } ),
        options: {

          // pdom
          accessibleName: AreaModelCommonStrings.a11y.showPartialProductFactorsStringProperty
        }
      }
    ] );
  }
}

/**
 * Creates an 'exponents-allowed' icon based on a pair of nodes.
 * @param {OrientationPair.<Node>} nodes
 * @returns {Node}
 */
function createExponentIcon( nodes ) {
  return new HBox( {
    children: [
      new Text( '(', {
        font: AreaModelCommonConstants.SYMBOL_FONT
      } ),
      new Node( { children: [ nodes.vertical ] } ),
      new Text( ')(', {
        font: AreaModelCommonConstants.SYMBOL_FONT
      } ),
      new Node( { children: [ nodes.horizontal ] } ),
      new Text( ')', {
        font: AreaModelCommonConstants.SYMBOL_FONT
      } )
    ],
    spacing: 0,
    scale: 0.9
  } );
}

/**
 * Creates an 'no-exponents' icon based on a pair of nodes.
 * @param {OrientationPair.<Node>} nodes
 * @returns {Node}
 */
function createNonExponentIcon( nodes ) {
  return new HBox( {
    children: [
      new Node( { children: [ nodes.vertical ] } ),
      new Text( MathSymbols.TIMES, {
        font: AreaModelCommonConstants.SYMBOL_FONT
      } ),
      new Node( { children: [ nodes.horizontal ] } )
    ],
    spacing: 5
  } );
}

areaModelCommon.register( 'PartialProductRadioButtonGroup', PartialProductRadioButtonGroup );
export default PartialProductRadioButtonGroup;