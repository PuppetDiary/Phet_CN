// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import fractionMatcher from './fractionMatcher.js';

type StringsType = {
  'fraction-matcher': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'fractionsTitle': string;
  'fractionsTitleStringProperty': LocalizedStringProperty;
  'mixedNumbersTitle': string;
  'mixedNumbersTitleStringProperty': LocalizedStringProperty;
};

const FractionMatcherStrings = getStringModule( 'FRACTION_MATCHER' ) as StringsType;

fractionMatcher.register( 'FractionMatcherStrings', FractionMatcherStrings );

export default FractionMatcherStrings;
