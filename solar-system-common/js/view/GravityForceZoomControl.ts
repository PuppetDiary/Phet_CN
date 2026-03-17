// Copyright 2023-2025, University of Colorado Boulder

/**
 * GravityForceZoomControl is the control for scaling the size of the gravity arrows. It is a labeled slider.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import RichText, { RichTextOptions } from '../../../scenery/js/nodes/RichText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';

const TICK_MARK_OPTIONS: RichTextOptions = {
  font: new PhetFont( 16 ),
  fill: SolarSystemCommonColors.foregroundProperty
};

export default class GravityForceZoomControl extends HBox {

  public constructor( gravityForceScalePowerProperty: NumberProperty, gravityVisibleProperty: TReadOnlyProperty<boolean>, tandem: Tandem ) {

    const zoomText = new Text( SolarSystemCommonStrings.zoomStringProperty, {
      font: new PhetFont( 16 ),
      fill: SolarSystemCommonColors.foregroundProperty,
      layoutOptions: { leftMargin: 20 },
      maxWidth: 100
    } );

    const rangeMin = gravityForceScalePowerProperty.range.min;
    const rangeMax = gravityForceScalePowerProperty.range.max;
    const rangeStep = 2;

    // This slider controls the zoom level of the vector arrows
    const slider = new HSlider( gravityForceScalePowerProperty, gravityForceScalePowerProperty.range, {
      trackSize: new Dimension2( 100, 4 ),
      thumbSize: new Dimension2( 14, 28 ),
      tickLabelSpacing: 3,
      constrainValue: ( power: number ) => Math.abs( power ) < 0.5 ? 0 : power,
      shiftKeyboardStep: 0.5,
      keyboardStep: 1,
      pageKeyboardStep: 2,
      trackFillEnabled: SolarSystemCommonColors.foregroundProperty,
      majorTickStroke: SolarSystemCommonColors.foregroundProperty,
      majorTickLength: 8,
      minorTickLength: 8,
      minorTickStroke: SolarSystemCommonColors.foregroundProperty,
      accessibleName: SolarSystemCommonStrings.a11y.scaleSliderStringProperty,
      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: ( rangeMax - rangeMin ) / rangeStep - 1
      },
      tandem: Tandem.OPT_OUT
    } );

    slider.addMajorTick( rangeMin, new RichText( MathSymbols.TIMES + `10<sup>${rangeMin}</sup`, TICK_MARK_OPTIONS ) );
    slider.addMajorTick( rangeMax, new RichText( MathSymbols.TIMES + `10<sup>${rangeMax}</sup`, TICK_MARK_OPTIONS ) );

    for ( let i = 0; i <= 6; i += 2 ) {
      slider.addMinorTick( i );
    }

    super( {
      spacing: 0,
      enabledProperty: gravityVisibleProperty,
      children: [ zoomText, slider ],
      tandem: tandem,
      phetioFeatured: true,
      phetioVisiblePropertyInstrumented: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    this.addLinkedElement( gravityForceScalePowerProperty );
  }
}

solarSystemCommon.register( 'GravityForceZoomControl', GravityForceZoomControl );