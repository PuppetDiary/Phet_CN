// Copyright 2023-2025, University of Colorado Boulder

/**
 * SolarSystemCommonMeasuringTapeNode is the specialization of MeasuringTapeNode using in sims that depend on
 * solar-system-common.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonMeasuringTape from '../model/SolarSystemCommonMeasuringTape.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';

const SHIFT_DRAG_SPEED = 100; // for keyboard dragging

export default class SolarSystemCommonMeasuringTapeNode extends MeasuringTapeNode {

  public constructor( measuringTape: SolarSystemCommonMeasuringTape,
                      visibleProperty: TReadOnlyProperty<boolean>,
                      visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
                      modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>,
                      tandem: Tandem ) {

    // Units must update dynamically when AUStringProperty changes.
    const unitsProperty = new DerivedProperty( [ SolarSystemCommonStrings.units.AUStringProperty ],
      AUString => {
        return { name: AUString, multiplier: 1 };
      } );

    super( unitsProperty, {
      basePositionProperty: measuringTape.basePositionProperty,
      tipPositionProperty: measuringTape.tipPositionProperty,
      visibleProperty: visibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )', // translucent white
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      significantFigures: 2,
      baseKeyboardDragListenerOptions: {
        shiftDragSpeed: SHIFT_DRAG_SPEED
      },
      tipKeyboardDragListenerOptions: {
        shiftDragSpeed: SHIFT_DRAG_SPEED
      },
      tandem: tandem,
      phetioFeatured: true,
      phetioReadoutStringPropertyInstrumented: false,
      phetioFeaturedMeasuredDistanceProperty: true
    } );

    this.addLinkedElement( measuringTape );

    // Constrain dragging to visibleBounds.
    Multilink.multilink(
      [ visibleBoundsProperty, modelViewTransformProperty ],
      ( visibleBounds, modelViewTransform ) => {
        this.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds.eroded( 10 ) ) );
        this.modelViewTransformProperty.value = modelViewTransform;
      }
    );
  }
}

solarSystemCommon.register( 'SolarSystemCommonMeasuringTapeNode', SolarSystemCommonMeasuringTapeNode );