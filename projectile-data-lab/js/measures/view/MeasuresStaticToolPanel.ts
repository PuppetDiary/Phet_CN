// Copyright 2023-2025, University of Colorado Boulder

/**
 * The MeasuresStaticToolPanel shows checkboxes to select the static (non-interactive) tools.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { rasterizeNode } from '../../../../scenery/js/util/rasterizeNode.js';
import StaticToolPanel, { ICON_WIDTH, StaticToolPanelOptions } from '../../common-vsm/view/StaticToolPanel.js';
import PDLCheckboxRow from '../../common/view/PDLCheckboxRow.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import DataMeasuresOverlay from './DataMeasuresOverlay.js';

type SelfOptions = EmptySelfOptions;
type MeasuresStaticToolPanelOptions = SelfOptions & StaticToolPanelOptions;

export default class MeasuresStaticToolPanel extends StaticToolPanel {
  public constructor( arePathsVisibleProperty: Property<boolean>, isLaunchAngleVisibleProperty: Property<boolean>,
                      isLaunchSpeedVisibleProperty: Property<boolean>,
                      isMeanVisibleProperty: Property<boolean>,
                      isStandardDeviationVisibleProperty: Property<boolean>,
                      isValuesVisibleProperty: Property<boolean>,
                      providedOptions: MeasuresStaticToolPanelOptions ) {

    class DataMeasuresIconNode extends Node {
      public constructor( showMean: boolean, showStandardDeviation: boolean ) {

        const dataMeasuresNode = rasterizeNode( new DataMeasuresOverlay(
          new ModelViewTransform2(),
          new Property( 0 ),
          new Property( 20 ),
          new BooleanProperty( showMean ),
          new BooleanProperty( showStandardDeviation ),
          new BooleanProperty( false ),
          ICON_WIDTH,
          null, {
            context: 'icon'
          } ), {
            resolution: 4
          } );
        super( {
          children: [ dataMeasuresNode ],
          pickable: false,
          maxWidth: ICON_WIDTH
        } );
      }
    }

    const options = optionize<MeasuresStaticToolPanelOptions, SelfOptions, StaticToolPanelOptions>()( {
      additionalVerticalCheckboxGroupItems: [
        {
          property: isMeanVisibleProperty,
          createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.meanStringProperty, new DataMeasuresIconNode( true, false ) ),
          tandemName: 'meanCheckbox',
          options: {
            phetioDisplayOnlyPropertyInstrumented: true
          }
        }, {
          property: isStandardDeviationVisibleProperty,
          createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.standardDeviationStringProperty, new DataMeasuresIconNode( false, true ) ),
          tandemName: 'standardDeviationCheckbox',
          options: {
            phetioDisplayOnlyPropertyInstrumented: true
          }
        }, {
          property: isValuesVisibleProperty,
          createNode: () => new PDLCheckboxRow( ProjectileDataLabStrings.valuesStringProperty, new Node() ),
          tandemName: 'valuesCheckbox'
        }
      ]
    }, providedOptions );

    super( arePathsVisibleProperty, isLaunchAngleVisibleProperty, isLaunchSpeedVisibleProperty, options );
  }
}

projectileDataLab.register( 'MeasuresStaticToolPanel', MeasuresStaticToolPanel );