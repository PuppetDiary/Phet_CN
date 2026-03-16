// Copyright 2024-2025, University of Colorado Boulder

/**
 * MysteryLauncherIcon shows the icon for a mystery launcher.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { rasterizeNode } from '../../../../scenery/js/util/rasterizeNode.js';
import Launcher from '../model/Launcher.js';
import LauncherNode from './LauncherNode.js';

const LAUNCHER_ICON_WIDTH = 35;

export class MysteryLauncherIcon extends Node {
  public constructor( mysteryLauncher: Launcher ) {

    const mysteryLauncherIcon = rasterizeNode( new LauncherNode( ModelViewTransform2.createIdentity(), new Property( 45 ), new Property( 0 ),
      new Property( mysteryLauncher ), null, { isIcon: true } ), {
      resolution: 2.22
    } );
    super( {
      children: [ mysteryLauncherIcon ],
      pickable: false,
      maxWidth: LAUNCHER_ICON_WIDTH,
      top: 0,
      left: 0
    } );
  }
}