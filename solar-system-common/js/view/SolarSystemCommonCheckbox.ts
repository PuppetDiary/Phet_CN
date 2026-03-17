// Copyright 2023-2025, University of Colorado Boulder

/**
 * SolarSystemCommonCheckbox creates checkboxes with common options for the my-solar-system and keplers-laws sims.
 * A set of static methods are provided for creating the checkboxes that are common to both sims.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import WithRequired from '../../../phet-core/js/types/WithRequired.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text, { TextOptions } from '../../../scenery/js/nodes/Text.js';
import Checkbox, { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';

const ARROW_Y_COORDINATE = -10;

type SelfOptions = {
  textOptions?: TextOptions;
  icon?: Node; // optional icon, to the right of Text
};

export type SolarSystemCommonCheckboxOptions = SelfOptions & WithRequired<CheckboxOptions, 'tandem'>;

export default class SolarSystemCommonCheckbox extends Checkbox {

  public static readonly TEXT_OPTIONS = {
    font: new PhetFont( 16 ),
    fill: SolarSystemCommonColors.foregroundProperty,
    maxWidth: 125
  };

  protected constructor( property: Property<boolean>, stringProperty: TReadOnlyProperty<string>, providedOptions?: SolarSystemCommonCheckboxOptions ) {

    const options = optionize<SolarSystemCommonCheckboxOptions, StrictOmit<SelfOptions, 'textOptions' | 'icon'>, CheckboxOptions>()( {

      // CheckboxOptions
      boxWidth: 14,
      checkboxColor: SolarSystemCommonColors.foregroundProperty,
      checkboxColorBackground: SolarSystemCommonColors.backgroundProperty,
      touchAreaXDilation: 5,
      touchAreaYDilation: SolarSystemCommonConstants.VBOX_SPACING / 2,
      containerTagName: 'div', // Just for easier visualization in a11y view
      accessibleName: stringProperty
    }, providedOptions );

    const text = new Text( stringProperty, combineOptions<TextOptions>( {}, SolarSystemCommonCheckbox.TEXT_OPTIONS, {
      maxWidth: 125
    }, options.textOptions ) );

    let content: Node;
    if ( options.icon ) {
      content = new HBox( {
        children: [ text, options.icon ],
        spacing: 10
      } );
    }
    else {
      content = text;
    }

    super( property, content, options );
  }

  /**
   * Creates the 'Speed' checkbox
   */
  public static createSpeedCheckbox( speedVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {
    return new SolarSystemCommonCheckbox( speedVisibleProperty, SolarSystemCommonStrings.speedStringProperty, {
      tandem: tandem
    } );
  }

  /**
   * Creates the 'Velocity' checkbox
   */
  public static createVelocityCheckbox( velocityVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {
    return new SolarSystemCommonCheckbox( velocityVisibleProperty, SolarSystemCommonStrings.velocityStringProperty, {
      icon: new ArrowNode( 95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, {
        fill: SolarSystemCommonColors.velocityColorProperty
      } ),
      phetioDisplayOnlyPropertyInstrumented: true,
      tandem: tandem
    } );
  }

  /**
   * Creates the 'Gravity Force' checkbox
   */
  public static createGravityForceCheckbox( gravityForceVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {
    return new SolarSystemCommonCheckbox( gravityForceVisibleProperty, SolarSystemCommonStrings.gravityForceStringProperty, {
      icon: new ArrowNode( 135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, {
        fill: SolarSystemCommonColors.gravityColorProperty
      } ),
      phetioDisplayOnlyPropertyInstrumented: true,
      tandem: tandem
    } );
  }

  /**
   * Creates the 'Grid' checkbox
   */
  public static createGridCheckbox( gridVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {
    return new SolarSystemCommonCheckbox( gridVisibleProperty, SolarSystemCommonStrings.gridStringProperty, {
      icon: new GridNode( new Property( ModelViewTransform2.createIdentity() ), 10, Vector2.ZERO, 1, {
        stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
        lineWidth: 1.5
      } ),
      tandem: tandem
    } );
  }

  /**
   * Creates the 'Measuring Tape' checkbox
   */
  public static createMeasuringTapeCheckbox( measuringTapeVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {
    return new SolarSystemCommonCheckbox( measuringTapeVisibleProperty, SolarSystemCommonStrings.measuringTapeStringProperty, {
      icon: MeasuringTapeNode.createIcon( { scale: 0.3 } ),
      tandem: tandem
    } );
  }
}

solarSystemCommon.register( 'SolarSystemCommonCheckbox', SolarSystemCommonCheckbox );