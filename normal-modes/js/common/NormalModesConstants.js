// Copyright 2020-2023, University of Colorado Boulder

/**
 * Constants used in multiple locations within this simulation.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Range from '../../../dot/js/Range.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import normalModes from '../normalModes.js';

const NUMBER_OF_MASSES_RANGE = new Range( 1, 10 );

const NormalModesConstants = {

  // ScreenView margins
  SCREEN_VIEW_X_MARGIN: 10,
  SCREEN_VIEW_Y_MARGIN: 10,

  // Time
  FIXED_DT: 1 / 60,

  // dt will be scaled by these amounts, depending on the speed selection for the sim.
  NORMAL_SPEED: 1,
  SLOW_SPEED: 0.2,

  // Masses
  NUMBER_OF_MASSES_RANGE: NUMBER_OF_MASSES_RANGE, //TODO https://github.com/phetsims/normal-modes/issues/89 actually number of masses PER ROW
  MAX_MASSES_PER_ROW: NUMBER_OF_MASSES_RANGE.max,
  MASSES_MASS_VALUE: 0.1,

  // Springs
  SPRING_CONSTANT_VALUE: 0.1 * 4 * Math.PI ** 2,

  // Amplitude
  MIN_AMPLITUDE: 0,
  MAX_AMPLITUDE: 0.1, // for One Dimension screen
  INITIAL_AMPLITUDE: 0,

  // Phase
  MIN_PHASE: -Math.PI,
  MAX_PHASE: Math.PI,
  INITIAL_PHASE: 0,

  // For the 1D case, x=0 is midway between the 2 walls.
  // For the 2D case, (x,y)=(0,0) is at the center of the box.
  LEFT_WALL_X_POS: -1,
  TOP_WALL_Y_POS: 1,
  DISTANCE_BETWEEN_X_WALLS: 2,
  DISTANCE_BETWEEN_Y_WALLS: 2,

  // fonts
  CONTROL_FONT: new PhetFont( 18 ),
  MODE_NUMBER_FONT: new PhetFont( 16 ),
  GENERAL_FONT: new PhetFont( 14 ),
  SMALL_FONT: new PhetFont( 13 ),
  SMALLER_FONT: new PhetFont( 12 )
};

normalModes.register( 'NormalModesConstants', NormalModesConstants );
export default NormalModesConstants;