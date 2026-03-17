// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import fractionsMixedNumbers from './fractionsMixedNumbers.js';

type StringsType = {
  'fractions-mixed-numbers': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'intro': string;
    'introStringProperty': LocalizedStringProperty;
    'game': string;
    'gameStringProperty': LocalizedStringProperty;
    'lab': string;
    'labStringProperty': LocalizedStringProperty;
  }
};

const FractionsMixedNumbersStrings = getStringModule( 'FRACTIONS_MIXED_NUMBERS' ) as StringsType;

fractionsMixedNumbers.register( 'FractionsMixedNumbersStrings', FractionsMixedNumbersStrings );

export default FractionsMixedNumbersStrings;
