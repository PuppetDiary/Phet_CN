// Copyright 2023-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import solarSystemCommon from './solarSystemCommon.js';

type StringsType = {
  'gravityForce': string;
  'gravityForceStringProperty': LocalizedStringProperty;
  'grid': string;
  'gridStringProperty': LocalizedStringProperty;
  'measuringTape': string;
  'measuringTapeStringProperty': LocalizedStringProperty;
  'velocity': string;
  'velocityStringProperty': LocalizedStringProperty;
  'V': string;
  'VStringProperty': LocalizedStringProperty;
  'clear': string;
  'clearStringProperty': LocalizedStringProperty;
  'path': string;
  'pathStringProperty': LocalizedStringProperty;
  'zoom': string;
  'zoomStringProperty': LocalizedStringProperty;
  'offscaleMessage': string;
  'offscaleMessageStringProperty': LocalizedStringProperty;
  'speed': string;
  'speedStringProperty': LocalizedStringProperty;
  'units': {
    'AU': string;
    'AUStringProperty': LocalizedStringProperty;
    'years': string;
    'yearsStringProperty': LocalizedStringProperty;
    'kms': string;
    'kmsStringProperty': LocalizedStringProperty;
  };
  'pattern': {
    'labelUnits': string;
    'labelUnitsStringProperty': LocalizedStringProperty;
    'velocityValueUnits': string;
    'velocityValueUnitsStringProperty': LocalizedStringProperty;
    'unitsPower': string;
    'unitsPowerStringProperty': LocalizedStringProperty;
  };
  'a11y': {
    'restart': string;
    'restartStringProperty': LocalizedStringProperty;
    'massSlider': string;
    'massSliderStringProperty': LocalizedStringProperty;
    'scaleSlider': string;
    'scaleSliderStringProperty': LocalizedStringProperty;
    'increase': string;
    'increaseStringProperty': LocalizedStringProperty;
    'decrease': string;
    'decreaseStringProperty': LocalizedStringProperty;
  }
};

const SolarSystemCommonStrings = getStringModule( 'SOLAR_SYSTEM_COMMON' ) as StringsType;

solarSystemCommon.register( 'SolarSystemCommonStrings', SolarSystemCommonStrings );

export default SolarSystemCommonStrings;
