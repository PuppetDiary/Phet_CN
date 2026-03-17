// Copyright 2023-2025, University of Colorado Boulder

/**
 * Constants used throughout the My Solar System and Kepler's Laws Simulations.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Range from '../../dot/js/Range.js';
import { combineOptions } from '../../phet-core/js/optionize.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HSeparatorOptions } from '../../scenery/js/layout/nodes/HSeparator.js';
import { DEFAULT_SEPARATOR_LAYOUT_OPTIONS } from '../../scenery/js/layout/nodes/Separator.js';
import TLayoutOptions from '../../scenery/js/layout/TLayoutOptions.js';
import { RichTextOptions } from '../../scenery/js/nodes/RichText.js';
import { PanelOptions } from '../../sun/js/Panel.js';
import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import grab_mp3 from '../../tambo/sounds/grab_mp3.js';
import release_mp3 from '../../tambo/sounds/release_mp3.js';
import solarSystemCommon from './solarSystemCommon.js';
import SolarSystemCommonColors from './SolarSystemCommonColors.js';

export const METERS_PER_AU = 149597870700;
export const SECONDS_PER_YEAR = 31557600; // 365.25 days/year x 24 hrs/day x 60 min/hr x 60 sec/min
export const G = 4.4567; // gravitational constant within the model. This value is easier for computations than the real G.
export const G_ACTUAL = 6.6743e-11; // gravitational constant

// Multipliers that map from non-standard model units to standard units
export const POSITION_MULTIPLIER = 0.01;
export const MASS_MULTIPLIER = 1e28;
export const TIME_MULTIPLIER = Math.pow( POSITION_MULTIPLIER, 3 / 2 ) * Math.sqrt( G ) * Math.pow( METERS_PER_AU, 3 / 2 ) / ( Math.sqrt( G_ACTUAL ) * Math.sqrt( MASS_MULTIPLIER ) * SECONDS_PER_YEAR );
export const VELOCITY_MULTIPLIER = POSITION_MULTIPLIER / TIME_MULTIPLIER * METERS_PER_AU / SECONDS_PER_YEAR / 1000;

const COLUMN_TITLE_OPTIONS: RichTextOptions = {
  font: new PhetFont( 16 ),
  fill: SolarSystemCommonColors.foregroundProperty
};

const HSEPARATOR_OPTIONS: HSeparatorOptions = {
  lineWidth: 2,
  stroke: '#8E9097',
  layoutOptions: combineOptions<TLayoutOptions>( {}, DEFAULT_SEPARATOR_LAYOUT_OPTIONS, { yMargin: 2 } )
};

const PANEL_OPTIONS: PanelOptions = {
  fill: SolarSystemCommonColors.panelFillProperty,
  stroke: SolarSystemCommonColors.panelStrokeProperty,
  cornerRadius: 5,
  xMargin: 10,
  yMargin: 10,
  layoutOptions: {
    stretch: true
  },
  visiblePropertyOptions: {
    phetioFeatured: true
  }
};

const DEFAULT_SOUND_OUTPUT_LEVEL = 0.2;
const DRAG_SOUND_CLIP_OPTIONS = {
  initialOutputLevel: DEFAULT_SOUND_OUTPUT_LEVEL
};

// Sound players for the grab/release sounds.
const GRAB_SOUND_PLAYER = new SoundClip( grab_mp3, DRAG_SOUND_CLIP_OPTIONS );
const RELEASE_SOUND_PLAYER = new SoundClip( release_mp3, DRAG_SOUND_CLIP_OPTIONS );

const SolarSystemCommonConstants = {

  // ScreenView margins
  SCREEN_VIEW_X_MARGIN: 10,
  SCREEN_VIEW_Y_MARGIN: 10,

  // Default option values
  COLUMN_TITLE_OPTIONS: COLUMN_TITLE_OPTIONS,
  HSEPARATOR_OPTIONS: HSEPARATOR_OPTIONS,
  PANEL_OPTIONS: PANEL_OPTIONS,

  // Fonts
  BUTTON_FONT: new PhetFont( 16 ),
  COMBO_BOX_ITEM_FONT: new PhetFont( 16 ),
  NUMBER_DISPLAY_FONT: new PhetFont( 16 ),

  MASS_SLIDER_STEP: 25,
  GRID_SPACING: 1,
  VBOX_SPACING: 7,
  DEFAULT_SOUND_OUTPUT_LEVEL: DEFAULT_SOUND_OUTPUT_LEVEL,
  GRAB_SOUND_PLAYER: GRAB_SOUND_PLAYER,
  RELEASE_SOUND_PLAYER: RELEASE_SOUND_PLAYER,
  RICH_DRAG_LISTENER_OPTIONS: {
    grabSoundPlayer: GRAB_SOUND_PLAYER,
    releaseSoundPlayer: RELEASE_SOUND_PLAYER
  },

  INITIAL_VECTOR_OFFSCALE: -2.7, // The initial offscale value for the gravity vector arrows

  MAX_PATH_DISTANCE: 20, // Maximum distance of the drawn path behind the body
  MAX_PATH_POINTS: 5800, // Maximum number of points in the path

  // Multipliers that map from non-standard model units to standard units
  POSITION_MULTIPLIER: POSITION_MULTIPLIER, // Transforms from model units to AU
  VELOCITY_MULTIPLIER: VELOCITY_MULTIPLIER, // Transforms from model units to AU/yr then to km/s
  TIME_MULTIPLIER: TIME_MULTIPLIER, // Transforms from model units to years

  VELOCITY_TO_VIEW_MULTIPLIER: 50 * POSITION_MULTIPLIER / VELOCITY_MULTIPLIER,

  // See https://github.com/phetsims/keplers-laws/issues/197. Note that this default is specific to My Solar System.
  DEFAULT_MASS_RANGE: new Range( 0.000001, 300 )
};

/**
 * Sanity check for constants related to units.
 */
function testUnits(): void {

  // Some example values for our test
  const mass1 = 123; // kg
  const mass2 = 456; // kg
  const distance = 999; // m
  const gravityForce = G_ACTUAL * mass1 * mass2 / ( distance * distance ); // N

  // Convert to sim units
  const mass1SimUnits = mass1 / MASS_MULTIPLIER;
  const mass2SimUnits = mass2 / MASS_MULTIPLIER;
  const distanceSimUnits = distance / METERS_PER_AU / POSITION_MULTIPLIER;
  const gravityForceSimUnits = G * mass1SimUnits * mass2SimUnits / ( distanceSimUnits * distanceSimUnits );

  // convert gravityForceSimUnits to SI
  const convertedToSI = gravityForceSimUnits * MASS_MULTIPLIER * POSITION_MULTIPLIER * METERS_PER_AU / TIME_MULTIPLIER / TIME_MULTIPLIER / SECONDS_PER_YEAR / SECONDS_PER_YEAR;
  assert && assert( Math.abs( gravityForce - convertedToSI ) < 1e-10, 'gravityForce and convertedToSI should be the same, within some small tolerance' );
}

testUnits();

solarSystemCommon.register( 'SolarSystemCommonConstants', SolarSystemCommonConstants );
export default SolarSystemCommonConstants;