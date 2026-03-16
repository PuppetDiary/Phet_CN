// Copyright 2022-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import numberCompare from './numberCompare.js';

type StringsType = {
  'number-compare': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'compareStringProperty': LocalizedStringProperty;
  };
  'isLessThanStringProperty': LocalizedStringProperty;
  'isGreaterThanStringProperty': LocalizedStringProperty;
  'isEqualToStringProperty': LocalizedStringProperty;
  'automaticallyHearNumberSentenceStringProperty': LocalizedStringProperty;
  'automaticallyHearNumberSentenceDescriptionStringProperty': LocalizedStringProperty;
};

const NumberCompareStrings = getStringModule( 'NUMBER_COMPARE' ) as StringsType;

numberCompare.register( 'NumberCompareStrings', NumberCompareStrings );

export default NumberCompareStrings;
