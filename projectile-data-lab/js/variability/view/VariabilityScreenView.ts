// Copyright 2023-2025, University of Colorado Boulder

/**
 * The VariabilityScreenView represents the view for the Variability Screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import VSMField from '../../common-vsm/model/VSMField.js';
import InteractiveToolPanel from '../../common-vsm/view/InteractiveToolPanel.js';
import StaticToolPanel from '../../common-vsm/view/StaticToolPanel.js';
import VSMHistogramNode from '../../common-vsm/view/VSMHistogramNode.js';
import VSMScreenView, { VSMScreenViewOptions } from '../../common-vsm/view/VSMScreenView.js';
import PDLColors from '../../common/PDLColors.js';
import { histogramAccordionBoxTandemName } from '../../common/view/HistogramAccordionBox.js';
import LauncherNode from '../../common/view/LauncherNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import VariabilityModel from '../model/VariabilityModel.js';
import VariabilityLaunchPanel from './VariabilityLaunchPanel.js';

type SelfOptions = EmptySelfOptions;

type VariabilityScreenViewOptions = SelfOptions & StrictOmit<VSMScreenViewOptions, 'createLauncherNode'>;

export default class VariabilityScreenView extends VSMScreenView<VSMField> {

  public constructor( model: VariabilityModel, providedOptions: VariabilityScreenViewOptions ) {
    const options = optionize<VariabilityScreenViewOptions, SelfOptions, VSMScreenViewOptions>()( {

      createLauncherNode: modelViewTransform => new LauncherNode(
        modelViewTransform,
        model.meanLaunchAngleProperty,
        model.launcherHeightProperty,
        model.launcherProperty,
        model.fieldProperty
      )
    }, providedOptions );

    const launchPanel = new VariabilityLaunchPanel( model.launcherOrientationProperty, model.projectileTypeProperty, model.launcherProperty, {
      tandem: options.tandem.createTandem( 'launchPanel' )
    } );

    const staticToolPanel = new StaticToolPanel( model.isPathsVisibleProperty, model.isLaunchAngleVisibleProperty, model.isLaunchSpeedVisibleProperty, {
      tandem: options.tandem.createTandem( 'staticToolPanel' )
    } );
    const interactiveToolPanel = new InteractiveToolPanel(
      model.isMeasuringTapeVisibleProperty,
      model.stopwatch.isVisibleProperty, {
        tandem: options.tandem.createTandem( 'interactiveToolPanel' )
      } );

    const createHistogramNode = ( node: Node ) => new VSMHistogramNode(
      model.fieldProperty,
      model.fields,
      model.totalProjectileCountProperty,
      model.numberOfLandedProjectilesProperty,
      ProjectileDataLabStrings.distanceStringProperty,
      model.histogram,
      node,
      PDLColors.histogramDataFillProperty,
      PDLColors.histogramDataStrokeProperty, {
        tandem: options.tandem.createTandem( histogramAccordionBoxTandemName ).createTandem( 'histogramNode' )
      } );

    super( model, launchPanel, staticToolPanel, interactiveToolPanel, createHistogramNode, options );
  }
}
projectileDataLab.register( 'VariabilityScreenView', VariabilityScreenView );