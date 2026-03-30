// Copyright 2025, University of Colorado Boulder

/**
 * Welcome Dialog for forces-and-motion-basics simulation
 * Shows on first visit to welcome users to the physics lab
 *
 * @author AI Education Project Team
 */

import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PopupDialog from '../../../../sun/js/PopupDialog.js';
import HomeScreen from '../../../joist/js/HomeScreen.js';
import { type HomeScreenOptions } from '../../../joist/js/HomeScreen.js';
import joist from '../../../joist/js/joist.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';

type SelfOptions = {
  onStart?: () => void;
};

export type WelcomeDialogOptions = SelfOptions;

/**
 * Welcome dialog that appears when the simulation first loads
 */
export class WelcomeDialog extends PopupDialog {

  public constructor( providedOptions: WelcomeDialogOptions ) {
    const options = optionize<WelcomeDialogOptions, EmptySelfOptions>()( {
      onStart: () => {}
    }, providedOptions );

    // Create the welcome content
    const contentNode = createWelcomeContent( options.onStart );

    // Create the dialog
    super( contentNode, {
      backgroundPickable: true,
      tandem: Tandem.OPT_OUT // Don't track in PhET-iO
    } );
  }
}

/**
 * Create the welcome content node
 */
function createWelcomeContent( onStartCallback: () => void ): Node {
  const contentWidth = 500;
  const contentHeight = 350;
  const cornerRadius = 16;

  // Main container
  const container = new Node( {
    children: []
  } );

  // Background with gradient
  const background = new Rectangle( 0, 0, contentWidth, contentHeight, {
    cornerRadius: cornerRadius,
    fill: new LinearGradient( 0, 0, 0, contentHeight )
      .addColorStop( 0, '#1a1a2e' )
      .addColorStop( 1, '#16213e' ),
    stroke: '#00f2ff',
    lineWidth: 2
  } );

  // Title
  const titleNode = new RichText( '欢迎来到<br>力和运动实验室', {
    font: new PhetFont( { size: 28, weight: 'bold' } ),
    fill: '#00f2ff',
    align: 'center',
    maxWidth: contentWidth - 60
  } );

  // Welcome message
  const messageNode = new RichText(
    '在这里，你将通过有趣的互动实验，<br>' +
    '探索力的奥秘，理解运动的基本规律。<br><br>' +
    '✨ 四个实验模块等你探索<br>' +
    '🎮 真实的物理模拟<br>' +
    '📊 实时数据反馈',
    {
      font: new PhetFont( 16 ),
      fill: '#cbd5e1',
      align: 'center',
      maxWidth: contentWidth - 60,
      lineSpacing: 12
    }
  );

  // Start button background
  const buttonBackground = new Rectangle( 0, 0, 180, 48, {
    cornerRadius: 24,
    fill: '#00f2ff',
    cursor: 'pointer'
  } );

  // Start button text
  const buttonText = new Text( '开始探索', {
    font: new PhetFont( { size: 18, weight: 'bold' } ),
    fill: '#1a1a2e',
    centerX: 90,
    centerY: 24
  } );

  // Button container
  const buttonNode = new Node( {
    children: [ buttonBackground, buttonText ],
    cursor: 'pointer',
    inputEnabled: true
  } );

  // Add click handler
  buttonNode.addInputListener( {
    click: () => {
      onStartCallback();
    }
  } );

  // Add hover effect
  buttonNode.addInputListener( {
    enter: () => {
      buttonBackground.fill = '#4dffff';
    },
    exit: () => {
      buttonBackground.fill = '#00f2ff';
    }
  } );

  // Position elements
  titleNode.centerX = contentWidth / 2;
  titleNode.top = 40;

  messageNode.centerX = contentWidth / 2;
  messageNode.top = titleNode.bottom + 25;

  buttonNode.centerX = contentWidth / 2;
  buttonNode.bottom = contentHeight - 30;

  // Add all children
  container.addChild( background );
  container.addChild( titleNode );
  container.addChild( messageNode );
  container.addChild( buttonNode );

  return container;
}

forcesAndMotionBasics.register( 'WelcomeDialog', WelcomeDialog );
export default WelcomeDialog;
