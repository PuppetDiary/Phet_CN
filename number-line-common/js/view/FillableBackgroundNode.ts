// Copyright 2023-2025, University of Colorado Boulder

/**
 * Base class for the MoneyJarNode and FillableBagNode. This class provides access to the outlines
 * Path fill so that it can be set in the TotalValueIndicatorNode.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import TPaint from '../../../scenery/js/util/TPaint.js';
import numberLineCommon from '../numberLineCommon.js';

export default class FillableBackgroundNode extends Node {

  private readonly outline: Path;

  public constructor( outline: Path, providedOptions: NodeOptions ) {
    super( providedOptions );

    this.outline = outline;
  }

  public getFill(): TPaint {
    return this.outline.fill;
  }

  public get fill(): TPaint { return this.getFill(); }

  public set fill( fill: TPaint ) { this.setFill( fill ); }

  public setFill( fill: TPaint ): void {
    this.outline.fill = fill;
  }

}

numberLineCommon.register( 'FillableBackgroundNode', FillableBackgroundNode );