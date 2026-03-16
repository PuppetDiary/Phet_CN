// Copyright 2024-2025, University of Colorado Boulder

/**
 * The Histogram class is used to represent the histogram in the Projectile Data Lab.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import packageJSON from '../../../../joist/js/packageJSON.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import projectileDataLab from '../../projectileDataLab.js';
import PDLConstants from '../PDLConstants.js';
import PDLPreferences from '../PDLPreferences.js';
import { HistogramRepresentation, HistogramRepresentationValues } from './HistogramRepresentation.js';
import HistogramSonifier from './HistogramSonifier.js';

// ZoomLevel describes the characteristics of how the HistogramNode and the SampleSizeThumbnailNode look at a given zoom
// level.
type ZoomLevel = {

  // The height of the histogram, i.e., the number of blocks that can be displayed in one column
  maxCount: number;

  // The minor spacing between the grid lines, or null if there are no minor grid lines
  minorSpacing: number | null;

  // The number of grid lines to display in the thumbnail
  numberOfThumbnailGridLines: number;
};

// On the Projectile Sampling Distributions sim, the zoom levels are different from the Projectile Data Lab sim.
export const ZOOM_LEVELS: ZoomLevel[] = packageJSON.name === 'projectile-sampling-distributions' ?
  [ {
    maxCount: 250,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 17
  }, {
    maxCount: 200,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 15
  }, {
    maxCount: 150,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 13
  }, {
    maxCount: 100,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 11
  }, {
    maxCount: 75,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 9
  }, {
    maxCount: 50,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 7
  }, {
    maxCount: 25,
    minorSpacing: null,
    numberOfThumbnailGridLines: 5
  } ] : [ {
    maxCount: 500,
    minorSpacing: 10,
    numberOfThumbnailGridLines: 15
  }, {
    maxCount: 200,
    minorSpacing: 8,
    numberOfThumbnailGridLines: 13
  }, {
    maxCount: 100,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 11
  }, {
    maxCount: 75,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 9
  }, {
    maxCount: 50,
    minorSpacing: 5,
    numberOfThumbnailGridLines: 7
  }, {
    maxCount: 25,
    minorSpacing: null,
    numberOfThumbnailGridLines: 5
  } ];

type SelfOptions = EmptySelfOptions;
type HistogramOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class Histogram {

  // Bin width represents the distance between adjacent field lines. It also affects how data is grouped for the histogram.
  // The prefix 'selected' means it is the value selected by the user, and may differ from the displayed bin width
  // depending on the BIN_STRATEGY_PROPERTY.
  public readonly selectedBinWidthProperty: Property<number>;

  // Total bins represents the number of bins in the histogram.
  // The prefix 'selected' means it is the value selected by the user, and may differ from the displayed bin width
  // depending on the BIN_STRATEGY_PROPERTY.
  public readonly selectedTotalBinsProperty: Property<number>;

  // The zoom level of the histogram
  public readonly zoomProperty: NumberProperty;

  // Current bin width, selecting from the two strategies: binWidth or totalBins (see above)
  public readonly binWidthProperty: TReadOnlyProperty<number>;

  // This Property indicates whether the histogram is showing bars (one per bin) or blocks (one per projectile).
  public readonly representationProperty: Property<HistogramRepresentation>;

  public readonly histogramSonifier: HistogramSonifier;

  public constructor(
    shouldPlayMeanTone: () => boolean, // See the method declaration in PDLModel.ts
    playMeanTone: () => void,  // See the method declaration in PDLModel.ts
    providedOptions: HistogramOptions ) {

    this.selectedBinWidthProperty = new NumberProperty( packageJSON.name === 'projectile-sampling-distributions' ? 0.5 : 1, {
      validValues: [ 0.5, 1, 2, 5,

        ...( packageJSON.name === 'projectile-data-lab' ? [ 10 ] : [] )
      ],
      tandem: providedOptions.tandem.createTandem( 'selectedBinWidthProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property configures the bin width of the field and histogram. It is used when the bin strategy is "bin width".',
      units: 'm'
    } );

    this.selectedTotalBinsProperty = new NumberProperty( 10, {
      validValues: [ 10, 20, 50, 100, 200 ],
      tandem: packageJSON.name === 'projectile-data-lab' ? providedOptions.tandem.createTandem( 'selectedTotalBinsProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'This Property configures the total number of bins in the histogram. It is used when the bin strategy is "total bins".'
    } );

    const maxZoomLevel = ZOOM_LEVELS.length - 1;

    this.zoomProperty = new NumberProperty( maxZoomLevel, {
      range: new Range( 0, maxZoomLevel ),
      tandem: providedOptions.tandem.createTandem( 'zoomProperty' ),
      phetioFeatured: true,
      numberType: 'Integer'
    } );

    this.binWidthProperty = new DerivedProperty( [ PDLPreferences.binStrategyProperty, this.selectedBinWidthProperty, this.selectedTotalBinsProperty ],
      ( binStrategy, selectedBinWidth, totalBins ) => {
        return binStrategy === 'binWidth' ? selectedBinWidth : PDLConstants.MAX_FIELD_DISTANCE / totalBins;
      } );

    this.representationProperty = new StringUnionProperty<HistogramRepresentation>( 'blocks', {
      validValues: HistogramRepresentationValues,
      tandem: providedOptions.tandem.createTandem( 'representationProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates whether the histogram is showing bars (one per bin) or blocks (one per projectile).'
    } );

    this.histogramSonifier = new HistogramSonifier( shouldPlayMeanTone, playMeanTone, this.binWidthProperty );
  }

  public step( dt: number ): void {
    this.histogramSonifier.step( dt );
  }

  public reset(): void {
    this.zoomProperty.reset();
    this.representationProperty.reset();
    this.selectedBinWidthProperty.reset();
    this.selectedTotalBinsProperty.reset();
  }
}

projectileDataLab.register( 'Histogram', Histogram );