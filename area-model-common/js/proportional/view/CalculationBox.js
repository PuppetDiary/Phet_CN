// Copyright 2018-2026, University of Colorado Boulder

/**
 * Shows the calculation of total area from each of the partitions' sizes.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaCalculationChoice from '../../common/model/AreaCalculationChoice.js';
import AreaModelCommonAccordionBox from '../../common/view/AreaModelCommonAccordionBox.js';
import CalculationLinesNode from '../../common/view/calculation/CalculationLinesNode.js';

// constants
const MARGIN = 8;

class CalculationBox extends AreaModelCommonAccordionBox {

  /**
   * @param {ProportionalAreaModel} model
   * @param {Bounds2} bounds - Where to lay out the box in view space
   * @param {Object} [nodeOptions]
   */
  constructor( model, bounds, nodeOptions ) {

    const calculationLinesNode = new CalculationLinesNode( model );

    const alignBox = new AlignBox( calculationLinesNode, {
      // Since our AccordionBox expands by our MARGIN, we need to set content bounds without that
      alignBounds: bounds.eroded( MARGIN ),
      pickable: false
    } );

    super( AreaModelCommonStrings.calculationStringProperty, model.calculationBoxVisibleProperty, alignBox, {
      // Different margins than our other accordion boxes
      contentXMargin: MARGIN,
      contentYMargin: MARGIN,

      // Different spacing
      maxTitleWidth: 290,

      // We don't have room for the normal spacing, so we need to make things closer together than they normally are.
      contentXSpacing: -10,

      // pdom
      accessibleHeading: AreaModelCommonStrings.a11y.calculationBoxTitleStringProperty,
      titleBarOptions: {
        descriptionContent: AreaModelCommonStrings.a11y.calculationBoxDescriptionStringProperty
      }
    } );

    model.areaCalculationChoiceProperty.link( choice => {
      assert && assert( choice !== AreaCalculationChoice.LINE_BY_LINE, 'Should be HIDDEN or SHOW_ALL_LINES' );
      this.visible = choice !== AreaCalculationChoice.HIDDEN;
    } );

    // Resize things so our AccordionBox is the correct size (we can't get bounds correct initially, because of the
    // expand button shifting content)
    alignBox.alignBounds = new Bounds2(
      0,
      0,
      alignBox.alignBounds.width - ( this.width - bounds.width ),
      alignBox.alignBounds.height - ( this.height - bounds.height )
    );

    this.mutate( nodeOptions );

    // @private
    this.calculationLinesNode = calculationLinesNode;
  }

  /**
   * Updates the content of the calculation box (if needed).
   * @public
   */
  update() {
    this.calculationLinesNode.update();
  }
}

areaModelCommon.register( 'CalculationBox', CalculationBox );
export default CalculationBox;