// Copyright 2021-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import normalModes from './normalModes.js';

type StringsType = {
  'normal-modes': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'oneDimension': string;
    'oneDimensionStringProperty': LocalizedStringProperty;
    'twoDimensions': string;
    'twoDimensionsStringProperty': LocalizedStringProperty;
  };
  'initialPositions': string;
  'initialPositionsStringProperty': LocalizedStringProperty;
  'zeroPositions': string;
  'zeroPositionsStringProperty': LocalizedStringProperty;
  'numberOfMasses': string;
  'numberOfMassesStringProperty': LocalizedStringProperty;
  'showSprings': string;
  'showSpringsStringProperty': LocalizedStringProperty;
  'showPhases': string;
  'showPhasesStringProperty': LocalizedStringProperty;
  'normalMode': string;
  'normalModeStringProperty': LocalizedStringProperty;
  'amplitude': string;
  'amplitudeStringProperty': LocalizedStringProperty;
  'normalModeSpectrum': string;
  'normalModeSpectrumStringProperty': LocalizedStringProperty;
  'phase': string;
  'phaseStringProperty': LocalizedStringProperty;
  'frequency': string;
  'frequencyStringProperty': LocalizedStringProperty;
  'frequencyRatioOmegaPattern': string;
  'frequencyRatioOmegaPatternStringProperty': LocalizedStringProperty;
  'normalModeAmplitudes': string;
  'normalModeAmplitudesStringProperty': LocalizedStringProperty;
};

const NormalModesStrings = getStringModule( 'NORMAL_MODES' ) as StringsType;

normalModes.register( 'NormalModesStrings', NormalModesStrings );

export default NormalModesStrings;
