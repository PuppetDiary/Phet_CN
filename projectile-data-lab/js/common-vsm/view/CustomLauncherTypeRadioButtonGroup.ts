// Copyright 2023-2025, University of Colorado Boulder

/**
 * CustomLauncherTypeRadioButtonGroup is a group of radio buttons for selecting between mystery and custom launchers
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import { RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import phetAudioContext from '../../../../tambo/js/phetAudioContext.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import explosion_svg from '../../../images/explosion_svg.js';
import pressureWithNeedle_png from '../../../images/pressureWithNeedle_png.js';
import springIcon_svg from '../../../images/springIcon_svg.js';
import launcherTypeExplosion_mp3 from '../../../sounds/launcherTypeExplosion_mp3.js';
import launcherTypePressure_mp3 from '../../../sounds/launcherTypePressure_mp3.js';
import launcherTypeSpring_mp3 from '../../../sounds/launcherTypeSpring_mp3.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import PDLRectangularRadioButtonGroup, { PDLRectangularRadioButtonGroupOptions } from '../../common/view/PDLRectangularRadioButtonGroup.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
type CustomLauncherTypeRadioButtonGroupOptions = SelfOptions & PDLRectangularRadioButtonGroupOptions;

const springSound = new SoundClip( launcherTypeSpring_mp3, { initialOutputLevel: 0.5 } );
soundManager.addSoundGenerator( springSound, { categoryName: 'user-interface' } );

const pressureSound = new SoundClip( launcherTypePressure_mp3, { initialOutputLevel: 0.4 } );
soundManager.addSoundGenerator( pressureSound, { categoryName: 'user-interface' } );

const explosionSound = new SoundClip( launcherTypeExplosion_mp3, {
  initialOutputLevel: 0.3,
  additionalAudioNodes: [
    new BiquadFilterNode( phetAudioContext, {
      type: 'lowpass',
      Q: 1,
      frequency: 200
    } )
  ]
} );

soundManager.addSoundGenerator( explosionSound, { categoryName: 'user-interface' } );

export default class CustomLauncherTypeRadioButtonGroup extends PDLRectangularRadioButtonGroup<LauncherMechanism> {
  public constructor( customLauncherMechanismProperty: PhetioProperty<LauncherMechanism>, providedOptions: CustomLauncherTypeRadioButtonGroupOptions ) {

    const items: RectangularRadioButtonGroupItem<LauncherMechanism>[] = [
      {
        value: LauncherMechanism.SPRING,
        tandemName: 'springRadioButton',
        createNode: () => new Image( springIcon_svg, { scale: 0.14 } ),
        options: {
          soundPlayer: springSound
        }
      }, {
        value: LauncherMechanism.PRESSURE,
        tandemName: 'pressureRadioButton',
        createNode: () => new Image( pressureWithNeedle_png, { scale: 0.18 } ),
        options: {
          soundPlayer: pressureSound
        }
      }, {
        value: LauncherMechanism.EXPLOSION,
        tandemName: 'explosionRadioButton',
        createNode: () => new Image( explosion_svg, { scale: 0.15 } ),
        options: {
          soundPlayer: explosionSound
        }
      } ];

    super( customLauncherMechanismProperty, items, {
      tandem: providedOptions.tandem,
      orientation: 'horizontal',
      align: 'center',
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 5,
        yMargin: 5
      }
    } );
  }
}

projectileDataLab.register( 'CustomLauncherTypeRadioButtonGroup', CustomLauncherTypeRadioButtonGroup );