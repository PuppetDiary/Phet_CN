// Copyright 2023-2025, University of Colorado Boulder

/**
 * The StaticToolPanel shows checkboxes for non-interactive (static) tools. This file defines checkboxes for the
 * ubiquitous static tools. Please see subclasses for where more screen-specific checkboxes are defined.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import CanvasNode, { CanvasNodeOptions } from '../../../../scenery/js/nodes/CanvasNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { rasterizeNode } from '../../../../scenery/js/util/rasterizeNode.js';
import VerticalCheckboxGroup, { VerticalCheckboxGroupItem } from '../../../../sun/js/VerticalCheckboxGroup.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLCheckboxRow from '../../common/view/PDLCheckboxRow.js';
import { PDLPanel, PDLPanelOptions } from '../../common/view/PDLPanel.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import AngleToolNode from './AngleToolNode.js';
import SpeedToolNode from './SpeedToolNode.js';

type SelfOptions = {
  additionalVerticalCheckboxGroupItems?: VerticalCheckboxGroupItem[];
};
export type StaticToolPanelOptions = SelfOptions & WithRequired<PDLPanelOptions, 'tandem'>;

export const ICON_WIDTH = 19;

export default class StaticToolPanel extends PDLPanel {

  public constructor(
    arePathsVisibleProperty: Property<boolean>,
    isLaunchAngleVisibleProperty: Property<boolean>,
    isLaunchSpeedVisibleProperty: Property<boolean>,
    providedOptions: StaticToolPanelOptions ) {

    const options = optionize<StaticToolPanelOptions, SelfOptions, PDLPanelOptions>()( {
      additionalVerticalCheckboxGroupItems: []
    }, providedOptions );

    class PathsIcon extends Node {
      public constructor() {

        const PATH_ICON_HEIGHT = 18;

        class MyCanvasNode extends CanvasNode {
          public constructor( options: CanvasNodeOptions ) {
            super( options );
          }

          public override paintCanvas( context: CanvasRenderingContext2D ): void {

            const color = PDLColors.pathAirborneStrokeProperty.value.toCSS();
            context.save();
            context.strokeStyle = color;
            context.lineWidth = 1.5;
            context.lineCap = 'round';

            context.beginPath();
            context.moveTo( -ICON_WIDTH / 2, PATH_ICON_HEIGHT );
            context.quadraticCurveTo( 0, -PATH_ICON_HEIGHT, ICON_WIDTH / 2, PATH_ICON_HEIGHT );
            context.stroke();
            context.restore();
          }
        }

        const canvasNode = new MyCanvasNode( {
          canvasBounds: new Bounds2( -ICON_WIDTH / 2, 0, ICON_WIDTH / 2, PATH_ICON_HEIGHT )
        } );
        super( {
          children: [ canvasNode ],
          pickable: false,
          maxWidth: ICON_WIDTH
        } );
      }
    }

    class AngleToolIconNode extends Node {
      public constructor() {

        const angleToolNode = rasterizeNode( new AngleToolNode(
          new NumberProperty( 45 ),
          new Property( false ), {
            isIcon: true
          } ), {
          resolution: 1.25
        } );
        super( {
          children: [ angleToolNode ],
          pickable: false,
          maxWidth: ICON_WIDTH
        } );
      }
    }

    class SpeedToolIconNode extends Node {
      public constructor() {

        const speedToolNode = rasterizeNode( new SpeedToolNode(
          new NumberProperty( 15 ),
          new Property( false ), {
            isIcon: true
          } ), {
            resolution: 1.25
          } );
        super( {
          children: [ speedToolNode ],
          pickable: false,
          maxWidth: ICON_WIDTH
        } );
      }
    }

    const checkboxGroup = new VerticalCheckboxGroup( [ {
      property: arePathsVisibleProperty,
      createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.pathsStringProperty, new PathsIcon() ),
      tandemName: 'pathsCheckbox'
    }, {
      property: isLaunchAngleVisibleProperty,
      createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.launchAngleStringProperty, new AngleToolIconNode() ),
      tandemName: 'launchAngleCheckbox'
    }, {
      property: isLaunchSpeedVisibleProperty,
      createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.launchSpeedStringProperty, new SpeedToolIconNode() ),
      tandemName: 'launchSpeedCheckbox'
    },
      ...options.additionalVerticalCheckboxGroupItems
    ], {
      tandem: options.tandem.createTandem( 'checkboxGroup' ),
      phetioFeatured: true,
      phetioVisiblePropertyInstrumented: false,
      checkboxOptions: {
        boxWidth: PDLConstants.VERTICAL_CHECKBOX_GROUP_CHECKBOX_WIDTH
      }
    } );
    super( checkboxGroup, options );
  }
}

projectileDataLab.register( 'StaticToolPanel', StaticToolPanel );