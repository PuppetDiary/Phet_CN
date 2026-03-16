// Copyright 2023-2025, University of Colorado Boulder

/**
 * The ProjectileTypeSection shows the projectile type radio buttons.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import hollowThud_mp3 from '../../../../tambo/sounds/hollowThud_mp3.js';
import cannonball_png from '../../../images/cannonball_png.js';
import piano_png from '../../../images/piano_png.js';
import pumpkin_png from '../../../images/pumpkin_png.js';
import projectileTypeCannonball_mp3 from '../../../sounds/projectileTypeCannonball_mp3.js';
import projectileTypePiano_mp3 from '../../../sounds/projectileTypePiano_mp3.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import ProjectileType, { CANNONBALL, PIANO, PUMPKIN } from '../model/ProjectileType.js';
import PDLPanelSection, { PDLPanelSectionOptions } from './PDLPanelSection.js';
import PDLRectangularRadioButtonGroup from './PDLRectangularRadioButtonGroup.js';

const cannonballSoundClip = new SoundClip( projectileTypeCannonball_mp3, { initialOutputLevel: 0.2 } );
const pumpkinSoundClip = new SoundClip( hollowThud_mp3, { initialOutputLevel: 0.2 } );
const pianoSoundClip = new SoundClip( projectileTypePiano_mp3, { initialOutputLevel: 0.2 } );

soundManager.addSoundGenerator( cannonballSoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( pumpkinSoundClip, { categoryName: 'user-interface' } );
soundManager.addSoundGenerator( pianoSoundClip, { categoryName: 'user-interface' } );

type SelfOptions = EmptySelfOptions;
type ProjectileTypeSectionOptions = SelfOptions & PDLPanelSectionOptions;

export default class ProjectileTypeSection extends PDLPanelSection {

  public constructor( projectileTypeProperty: PhetioProperty<ProjectileType>, providedOptions: ProjectileTypeSectionOptions ) {

    const projectileTypeRadioButtonGroup = new PDLRectangularRadioButtonGroup( projectileTypeProperty, [ {
      value: CANNONBALL,
      tandemName: 'cannonballRadioButton',
      createNode: () => new Image( cannonball_png, { scale: 0.22 } ),
      options: {
        soundPlayer: cannonballSoundClip
      }
    }, {
      value: PUMPKIN,
      tandemName: 'pumpkinRadioButton',
      createNode: () => new Image( pumpkin_png, { scale: 0.20 } ),
      options: {
        soundPlayer: pumpkinSoundClip
      }
    }, {
      value: PIANO,
      tandemName: 'pianoRadioButton',
      createNode: () => new Image( piano_png, { scale: 0.15 } ),
      options: {
        soundPlayer: pianoSoundClip
      }
    } ], {
      tandem: providedOptions.tandem.createTandem( 'projectileTypeRadioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false, // As the only UI control in the panel, the visibility is controlled by the parent panel
      phetioFeatured: true,
      orientation: 'horizontal',
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 5,
        yMargin: 5
      },
      layoutOptions: {
        align: 'center'
      }
    } );

    super( ProjectileDataLabStrings.projectileStringProperty, projectileTypeRadioButtonGroup, providedOptions );
  }
}

projectileDataLab.register( 'ProjectileTypeSection', ProjectileTypeSection );