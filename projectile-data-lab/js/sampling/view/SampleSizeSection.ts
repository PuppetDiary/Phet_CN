// Copyright 2023-2024, University of Colorado Boulder

/**
 * The SampleSizeSection shows the sample size radio buttons.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import sampleSize15_mp3 from '../../../sounds/sampleSize15_mp3.js';
import sampleSize2_mp3 from '../../../sounds/sampleSize2_mp3.js';
import sampleSize40_mp3 from '../../../sounds/sampleSize40_mp3.js';
import sampleSize5_mp3 from '../../../sounds/sampleSize5_mp3.js';
import PDLPanelSection, { PDLPanelSectionOptions } from '../../common/view/PDLPanelSection.js';
import PDLRectangularRadioButtonGroup from '../../common/view/PDLRectangularRadioButtonGroup.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

const sampleSize2SoundClip = new SoundClip( sampleSize2_mp3, { initialOutputLevel: 0.2 } );
const sampleSize5SoundClip = new SoundClip( sampleSize5_mp3, { initialOutputLevel: 0.2 } );
const sampleSize15SoundClip = new SoundClip( sampleSize15_mp3, { initialOutputLevel: 0.2 } );
const sampleSize40SoundClip = new SoundClip( sampleSize40_mp3, { initialOutputLevel: 0.2 } );

soundManager.addSoundGenerator( sampleSize2SoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( sampleSize5SoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( sampleSize15SoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( sampleSize40SoundClip, { categoryName: 'user-interface' } );

type SelfOptions = EmptySelfOptions;
type SampleSizeSectionOptions = SelfOptions & PDLPanelSectionOptions;

export default class SampleSizeSection extends PDLPanelSection {

  public constructor( sampleSizeProperty: Property<number>, providedOptions: SampleSizeSectionOptions ) {

    const buttonSoundClips = new Map( [
      [ 2, sampleSize2SoundClip ],
      [ 5, sampleSize5SoundClip ],
      [ 15, sampleSize15SoundClip ],
      [ 40, sampleSize40SoundClip ]
    ] );

    const sampleSizeRadioButtonGroupItems = sampleSizeProperty.validValues!.map( sampleSize => {
      return {
        value: sampleSize,
        tandemName: `sampleSize${sampleSize}RadioButton`,
        createNode: () => new PDLText( sampleSize.toString() ),
        options: {
          soundPlayer: buttonSoundClips.get( sampleSize )
        }
      };
    } );

    const sampleSizeRadioButtonGroup = new PDLRectangularRadioButtonGroup( sampleSizeProperty, sampleSizeRadioButtonGroupItems, {
      tandem: providedOptions.tandem.createTandem( 'sampleSizeRadioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false, // As the only UI control in the panel, the visibility is controlled by the parent panel
      phetioFeatured: true,
      orientation: 'horizontal',
      spacing: 5,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 9,
        yMargin: 9
      },
      layoutOptions: {
        align: 'center'
      }
    } );
    super( ProjectileDataLabStrings.sampleSizeNStringProperty, sampleSizeRadioButtonGroup, providedOptions );
  }
}

projectileDataLab.register( 'SampleSizeSection', SampleSizeSection );