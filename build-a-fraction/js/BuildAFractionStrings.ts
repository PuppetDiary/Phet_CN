// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import buildAFraction from './buildAFraction.js';

type StringsType = {
  'build-a-fraction': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'buildAFraction': string;
    'buildAFractionStringProperty': LocalizedStringProperty;
    'mixedNumbers': string;
    'mixedNumbersStringProperty': LocalizedStringProperty;
    'lab': string;
    'labStringProperty': LocalizedStringProperty;
  }
};

const BuildAFractionStrings = getStringModule( 'BUILD_A_FRACTION' ) as StringsType;

buildAFraction.register( 'BuildAFractionStrings', BuildAFractionStrings );

export default BuildAFractionStrings;
