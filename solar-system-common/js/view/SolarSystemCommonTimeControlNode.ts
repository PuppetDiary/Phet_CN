// Copyright 2023-2025, University of Colorado Boulder

/**
` * Controls time in MySolarSystem
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import TimeControlNode, { TimeControlNodeOptions } from '../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../scenery-phet/js/TimeSpeed.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';

// constants
const PLAY_PAUSE_BUTTON_RADIUS = 34;
const STEP_BUTTON_RADIUS = 23;
const PUSH_BUTTON_SPACING = 8;


// Restart Icon ---------------------------------------------------------------------------
// constants
const scale = 0.75;
const vscale = 1.15;
const barWidth = 4 * scale;
const barHeight = 19 * scale * vscale;
const triangleWidth = 15 * scale;
const triangleHeight = 19 * scale * vscale;
const barPath = new Rectangle( 0, 0, barWidth, barHeight, { fill: 'black' } );
const trianglePath = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( -triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), {
  fill: 'black'
} );
const trianglePath2 = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( -triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), {
  fill: 'black'
} );
const restartIcon = new HBox( { children: [ barPath, trianglePath, trianglePath2 ], spacing: -1 } );

type SelfOptions = {
  restartListener: () => void;
  stepForwardListener: () => void;
  speedRadioButtonGroupOnRight?: boolean;
};

type SolarSystemCommonTimeControlNodeOptions =
  SelfOptions &
  PickRequired<TimeControlNodeOptions, 'tandem' | 'enabledProperty' | 'flowBoxAlign'> &
  PickOptional<TimeControlNodeOptions, 'flowBoxSpacing' | 'speedRadioButtonGroupPlacement'>;

export default class SolarSystemCommonTimeControlNode extends TimeControlNode {

  public constructor( model: SolarSystemCommonModel, providedOptions: SolarSystemCommonTimeControlNodeOptions ) {

    const options = optionize<SolarSystemCommonTimeControlNodeOptions, SelfOptions, TimeControlNodeOptions>()( {

      // SelfOptions
      speedRadioButtonGroupOnRight: true,

      // TimeControlNodeOptions
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW ],
      scale: 0.9,
      playPauseStepButtonOptions: {
        playPauseStepXSpacing: PUSH_BUTTON_SPACING,
        playPauseButtonOptions: {
          radius: PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: STEP_BUTTON_RADIUS,
          listener: () => {
            model.interruptBodiesSubtreeEmitter.emit();
            providedOptions.stepForwardListener();
          },
          touchAreaDilation: 2
        },
        tandem: Tandem.OPT_OUT
      },
      flowBoxSpacing: 20,
      speedRadioButtonGroupPlacement: 'left',
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: new PhetFont( 16 ),
          fill: SolarSystemCommonColors.foregroundProperty
        },
        touchAreaXDilation: 10
      }
    }, providedOptions );

    super( model.isPlayingProperty, options );

    const restartButton = new RoundPushButton( {
      content: new Node( { children: [ restartIcon ] } ),
      enabledProperty: model.hasPlayedProperty,
      radius: STEP_BUTTON_RADIUS,
      touchAreaDilation: 2,
      listener: () => model.restart(),
      innerContent: SolarSystemCommonStrings.a11y.restartStringProperty,
      tandem: Tandem.OPT_OUT
    } );

    this.addPushButton( restartButton, 0 );
  }
}

solarSystemCommon.register( 'SolarSystemCommonTimeControlNode', SolarSystemCommonTimeControlNode );