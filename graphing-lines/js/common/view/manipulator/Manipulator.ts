// Copyright 2013-2025, University of Colorado Boulder

/**
 * Base type for all line manipulators.
 * A pseudo-3D sphere with a halo that appears during interactions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Shape from '../../../../../kite/js/Shape.js';
import { combineOptions, optionize4 } from '../../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../../phet-core/js/types/PickOptional.js';
import AccessibleDraggableOptions from '../../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import ShadedSphereNode, { ShadedSphereNodeOptions } from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import PressListener from '../../../../../scenery/js/listeners/PressListener.js';
import Circle from '../../../../../scenery/js/nodes/Circle.js';
import Node, { NodeOptions } from '../../../../../scenery/js/nodes/Node.js';
import Color from '../../../../../scenery/js/util/Color.js';
import TColor from '../../../../../scenery/js/util/TColor.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import graphingLines from '../../../graphingLines.js';
import InteractiveHighlighting from '../../../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';

type SelfOptions = {

  // Alpha channel of the halo, [0,1]. Setting this to 0 results in no halo.
  haloAlpha?: number;
} & PickOptional<ShadedSphereNodeOptions, 'mainColor' | 'highlightColor' | 'shadowColor' | 'lineWidth' | 'stroke'>;

export type ManipulatorOptions = SelfOptions & NodeOptions;

export default class Manipulator extends InteractiveHighlighting( Node ) {

  /**
   * @param radius radius of the sphere
   * @param color base color used to shade the sphere
   * @param [providedOptions]
   */
  public constructor( radius: number, color: TColor, providedOptions?: ManipulatorOptions ) {

    const mainColor = Color.toColor( color );

    const options = optionize4<ManipulatorOptions, SelfOptions, NodeOptions>()( {}, AccessibleDraggableOptions, {

      haloAlpha: 0.5,

      // ShadedSphereNodeOptions
      mainColor: mainColor,
      highlightColor: Color.WHITE,
      shadowColor: mainColor.darkerColor(),
      lineWidth: 1,
      stroke: mainColor.darkerColor(),

      // NodeOptions
      cursor: 'pointer',
      mouseArea: Shape.circle( 0, 0, 1.5 * radius ),
      touchArea: Shape.circle( 0, 0, 1.5 * radius )
    }, providedOptions );

    super();

    const haloRadius = 1.75 * radius;

    // Set focus highlight (and interactive highlight) to a circle that matches the radius of the halo.
    // Subclasses in graphing-quadratics add value labels, and with a default (rectangular) highlight,
    // the variable width of those labels causes the interactive highlight to resize constantly.
    // See https://github.com/phetsims/graphing-quadratics/issues/248.
    this.focusHighlight = Shape.circle( 0, 0, haloRadius );

    // Add a halo only if it will be visible. This is useful for creating non-interactive manipulator icons.
    if ( options.haloAlpha !== 0 ) {

      const haloNodeFill = mainColor.withAlpha( options.haloAlpha );

      const haloNode = new Circle( haloRadius, {
        pickable: false,
        renderer: 'canvas' // Workaround for Firefox graphics artifacts, see phetsims/graphing-lines/issues/119
      } );
      this.addChild( haloNode );

      // Use transparent fill to make the halo invisible so that interactive highlight does not resize.
      // See https://github.com/phetsims/graphing-quadratics/issues/211
      const pressListener = new PressListener( {
        attach: false,
        tandem: Tandem.OPT_OUT
      } );
      pressListener.isHighlightedProperty.link( isHighlighted => {
        haloNode.fill = isHighlighted ? haloNodeFill : 'transparent';
      } );
      this.addInputListener( pressListener );
    }

    const sphereNode = new ShadedSphereNode( 2 * radius, {
      mainColor: options.mainColor,
      highlightColor: options.highlightColor,
      shadowColor: options.shadowColor,
      lineWidth: options.lineWidth,
      stroke: options.stroke
    } );
    this.addChild( sphereNode );

    this.mutate( options );
  }

  /**
   * Creates a non-interactive manipulator icon.
   */
  public static createIcon( radius: number, color: TColor, providedOptions?: ManipulatorOptions ): Manipulator {

    // turn off options related to interactivity, see constructor
    const options = combineOptions<ManipulatorOptions>( {}, providedOptions, {
      haloAlpha: 0,
      pickable: false,
      mouseArea: null,
      touchArea: null
    } );

    return new Manipulator( radius, color, options );
  }
}

graphingLines.register( 'Manipulator', Manipulator );