// Copyright 2022-2024, University of Colorado Boulder

/**
 * Counting object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import countingCommon from '../../countingCommon.js';

class CountingObjectType extends EnumerationValue {
  public static readonly DOG = new CountingObjectType();
  public static readonly APPLE = new CountingObjectType();
  public static readonly BUTTERFLY = new CountingObjectType();
  public static readonly BALL = new CountingObjectType();
  public static readonly PAPER_NUMBER = new CountingObjectType();

  public static readonly enumeration = new Enumeration( CountingObjectType );
}

countingCommon.register( 'CountingObjectType', CountingObjectType );
export default CountingObjectType;