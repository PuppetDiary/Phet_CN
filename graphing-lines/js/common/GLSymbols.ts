// Copyright 2018-2024, University of Colorado Boulder

/**
 * Strings for mathematical symbols, with markup for RichText.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';

const GLSymbols = {
  bStringProperty: MathSymbolFont.createDerivedProperty( GraphingLinesStrings.symbol.interceptStringProperty ), // b
  mStringProperty: MathSymbolFont.createDerivedProperty( GraphingLinesStrings.symbol.slopeStringProperty ), // m
  xStringProperty: MathSymbolFont.createDerivedProperty( GraphingLinesStrings.symbol.xStringProperty ), // x
  yStringProperty: MathSymbolFont.createDerivedProperty( GraphingLinesStrings.symbol.yStringProperty ) // y
};

graphingLines.register( 'GLSymbols', GLSymbols );

export default GLSymbols;