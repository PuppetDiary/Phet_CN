// Copyright 2023-2025, University of Colorado Boulder

/**
 * A specific UI component for this sim that changes the angle standard deviation for the launcher. Note that in the UI
 * it is named 'Angle Stability' to convey the behavior, but throughout the code the actual value that is being set
 * is the angle standard deviation.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import VBox, { VBoxOptions } from '../../../../scenery/js/layout/nodes/VBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import phetAudioContext from '../../../../tambo/js/phetAudioContext.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import angleStabilizerClick_mp3 from '../../../sounds/angleStabilizerClick_mp3.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

// The distance between minor tick marks on the slider. The total range is 0 to 1, so there are 4 minor ticks.
const DISTANCE_BETWEEN_MINOR_TICKS = 0.25;

// This is the snap increment for the slider, which is half the distance between minor ticks
const SLIDER_SNAP_INCREMENT = DISTANCE_BETWEEN_MINOR_TICKS / 2;

const filter = new BiquadFilterNode( phetAudioContext, {
  type: 'lowpass',
  Q: 1,
  frequency: 900
} );

const minMaxFilter = new BiquadFilterNode( phetAudioContext, {
  type: 'bandpass',
  Q: 1,
  frequency: 600
} );

const angleStabilizerSoundClip = new SoundClip( angleStabilizerClick_mp3, {
  initialOutputLevel: 0.3,
  additionalAudioNodes: [ filter ]
} );
const angleStabilizerMinSoundClip = new SoundClip( angleStabilizerClick_mp3, {
  initialOutputLevel: 0.3,
  additionalAudioNodes: [ minMaxFilter ],
  initialPlaybackRate: 0.8
} );
const angleStabilizerMaxSoundClip = new SoundClip( angleStabilizerClick_mp3, {
  initialOutputLevel: 0.3,
  additionalAudioNodes: [ minMaxFilter ],
  initialPlaybackRate: 1.6
} );

soundManager.addSoundGenerator( angleStabilizerSoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( angleStabilizerMinSoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( angleStabilizerMaxSoundClip, { categoryName: 'user-interface' } );

type SelfOptions = EmptySelfOptions;
type AngleStabilitySectionOptions = SelfOptions & WithRequired<VBoxOptions, 'tandem'>;

export default class AngleStabilitySection extends VBox {

  public constructor( angleStabilityProperty: PhetioProperty<number>, providedOptions: AngleStabilitySectionOptions ) {
    const playbackRateMapper = ( value: number ) => Utils.linear( 0, 1, 1, 1.4, value );

    const slider = new HSlider( angleStabilityProperty, new Range( 0, 1 ), {
      constrainValue: ( value: number ) => Utils.roundSymmetric( value / SLIDER_SNAP_INCREMENT ) * SLIDER_SNAP_INCREMENT,
      layoutOptions: {
        topMargin: 1,
        stretch: true
      },
      tandem: providedOptions.tandem.createTandem( 'slider' ),
      majorTickLength: 12,
      minorTickLength: 5,
      tickLabelSpacing: 2,
      trackSize: new Dimension2( 50, 0.5 ),
      thumbSize: new Dimension2( 13, 22 ),
      thumbTouchAreaXDilation: 6,
      thumbTouchAreaYDilation: 4, // smaller to prevent overlap with above number spinner buttons
      phetioVisiblePropertyInstrumented: false,
      keyboardStep: 2 * SLIDER_SNAP_INCREMENT,
      shiftKeyboardStep: SLIDER_SNAP_INCREMENT,
      pageKeyboardStep: 4 * SLIDER_SNAP_INCREMENT,

      // This is a lot like the defaults in ValueChangeSoundPlayer with the following differences:
      // 1. The pitch goes down as you go to the right
      // 2. Different sound clips
      // 3. PlaybackRateMappers change the pitch as you cross tick marks
      soundGenerator: new ValueChangeSoundPlayer( new Range( 0, 1 ), {
        middleMovingUpSoundPlayer: angleStabilizerSoundClip,
        middleMovingDownSoundPlayer: angleStabilizerSoundClip,
        middleMovingUpPlaybackRateMapper: playbackRateMapper,
        middleMovingDownPlaybackRateMapper: playbackRateMapper,

        // The threshold delta is set to half the distance between minor ticks, so that the sound is played more frequently
        interThresholdDelta: 0.5 * DISTANCE_BETWEEN_MINOR_TICKS,
        minSoundPlayer: angleStabilizerMinSoundClip,
        maxSoundPlayer: angleStabilizerMaxSoundClip
      } )
    } );
    slider.addMajorTick( 0, new PDLText( ProjectileDataLabStrings.minStringProperty, {
      fontSize: 10,
      maxWidth: 60
    } ) );
    slider.addMajorTick( 1, new PDLText( ProjectileDataLabStrings.maxStringProperty, {
      fontSize: 10,
      maxWidth: 60
    } ) );

    // Compensate for round-off error, prevent drawing a minor tick mark over the rightmost major tick mark
    const MACHINE_EPSILON = 1E-6;
    for ( let i = DISTANCE_BETWEEN_MINOR_TICKS; i < 1 - MACHINE_EPSILON; i += DISTANCE_BETWEEN_MINOR_TICKS ) {
      slider.addMinorTick( i );
    }
    const options = optionize<AngleStabilitySectionOptions, SelfOptions, VBoxOptions>()( {
      phetioFeatured: true,
      topMargin: 5,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      layoutOptions: {
        stretch: true,

        // Workaround since ToggleNode doesn't appear to support layoutOptions.stretch
        minContentWidth: 150
      },
      children: [
        new PDLText( ProjectileDataLabStrings.angleStabilityStringProperty, {
          maxWidth: 150
        } ),
        slider
      ]
    }, providedOptions );
    super( options );
  }
}

projectileDataLab.register( 'AngleStabilitySection', AngleStabilitySection );