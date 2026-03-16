// Copyright 2024-2025, University of Colorado Boulder

/**
 * The VSMHistogramNode creates a histogram node for the VSM screens. It encapsulates the histogram sonification rules.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import Field from '../../common/model/Field.js';
import Histogram from '../../common/model/Histogram.js';
import HistogramNode, { HistogramNodeOptions } from '../../common/view/HistogramNode.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;

type VSMHistogramNodeOptions = SelfOptions & WithRequired<HistogramNodeOptions, 'tandem'>;

export default class VSMHistogramNode extends HistogramNode {

  public constructor( fieldProperty: TReadOnlyProperty<Field>,
                      fields: Field[],
                      totalProjectileCountProperty: TReadOnlyProperty<number>,
                      numberOfLandedProjectilesProperty: TReadOnlyProperty<number>,
                      horizontalAxisLabelText: TReadOnlyProperty<string>,
                      histogram: Histogram,
                      comboBoxParent: Node,
                      blockFillProperty: ColorProperty,
                      blockStrokeProperty: ColorProperty,
                      providedOptions: VSMHistogramNodeOptions ) {

    const histogramSoundEnabledProperty = new DerivedProperty( [ totalProjectileCountProperty, numberOfLandedProjectilesProperty ],
      ( totalProjectileCount, numberOfLandedProjectiles ) => {
        return numberOfLandedProjectiles > 0 && totalProjectileCount === numberOfLandedProjectiles;
      } );

    super(
      fieldProperty,
      fields,
      horizontalAxisLabelText,
      histogram,
      histogramSoundEnabledProperty, comboBoxParent, blockFillProperty, blockStrokeProperty, providedOptions );
  }
}

projectileDataLab.register( 'VSMHistogramNode', VSMHistogramNode );