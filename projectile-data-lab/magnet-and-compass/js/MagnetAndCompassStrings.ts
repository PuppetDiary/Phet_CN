// Copyright 2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import magnetAndCompass from './magnetAndCompass.js';

type StringsType = {
  'magnet-and-compass': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'nameStringProperty': LocalizedStringProperty;
  }
};

const MagnetAndCompassStrings = getStringModule( 'MAGNET_AND_COMPASS' ) as StringsType;

magnetAndCompass.register( 'MagnetAndCompassStrings', MagnetAndCompassStrings );

export default MagnetAndCompassStrings;
