// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import massesAndSpringsBasics from './massesAndSpringsBasics.js';

type StringsType = {
  'centerOfOscillation': string;
  'centerOfOscillationStringProperty': LocalizedStringProperty;
  'masses-and-springs-basics': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'stretch': string;
    'stretchStringProperty': LocalizedStringProperty;
    'bounce': string;
    'bounceStringProperty': LocalizedStringProperty;
    'lab': string;
    'labStringProperty': LocalizedStringProperty;
  };
  'restingPosition': string;
  'restingPositionStringProperty': LocalizedStringProperty;
  'unstretchedLength': string;
  'unstretchedLengthStringProperty': LocalizedStringProperty;
};

const MassesAndSpringsBasicsStrings = getStringModule( 'MASSES_AND_SPRINGS_BASICS' ) as StringsType;

massesAndSpringsBasics.register( 'MassesAndSpringsBasicsStrings', MassesAndSpringsBasicsStrings );

export default MassesAndSpringsBasicsStrings;
