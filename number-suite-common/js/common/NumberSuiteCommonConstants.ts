// Copyright 2019-2025, University of Colorado Boulder

/**
 * Constants used commonly for Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import LocalizedStringProperty from '../../../chipper/js/browser/LocalizedStringProperty.js';
import CountingCommonConstants from '../../../counting-common/js/common/CountingCommonConstants.js';
import { Locale } from '../../../joist/js/i18n/localeProperty.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import SceneryPhetConstants from '../../../scenery-phet/js/SceneryPhetConstants.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';

// Maps a number to the stringProperty of the translated word that corresponds to the number.
const NUMBER_TO_STRING_PROPERTY_PRIMARY: Record<number, LocalizedStringProperty> = {
  0: NumberSuiteCommonStrings.zeroStringProperty,
  1: NumberSuiteCommonStrings.oneStringProperty,
  2: NumberSuiteCommonStrings.twoStringProperty,
  3: NumberSuiteCommonStrings.threeStringProperty,
  4: NumberSuiteCommonStrings.fourStringProperty,
  5: NumberSuiteCommonStrings.fiveStringProperty,
  6: NumberSuiteCommonStrings.sixStringProperty,
  7: NumberSuiteCommonStrings.sevenStringProperty,
  8: NumberSuiteCommonStrings.eightStringProperty,
  9: NumberSuiteCommonStrings.nineStringProperty,
  10: NumberSuiteCommonStrings.tenStringProperty,
  11: NumberSuiteCommonStrings.elevenStringProperty,
  12: NumberSuiteCommonStrings.twelveStringProperty,
  13: NumberSuiteCommonStrings.thirteenStringProperty,
  14: NumberSuiteCommonStrings.fourteenStringProperty,
  15: NumberSuiteCommonStrings.fifteenStringProperty,
  16: NumberSuiteCommonStrings.sixteenStringProperty,
  17: NumberSuiteCommonStrings.seventeenStringProperty,
  18: NumberSuiteCommonStrings.eighteenStringProperty,
  19: NumberSuiteCommonStrings.nineteenStringProperty,
  20: NumberSuiteCommonStrings.twentyStringProperty
};

// A list of the primary string Properties we use in the sim.
export const NUMBER_STRING_PROPERTIES: TReadOnlyProperty<string>[] = _.values( NUMBER_TO_STRING_PROPERTY_PRIMARY );

// RequireJS namespace, used for looking up translated strings
const NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE = 'NUMBER_SUITE_COMMON';

const GROUPED_STORED_COUNTING_OBJECT_SCALE = 0.7;

const NumberSuiteCommonConstants = {

  TEN: 10, // used for organizing things into group of ten per countingObject

  MAX_AMOUNT_OF_TEN_FRAMES: 10, // The maximum amount of ten frames allowed on lab screens
  PAPER_NUMBER_INITIAL_VALUE: 1, // the initial value of every created countingObject

  // accordion box sizing

  TOTAL_ACCORDION_BOX_WIDTH: 199,           // width of the 'Total' accordion box

  // sizing for the 'lower' accordion boxes, which include the 'Ones' and 'Objects' accordion boxes
  LOWER_ACCORDION_BOX_TITLE_MAX_WIDTH: 332, // max width of the title of all lower accordion boxes
  TALL_LOWER_ACCORDION_BOX_HEIGHT: 468,     // height of the 'lower' accordion boxes on the 'Twenty' and 'Compare' screens

  // layout
  SCREEN_VIEW_PADDING_X: 15,                // minimum x-distance any node is positioned from the edges of the sim
  SCREEN_VIEW_PADDING_Y: 15,                // minimum y-distance any node is positioned from the edges of the sim
  ACCORDION_BOX_MARGIN_X: 72,               // distance between the sides of the sim and all adjacent accordion boxes

  // options for all AccordionBox instances
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 16 ),

  // Maps an integer to the translated word string Property for that integer.
  numberToWordProperty: ( locale: Locale, number: number, isPrimaryLocale: boolean ): TReadOnlyProperty<string> => {
    const stringProperty = NUMBER_TO_STRING_PROPERTY_PRIMARY[ number ];

    return isPrimaryLocale ? stringProperty : stringProperty.getTranslatedStringProperty( locale );
  },

  NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE: NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE,

  UNGROUPED_STORED_COUNTING_OBJECT_SCALE: 0.9,
  GROUPED_STORED_COUNTING_OBJECT_SCALE: GROUPED_STORED_COUNTING_OBJECT_SCALE,
  COUNTING_OBJECT_SCALE: 1,

  // match the size of the ResetAllButton, in screen coords
  BUTTON_LENGTH: SceneryPhetConstants.DEFAULT_BUTTON_RADIUS * 2,

  CREATOR_ICON_HEIGHT: CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height * GROUPED_STORED_COUNTING_OBJECT_SCALE + 5,

  // Preferences dialog controls
  PREFERENCES_FONT_SIZE: 16,
  PREFERENCES_VBOX_SPACING: 15,
  PREFERENCES_DESCRIPTION_Y_SPACING: 5
};

numberSuiteCommon.register( 'NumberSuiteCommonConstants', NumberSuiteCommonConstants );
export default NumberSuiteCommonConstants;