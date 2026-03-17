// Copyright 2017-2026, University of Colorado Boulder

/**
 * Shows the total area, handling alignment
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
import Term from '../model/Term.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';

class TotalAreaNode extends Node {
  /**
   * @param {Property.<Polynomial|null>} totalAreaProperty
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   * @param {string} maximumWidthString - If proportional (and will be numeric, should not change with localization)
   * @param {boolean} useTileLikeBackground - Whether the "tile" color should be used with an area background (if any)
   */
  constructor( totalAreaProperty, isProportional, maximumWidthString, useTileLikeBackground ) {

    const labelStringProperty = new DerivedProperty( [ totalAreaProperty ], polynomial => {
      return polynomial === null ? '?' : polynomial.toRichString();
    } );

    // If powers of x are supported, we need to have a slightly different initial height so we can align-bottom.
    const areaText = new RichText( Term.getLargestGenericString( true, 3 ), {
      font: AreaModelCommonConstants.TOTAL_AREA_VALUE_FONT
    } );

    let areaNode;
    if ( isProportional ) {

      // Has numeric display, so it doesn't need maxWidth
      areaText.string = maximumWidthString;
      areaNode = new HBox( {
        spacing: 8,
        children: [
          new Text( AreaModelCommonStrings.areaStringProperty, { font: AreaModelCommonConstants.TOTAL_AREA_LABEL_FONT } ),
          new Text( MathSymbols.EQUAL_TO, { font: AreaModelCommonConstants.TOTAL_AREA_LABEL_FONT } ),
          // AlignBox it so that it is always centered and keeps the same bounds
          new Panel( new AlignBox( areaText, { alignBounds: areaText.bounds.copy(), yAlign: 'bottom' } ), {
            fill: useTileLikeBackground
                  ? AreaModelCommonColors.smallTileProperty
                  : AreaModelCommonColors.proportionalActiveAreaBackgroundProperty
          } )
        ]
      } );
    }
    else {
      areaText.maxWidth = AreaModelCommonConstants.PANEL_INTERIOR_MAX;

      // AlignBox it so that it is always centered and keeps the same bounds
      areaNode = new AlignBox( areaText, { alignBounds: new Bounds2( 0, 0, AreaModelCommonConstants.PANEL_INTERIOR_MAX, areaText.height ) } );
    }

    super( {
      children: [
        areaNode
      ],
      maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX,

      // pdom
      tagName: 'p',
      innerContent: new PatternStringProperty( AreaModelCommonStrings.a11y.areaEqualsPatternStringProperty, {
        area: labelStringProperty
      } )
    } );

    // Update the text.
    areaText.stringProperty = labelStringProperty;
  }
}

areaModelCommon.register( 'TotalAreaNode', TotalAreaNode );

export default TotalAreaNode;