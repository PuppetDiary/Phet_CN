// Copyright 2017-2025, University of Colorado Boulder

/**
 * Colors used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import unitRates from '../unitRates.js';

// constants
const DEFAULT_BUTTON_COLOR = 'rgb( 242, 242, 242 )';

// all values are {Color|string} and read-only, unless otherwise noted
const URColors = {

  // screens
  shoppingScreenBackgroundColorProperty: new ProfileColorProperty( unitRates, 'shoppingScreenBackgroundColor', {
    default: 'rgb( 226, 255, 249 )'
  } ),
  racingLabScreenBackgroundColorProperty: new ProfileColorProperty( unitRates, 'racingLabScreenBackgroundColor', {
    default: 'rgb( 233, 242, 254 )'
  } ),

  // buttons
  categoryButtonColorProperty: new ProfileColorProperty( unitRates, 'categoryButtonColor', {
    default: 'white'
  } ),
  editButtonColorProperty: new ProfileColorProperty( unitRates, 'editButtonColor', {
    default: 'yellow'
  } ),
  enterButtonColorProperty: new ProfileColorProperty( unitRates, 'enterButtonColor', {
    default: 'yellow'
  } ),
  eraserButtonColorProperty: new ProfileColorProperty( unitRates, 'eraserButtonColor', {
    default: DEFAULT_BUTTON_COLOR
  } ),
  refreshButtonColorProperty: new ProfileColorProperty( unitRates, 'refreshButtonColor', {
    default: DEFAULT_BUTTON_COLOR
  } ),
  undoButtonColorProperty: new ProfileColorProperty( unitRates, 'undoButtonColor', {
    default: DEFAULT_BUTTON_COLOR
  } ),
  resetShelfButtonColorProperty: new ProfileColorProperty( unitRates, 'resetShelfButtonColor', {
    default: DEFAULT_BUTTON_COLOR
  } ),

  // markers & marker editor
  // These are problematic to convert to ProfileColorProperty, so leave as is unless there's a strong need.
  questionMarker: 'green', // markers created by answering questions
  scaleMarker: 'blue', // marker that corresponds to what's on the scale
  majorMarker: 'black', // major marker created by using editor or by putting things on the scale
  minorMarker: 'gray', // minor markers created by using editor
  edit: 'yellow', // corresponding value box is filled with this color while editing

  // questions
  // check mark for correct answers
  checkMarkColorProperty: new ProfileColorProperty( unitRates, 'checkMarkColor', {
    default: 'green'
  } ),
  // correct answer for other questions
  correctQuestionColorProperty: new ProfileColorProperty( unitRates, 'correctQuestionColor', {
    default: 'green'
  } ),
  // incorrect guess
  incorrectQuestionColorProperty: new ProfileColorProperty( unitRates, 'incorrectQuestionColor', {
    default: 'red'
  } ),

  // Show answers in this color when 'showAnswers' query parameter is present. No need for ProfileColorProperty.
  showAnswers: 'lightGray',

  // shelf
  shelfColorProperty: new ProfileColorProperty( unitRates, 'shelfColor', {
    default: 'rgb( 232, 201, 166 )' // light brown
  } ),

  // scale
  scaleTopLightColorProperty: new ProfileColorProperty( unitRates, 'scaleTopLightColor', {
    default: 'white'
  } ),
  scaleTopDarkColorProperty: new ProfileColorProperty( unitRates, 'scaleTopDarkColor', {
    default: 'rgb( 220, 220, 220 )'
  } ),
  scaleBodyColorProperty: new ProfileColorProperty( unitRates, 'scaleBodyColor', {
    default: 'rgb( 113, 148, 152 )'
  } ),

  // Car colors must match PNG files, so they are not editable via Color Editor.
  car1: 'rgb( 236, 22, 44 )',  // red car, must match redCar.png
  car2: 'rgb( 0, 143, 204 )' // blue car, must match blueCar.png
};

unitRates.register( 'URColors', URColors );

export default URColors;