// Copyright 2013-2025, University of Colorado Boulder

/**
 * Colors used throughout this project.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Color from '../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import graphingLines from '../graphingLines.js';

const GLColors = {

  // Background color used for all screens
  screenBackgroundColorProperty: new ProfileColorProperty( graphingLines, 'screenBackgroundColor', {
    default: 'rgb( 255, 255, 214 )'
  } ),

  // Fill used for all control panels
  controlPanelFillProperty: new ProfileColorProperty( graphingLines, 'controlPanelFill', {
    default: 'rgb( 238, 238, 238 )'
  } ),

  // point tool
  pointToolColorProperty: new ProfileColorProperty( graphingLines, 'pointToolColor', {
    default: Color.grayColor( 200 )
  } ),

  // lines
  interactiveLineColorProperty: new ProfileColorProperty( graphingLines, 'interactiveLineColor', {
    default: 'black'
  } ),
  yEqualsXLineColorProperty: new ProfileColorProperty( graphingLines, 'yEqualsXLineColor', {
    default: 'rgb( 16, 178, 15 )'
  } ),
  yEqualsNegativeXLineColorProperty: new ProfileColorProperty( graphingLines, 'yEqualsNegativeXLineColor', {
    default: 'rgb( 16, 178, 15 )'
  } ),
  savedLineColorProperty: new ProfileColorProperty( graphingLines, 'savedLineColor', {
    default: 'rgb( 160, 160, 160 )'
  } ),

  // interactive aspects of lines
  slopeColorProperty: new ProfileColorProperty( graphingLines, 'slopeColor', {
    default: 'rgb( 117, 217, 255 )'
  } ),
  slopeToolDimensionalLinesColorProperty: new ProfileColorProperty( graphingLines, 'slopeToolDimensionalLinesColor', {
    default: 'rgb( 76, 199, 255 )'
  } ),
  interceptColorProperty: new ProfileColorProperty( graphingLines, 'interceptColor', {
    default: 'rgb( 200, 0, 200 )'
  } ),
  pointColorProperty: new ProfileColorProperty( graphingLines, 'pointColor', {
    default: 'rgb( 200, 0, 200 )'
  } ),
  pointX1Y1ColorProperty: new ProfileColorProperty( graphingLines, 'pointX1Y1Color', {
    default: 'rgb( 200, 0, 200 )'
  } ),
  pointX2Y2ColorProperty: new ProfileColorProperty( graphingLines, 'pointX2Y2Color', {
    default: 'rgb( 210, 255, 0 )'
  } ),

  // alpha channel (0-1) of the halo around the various manipulators, manually tuned for above colors
  HALO_ALPHA: {
    slope: 0.3,
    intercept: 0.15,
    x1y1: 0.15,
    x2y2: 0.35,
    point: 0.15
  }
};

graphingLines.register( 'GLColors', GLColors );

export default GLColors;