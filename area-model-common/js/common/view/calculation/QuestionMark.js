// Copyright 2018-2026, University of Colorado Boulder

/**
 * A poolable question-mark symbol
 *
 * This is pooled for performance, as recreating the view structure had unacceptable performance/GC characteristics.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import ReadOnlyProperty from '../../../../../axon/js/ReadOnlyProperty.js';
import Poolable from '../../../../../phet-core/js/Poolable.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonStrings from '../../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';

class QuestionMark extends Text {
  /**
   * @param {Property.<Color>} baseColorProperty
   */
  constructor( baseColorProperty ) {

    super( '?', {
      font: AreaModelCommonConstants.CALCULATION_TERM_FONT,

      // pdom
      tagName: 'mi',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
      innerContent: AreaModelCommonStrings.a11y.questionMarkStringProperty
    } );

    // @public {string}
    this.accessibleText = AreaModelCommonStrings.a11y.questionMarkStringProperty;

    this.initialize( baseColorProperty );
  }

  /**
   * @public
   *
   * @param {Property.<Color>} baseColorProperty
   */
  initialize( baseColorProperty ) {
    assert && assert( baseColorProperty instanceof ReadOnlyProperty );

    this.fill = baseColorProperty;
  }

  /**
   * Clears the state of this node (releasing references) so it can be freed to the pool (and potentially GC'ed).
   * @public
   */
  clean() {
    this.fill = null;

    this.freeToPool();
  }
}

areaModelCommon.register( 'QuestionMark', QuestionMark );

Poolable.mixInto( QuestionMark );

export default QuestionMark;