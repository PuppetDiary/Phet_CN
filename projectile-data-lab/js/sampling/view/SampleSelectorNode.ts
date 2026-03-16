// Copyright 2023-2025, University of Colorado Boulder

/**
 * The SampleSelectorNode allows the user to select from the various started samples.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import { MeanTone } from '../../common/model/MeanTone.js';
import PDLConstants from '../../common/PDLConstants.js';
import MeanIndicatorNode from '../../common/view/MeanIndicatorNode.js';
import PDLText from '../../common/view/PDLText.js';
import SelectorNode, { SelectorNodeOptions } from '../../common/view/SelectorNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import SamplingField from '../model/SamplingField.js';
import { SamplingPhase } from '../model/SamplingPhase.js';

type SelfOptions = EmptySelfOptions;
type SampleSelectorPanelOptions = SelfOptions & StrictOmit<SelectorNodeOptions, 'playSound'>;

const MAX_TEXT_WIDTH = 120;

export default class SampleSelectorNode extends SelectorNode {

  public constructor(
    samplingFieldProperty: TReadOnlyProperty<SamplingField>,
    selectedSampleNumberProperty: PhetioProperty<number>,
    numberOfStartedSamplesProperty: TReadOnlyProperty<number>,
    numberOfCompletedSamplesProperty: TReadOnlyProperty<number>,
    sampleMeanProperty: TReadOnlyProperty<number | null>,
    phaseProperty: TReadOnlyProperty<SamplingPhase>,
    isContinuousLaunchingProperty: TReadOnlyProperty<boolean>,
    providedOptions: SampleSelectorPanelOptions ) {

    const options = optionize<SampleSelectorPanelOptions, SelfOptions, SelectorNodeOptions>()( {
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      playSound: sampleNumber => {
        const mean = _.mean( samplingFieldProperty.value.getProjectilesInSample( sampleNumber ).map( projectile => projectile.x ) );
        MeanTone.playMean( mean );
      }
    }, providedOptions );

    const isDataAvailableProperty: TReadOnlyProperty<boolean> = new DerivedProperty( [ numberOfStartedSamplesProperty ], numberOfStartedSamples => {
      return numberOfStartedSamples > 0;
    } );

    const sampleNumberText = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.sampleNumberOfCountPatternStringProperty, {
      number: selectedSampleNumberProperty,
      count: numberOfStartedSamplesProperty
    } ), {
      font: PDLConstants.SELECTOR_FONT,
      maxWidth: MAX_TEXT_WIDTH
    } );

    const creatingText = new PDLText( ProjectileDataLabStrings.creatingStringProperty, {
      font: PDLConstants.SELECTOR_FONT,
      maxWidth: MAX_TEXT_WIDTH
    } );

    const meanText = new PDLText( new PatternStringProperty( ProjectileDataLabStrings.meanEqualsValueMPatternStringProperty, {
      value: new DerivedProperty( [ sampleMeanProperty ], ( mean: number | null ) => {
        return mean === null ? 'null' : Utils.toFixed( mean, 1 );
      } )
    } ), {
      font: PDLConstants.SELECTOR_FONT,
      maxWidth: MAX_TEXT_WIDTH
    } );
    const meanIndicatorNode = new MeanIndicatorNode( 10, { maxWidth: 10 } );

    const meanContainer = new HBox( {
      spacing: 3,
      children: [ meanText, meanIndicatorNode ]
    } );

    const isUnfinishedSampleSelectedProperty = new DerivedProperty( [ selectedSampleNumberProperty, numberOfStartedSamplesProperty, numberOfCompletedSamplesProperty ],
      ( selectedSampleNumber, numberOfStartedSamples, numberOfCompletedSamples ) => {
        return selectedSampleNumber === numberOfStartedSamples && numberOfStartedSamples > numberOfCompletedSamples;
      } );

    const isUnstartedSampleSelectedProperty = new DerivedProperty( [ selectedSampleNumberProperty, numberOfStartedSamplesProperty ],
      ( selectedSampleNumber, numberOfStartedSamples ) => {
        return selectedSampleNumber > numberOfStartedSamples;
      } );

    const sampleMeanToggleNode = new ToggleNode<boolean, Node>( DerivedProperty.or( [ isUnfinishedSampleSelectedProperty, isUnstartedSampleSelectedProperty ] ), [
        {
          value: true,
          createNode: () => creatingText
        }, {
          value: false,
          createNode: () => meanContainer
        } ], {

        // Ensure that the visible content is centered independently of the other content in the ToggleNode
        unselectedChildrenSceneGraphStrategy: 'excluded'
      }
    );

    const sampleData: VBox = new VBox( {
      justify: 'center',
      spacing: 5,
      children: [ sampleNumberText, sampleMeanToggleNode ]
    } );

    const sampleDataToggleNode = new ToggleNode<boolean, Node>( isDataAvailableProperty, [
        {
          value: true,
          createNode: () => sampleData
        }, {
          value: false,
          createNode: () => new PDLText( ProjectileDataLabStrings.noDataStringProperty, { font: PDLConstants.SELECTOR_FONT, maxWidth: MAX_TEXT_WIDTH } )
        } ], {

        // Ensure that the visible content is centered independently of the other content in the ToggleNode
        unselectedChildrenSceneGraphStrategy: 'excluded'
      }
    );

    const sampleDataContainer = new VBox( {
      justify: 'center',
      children: [ sampleDataToggleNode ],
      preferredWidth: 120,
      preferredHeight: 45
    } );

    // Note the similarity between this implementation and the one in ProjectileSelectorNode
    const rangeProperty = new DerivedProperty(
      [ numberOfStartedSamplesProperty, selectedSampleNumberProperty, phaseProperty, isContinuousLaunchingProperty ],
      ( startedSampleCount, selectedSampleNumber, phase, isContinuousLaunching ) => {
        if ( startedSampleCount === 0 ) {
          return new Range( 1, 1 );
        }

        else if ( phase !== 'showingCompleteSampleWithMean' || isContinuousLaunching ) {

          // If some are airborne, then disable the buttons, freezing at the currently selected value
          return new Range( selectedSampleNumber, selectedSampleNumber );
        }
        else {

          // Everything is landed, everything can be selected
          return new Range( 1, startedSampleCount );
        }
      } );

    super( sampleDataContainer, selectedSampleNumberProperty, rangeProperty, options );
  }
}

projectileDataLab.register( 'SampleSelectorNode', SampleSelectorNode );