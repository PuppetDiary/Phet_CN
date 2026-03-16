// Copyright 2023-2025, University of Colorado Boulder

/**
 * MysteryLauncherControl is a control that shows the radio buttons that choose between the different mystery launchers.
 * A wrapper is needed to help the layout wrap.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Shape from '../../../../kite/js/Shape.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import HotkeyData from '../../../../scenery/js/input/HotkeyData.js';
import KeyboardListener from '../../../../scenery/js/listeners/KeyboardListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import projectileDataLab from '../../projectileDataLab.js';
import Launcher, { MYSTERY_LAUNCHERS } from '../model/Launcher.js';
import { MysteryLauncherIcon } from './MysteryLauncherIcon.js';
import PDLRectangularRadioButtonGroup from './PDLRectangularRadioButtonGroup.js';
import PDLText from './PDLText.js';

const LAUNCHER_BUTTON_CORNER_RADIUS = 2;

export default class MysteryLauncherControl extends Node {
  public constructor( launcherProperty: PhetioProperty<Launcher>, providedOptions: WithRequired<NodeOptions, 'tandem'> ) {

    const mysteryLauncherRadioButtonGroupItems = MYSTERY_LAUNCHERS.map( mysteryLauncher => {
      return {
        value: mysteryLauncher,
        tandemName: `mysteryLauncher${mysteryLauncher.launcherNumber}RadioButton`,

        // The Panel provides larger bounds around the text, for making the button the size we want.
        createNode: () => {
          const launcherIcon = new MysteryLauncherIcon( mysteryLauncher );
          const launcherIconPaddingX = 6;
          const launcherIconPaddingTopY = 1;

          const launcherIconBoundsWithPadding = launcherIcon.bounds.dilatedX( launcherIconPaddingX ).dilatedY( launcherIconPaddingTopY ).shiftY( -launcherIconPaddingTopY );

          const numberLabel = new PDLText( mysteryLauncher.launcherNumber.toString(), { fontSize: 14 } );

          launcherProperty.link( launcher => {
            numberLabel.fontWeight = launcher === mysteryLauncher ? 'bold' : 'normal';
            numberLabel.setFill( launcher === mysteryLauncher ? 'white' : 'black' );
          } );

          const numberLabelBounds = numberLabel.bounds;

          const numberLabelBackgroundShape = Shape.roundedRectangleWithRadii(
            numberLabelBounds.x,
            numberLabelBounds.y,
            numberLabelBounds.width + 8,
            numberLabelBounds.height + 2,
            {
              topLeft: LAUNCHER_BUTTON_CORNER_RADIUS,
              topRight: 0,
              bottomRight: LAUNCHER_BUTTON_CORNER_RADIUS,
              bottomLeft: 0
            } );

          const strokeProperty = new DerivedProperty( [ launcherProperty ], launcher => {
            return launcher === mysteryLauncher ? null : '#333333';
          } );
          const fillProperty = new DerivedProperty( [ launcherProperty ], launcher => {
            return launcher === mysteryLauncher ? 'rgb(87,178,226)' : '#FCFCFC';
          } );

          // The stroke width of the mystery launcher number panel
          const lineWidth = 1;

          const numberLabelBackground = new Path( numberLabelBackgroundShape, {
            top: -lineWidth,
            left: -lineWidth,
            fill: fillProperty,
            stroke: strokeProperty,
            lineWidth: lineWidth
          } );

          numberLabel.center = numberLabelBackground.center;

          const numberLabelContainer = new Node( { children: [ numberLabelBackground, numberLabel ], pickable: false } );

          const launcherIconContainer = new Rectangle( launcherIconBoundsWithPadding, {
            children: [ launcherIcon, numberLabelContainer ]
          } );

          numberLabelContainer.top = launcherIconContainer.top;
          numberLabelContainer.left = launcherIconContainer.left;
          launcherIcon.centerX = launcherIconContainer.centerX;

          return launcherIconContainer;
        }
      };
    } );

    const mysteryLauncherRadioButtonGroup = new PDLRectangularRadioButtonGroup( launcherProperty, mysteryLauncherRadioButtonGroupItems, {
      tandem: providedOptions.tandem.createTandem( 'mysteryLauncherRadioButtonGroup' ),
      phetioFeatured: true,
      orientation: 'horizontal',

      // The width of the radio button group is manually-tuned to fit the mystery launcher icons in a 3x2 grid.
      // This ensures that the radio buttons will appear in two rows.
      preferredWidth: 159,

      lineSpacing: 4,
      wrap: true,
      phetioVisiblePropertyInstrumented: false, // As the only UI control in the panel, the visibility is controlled by the parent panel
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 0,
        yMargin: 0,
        cornerRadius: LAUNCHER_BUTTON_CORNER_RADIUS
      }
    } );

    // a listener that selects a field based on the keystroke, regardless of where focus is in the document
    mysteryLauncherRadioButtonGroup.addInputListener( new KeyboardListener( {
      keyStringProperties: MysteryLauncherControl.SELECT_LAUNCHER_HOTKEY_DATA.keyStringProperties,
      fire: ( event, keysPressed ) => {
        const key = parseInt( keysPressed, 10 );

        const launcher = MYSTERY_LAUNCHERS.find( launcher => launcher.launcherNumber === key )!;
        launcherProperty.value = launcher;

        // Move focus to the radio button that was selected. Without this line, focus would incorrectly remain
        // on the previous button.
        mysteryLauncherRadioButtonGroup.getButtonForValue( launcher ).focus();
      }
    } ) );

    super( {
      children: [ mysteryLauncherRadioButtonGroup ],
      layoutOptions: {
        align: 'center'
      }
    } );
  }

  public static readonly SELECT_LAUNCHER_HOTKEY_DATA = new HotkeyData( {
    keys: [
      '1', '2', '3',
      '4', '5', '6'
    ],
    repoName: projectileDataLab.name,
    binderName: 'Select Launcher'
  } );
}

projectileDataLab.register( 'MysteryLauncherControl', MysteryLauncherControl );