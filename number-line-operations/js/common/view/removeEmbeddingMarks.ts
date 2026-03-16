// Copyright 2025, University of Colorado Boulder

/**
 * Remove embedding marks, which are used to control the direction of text, from a string
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BidirectionalControlChars from '../../../../scenery-phet/js/BidirectionalControlChars.js';

const EMBEDDING_CHARS: string[] = [
  BidirectionalControlChars.LRE,
  BidirectionalControlChars.RLE,
  BidirectionalControlChars.PDF
];

const removeEmbeddingMarks = ( str: string ): string =>
  str.split( '' ).filter( char => !EMBEDDING_CHARS.includes( char ) ).join( '' );

export default removeEmbeddingMarks;