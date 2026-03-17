// Copyright 2018-2026, University of Colorado Boulder

/**
 * Wraps a Node with parentheses (poolable).
 *
 * This is pooled for performance, as recreating the view structure had unacceptable performance/GC characteristics.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../../axon/js/PatternStringProperty.js';
import ReadOnlyProperty from '../../../../../axon/js/ReadOnlyProperty.js';
import Poolable from '../../../../../phet-core/js/Poolable.js';
import HBox from '../../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonStrings from '../../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';

class Parentheses extends HBox {
  /**
   * @param {Node} content - Should have a clean() method to support pooling
   * @param {Property.<Color>} baseColorProperty
   */
  constructor( content, baseColorProperty ) {

    super( {
      spacing: AreaModelCommonConstants.CALCULATION_PAREN_PADDING,

      // pdom
      align: 'bottom',
      tagName: 'mrow',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML'
    } );

    // @private {Text} - Persistent (since these are declared in the constructor instead of the initialize function,
    // they will persist for the life of this node).
    this.leftParen = new Text( '(', {
      font: AreaModelCommonConstants.CALCULATION_PAREN_FONT,

      // pdom
      tagName: 'mo',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
      innerContent: '('
    } );
    this.leftParen.setPDOMAttribute( 'form', 'prefix', {
      namespace: 'http://www.w3.org/1998/Math/MathML'
    } );

    // @private {Text} - See notes above
    this.rightParen = new Text( ')', {
      font: AreaModelCommonConstants.CALCULATION_PAREN_FONT,

      // pdom
      tagName: 'mo',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
      innerContent: ')'
    } );
    this.rightParen.setPDOMAttribute( 'form', 'postfix', {
      namespace: 'http://www.w3.org/1998/Math/MathML'
    } );

    this.children = [ this.leftParen, this.rightParen ];

    this.initialize( content, baseColorProperty );
  }

  /**
   * @public
   *
   * @param {Node} content - Should have a clean() method to support pooling
   * @param {Property.<Color>} baseColorProperty
   */
  initialize( content, baseColorProperty ) {
    assert && assert( content instanceof Node );
    assert && assert( baseColorProperty instanceof ReadOnlyProperty );

    assert && assert( this.children.length === 2, 'Should only have a left and right paren at this moment' );

    // @public {PatternStringProperty|null}
    this.accessibleText = new PatternStringProperty( AreaModelCommonStrings.a11y.quantityPatternStringProperty, {
      content: content.accessibleText
    } );

    // @private {Node|null}
    this.content = content;

    this.insertChild( 1, content );

    this.leftParen.fill = baseColorProperty;
    this.rightParen.fill = baseColorProperty;
  }

  /**
   * Clears the state of this node (releasing references) so it can be freed to the pool (and potentially GC'ed).
   * @public
   */
  clean() {
    assert && assert( this.children.length === 3, 'Should only have a left and right paren AND content' );

    // Remove our content
    this.removeChild( this.content );
    this.content.clean();
    this.content = null;

    this.leftParen.fill = null;
    this.rightParen.fill = null;

    this.accessibleText.dispose();
    this.accessibleText = null;

    this.freeToPool();
  }
}

areaModelCommon.register( 'Parentheses', Parentheses );

Poolable.mixInto( Parentheses );

export default Parentheses;