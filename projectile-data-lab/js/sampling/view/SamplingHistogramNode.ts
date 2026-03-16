// Copyright 2024-2025, University of Colorado Boulder

/**
 * The SamplingHistogramNode shows the histogram for a sampling field, extending the standard HistogramNode and adding
 * Sampling-screen-specific elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Field from '../../common/model/Field.js';
import Histogram from '../../common/model/Histogram.js';
import Launcher from '../../common/model/Launcher.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLQueryParameters from '../../common/PDLQueryParameters.js';
import HistogramNode, { HistogramNodeOptions } from '../../common/view/HistogramNode.js';
import { MysteryLauncherIcon } from '../../common/view/MysteryLauncherIcon.js';
import { PDLPanel } from '../../common/view/PDLPanel.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import SamplingField from '../model/SamplingField.js';

export default class SamplingHistogramNode extends HistogramNode {
  public constructor( launcherProperty: TReadOnlyProperty<Launcher>,
                      sampleSizeProperty: TReadOnlyProperty<number>,
                      numberOfSamplesProperty: TReadOnlyProperty<number>,
                      fieldProperty: TReadOnlyProperty<SamplingField>,
                      fields: Field[],
                      histogram: Histogram,
                      histogramSoundEnabledProperty: TReadOnlyProperty<boolean>,
                      horizontalAxisLabelText: TReadOnlyProperty<string>,
                      comboBoxParent: Node,
                      options: HistogramNodeOptions ) {
    
    super(
      fieldProperty,
      fields,
      horizontalAxisLabelText,
      histogram,
      histogramSoundEnabledProperty,
      comboBoxParent,
      PDLColors.meanMarkerFillProperty,
      PDLColors.meanMarkerStrokeProperty,
      options
    );

    const iconNode = new Node();
    launcherProperty.link( launcher => {
      iconNode.children = [ new MysteryLauncherIcon( launcher ) ];
    } );

    const launcherNumberProperty = new DerivedProperty( [ launcherProperty ], launcher => launcher.launcherNumber );

    const maxTextNode = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.numberOfSamplesPatternStringProperty,
      { numberOfSamples: new Property( PDLQueryParameters.maxSamples ) } ), { font: PDLConstants.SAMPLING_HISTOGRAM_PANEL_FONT } );

    const launcherTextProperty = new PatternStringProperty( ProjectileDataLabStrings.launcherNumberPatternStringProperty,
      { number: launcherNumberProperty } );
    const sampleSizeTextProperty = new PatternStringProperty( ProjectileDataLabStrings.sampleSizeNPatternStringProperty,
      { sampleSize: sampleSizeProperty } );
    const numberOfSamplesTextProperty = new PatternStringProperty( ProjectileDataLabStrings.numberOfSamplesPatternStringProperty,
      { numberOfSamples: numberOfSamplesProperty } );
    const launcherText = new PDLText( launcherTextProperty, { font: PDLConstants.SAMPLING_HISTOGRAM_PANEL_FONT } );
    const sampleSizeText = new PDLText( sampleSizeTextProperty, { font: PDLConstants.SAMPLING_HISTOGRAM_PANEL_FONT } );
    const sampleNumberText = new PDLText( numberOfSamplesTextProperty, { font: PDLConstants.SAMPLING_HISTOGRAM_PANEL_FONT } );
    const textVBox = new VBox( {

      // Prevent from overlapping with the majority of the data in ?stringTest=long
      maxWidth: 240,

      align: 'left',
      children: [
        launcherText,
        sampleSizeText,
        sampleNumberText
      ]
    } );

    Multilink.multilink( [ maxTextNode.boundsProperty, launcherTextProperty, sampleSizeTextProperty, numberOfSamplesTextProperty, launcherText.boundsProperty, sampleSizeText.boundsProperty, sampleNumberText.boundsProperty ], () => {
      textVBox.minContentWidth = Math.max( maxTextNode.width, launcherText.width, sampleSizeText.width, sampleNumberText.width );
      iconNode.maxHeight = textVBox.height;
    } );

    const textPanel = new PDLPanel( new HBox( {
      spacing: 5,
      children: [ iconNode, textVBox ]
    } ), {
      fill: 'white',
      cornerRadius: 5
    } );
    this.chartNode.addChild( textPanel );

    ManualConstraint.create( this, [ textPanel, this.chartBackground ], ( textPanelProxy, chartBackgroundProxy ) => {
      textPanelProxy.left = chartBackgroundProxy.left + PDLConstants.HISTOGRAM_PANEL_MARGIN;
      textPanelProxy.top = chartBackgroundProxy.top + PDLConstants.HISTOGRAM_PANEL_MARGIN;
    } );
  }
}

projectileDataLab.register( 'SamplingHistogramNode', SamplingHistogramNode );