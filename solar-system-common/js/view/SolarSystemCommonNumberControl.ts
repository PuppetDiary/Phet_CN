// Copyright 2023-2025, University of Colorado Boulder

/**
 * Universal slider for SolarSystemCommon
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import NumberControl, { NumberControlOptions } from '../../../scenery-phet/js/NumberControl.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import ValueChangeSoundPlayer from '../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Tandem from '../../../tandem/js/Tandem.js';
import brightMarimba_mp3 from '../../sounds/brightMarimba_mp3.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';

type SelfOptions = EmptySelfOptions;

export type SolarSystemCommonNumberControlOptions = SelfOptions &
  StrictOmit<NumberControlOptions, 'isDisposable'> &
  PickRequired<NumberControlOptions, 'tandem'>;

export default class SolarSystemCommonNumberControl extends NumberControl {

  public constructor( valueProperty: Property<number>, range: Range, providedOptions?: SolarSystemCommonNumberControlOptions ) {

    const SLIDER_INITIAL_OUTPUT_LEVEL = 0.1;

    // Create a function to map the mass value to the playback rate of the associated sound.
    // Larger mass values result in lower pitch, so that bigger bodies have a deeper sound.
    const playbackRateMapper = ( value: number ) => 0.5 + ( range.max - value ) / range.getLength();

    // sound clip for mass changes
    const massSliderSoundClip = new SoundClip( brightMarimba_mp3, { initialOutputLevel: SLIDER_INITIAL_OUTPUT_LEVEL } );
    soundManager.addSoundGenerator( massSliderSoundClip );

    const valueChangeSoundGeneratorOptions = {
      middleMovingUpSoundPlayer: massSliderSoundClip,
      middleMovingDownSoundPlayer: massSliderSoundClip,
      minSoundPlayer: ValueChangeSoundPlayer.USE_MIDDLE_SOUND,
      maxSoundPlayer: ValueChangeSoundPlayer.USE_MIDDLE_SOUND,
      middleMovingUpPlaybackRateMapper: playbackRateMapper,
      interThresholdDelta: SolarSystemCommonConstants.MASS_SLIDER_STEP - 0.1
    };

    const options = optionize<SolarSystemCommonNumberControlOptions, SelfOptions, NumberControlOptions>()( {

      // NumberControlOptions
      isDisposable: false,
      valueChangeSoundGeneratorOptions: valueChangeSoundGeneratorOptions,

      //a11y
      accessibleName: SolarSystemCommonStrings.a11y.massSliderStringProperty,
      sliderOptions: {
        trackSize: new Dimension2( 226, 2 ),
        thumbSize: new Dimension2( 15, 25 ),
        thumbTouchAreaYDilation: 2,
        thumbCenterLineStroke: 'black',
        trackFillEnabled: SolarSystemCommonColors.foregroundProperty,
        trackStroke: SolarSystemCommonColors.foregroundProperty,
        tandem: Tandem.OPT_OUT
      },
      titleNodeOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberDisplayOptions: {
        tandem: Tandem.OPT_OUT
      },
      arrowButtonOptions: {
        baseColor: 'white',
        stroke: 'black',
        lineWidth: 1,
        scale: 0.8,
        touchAreaYDilation: 2.5,
        tandem: Tandem.OPT_OUT
      },
      layoutFunction: ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
        assert && assert( decrementButton && incrementButton );
        return new HBox( {
          spacing: 10,
          children: [ decrementButton!, slider, incrementButton! ]
        } );
      }
    }, providedOptions );

    // Unfortunately, NumberControl is hard-coded to require a title, and always creates a titleNode. Therefore
    // we have to pass a title string, even though it will not be displayed due to our custom layout.
    super( '', valueProperty, range, options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonNumberControl', SolarSystemCommonNumberControl );