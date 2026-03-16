// Copyright 2023-2024, University of Colorado Boulder

/**
 * IntervalTool is a tool that allows the user to select an interval in the data set. The IntervalTool treats its left and
 * right values atomically rather than independently to prevent things from going out of bounds or errors due to re-entrant
 * problems. Compare to center-and-variability/IntervalToolModel which uses the Property-based approach, which yielded
 * numerous problems and was difficult to maintain.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matt Blackman (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PDLConstants from '../../common/PDLConstants.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
type IntervalToolOptions = SelfOptions & WithRequired<PhetioObjectOptions, 'tandem'>;

export const DEFAULT_EDGE_1 = 40;
export const DEFAULT_EDGE_2 = 60;

export default class IntervalTool extends PhetioObject {

  // The fraction of data within the interval tool
  public readonly dataFractionProperty: Property<number>;

  // The x-position of the edges of the interval tool. These are maintained internally for atomicity, but we allow
  // them to be set via the Property interface.
  public readonly edge1Property: Property<number>;
  public readonly edge2Property: Property<number>;

  public constructor( providedOptions: IntervalToolOptions ) {

    const options = optionize<IntervalToolOptions, SelfOptions, PhetioObjectOptions>()( {
      phetioDocumentation: 'The interval tool indicates the percent of data within a selected horizontal range.',
      phetioFeatured: true,
      phetioState: false
    }, providedOptions );

    super( options );

    this.edge1Property = new NumberProperty( DEFAULT_EDGE_1, {
      range: new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ),
      tandem: providedOptions.tandem.createTandem( 'edge1Property' ),
      phetioFeatured: true,
      units: 'm',
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    } );

    this.edge2Property = new NumberProperty( DEFAULT_EDGE_2, {
      range: new Range( 0, PDLConstants.MAX_FIELD_DISTANCE ),
      tandem: providedOptions.tandem.createTandem( 'edge2Property' ),
      phetioFeatured: true,
      units: 'm',
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    } );

    this.dataFractionProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'dataFractionProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'The fraction of data within the interval tool',
      phetioReadOnly: true
    } );
  }

  public reset(): void {
    this.edge1Property.reset();
    this.edge2Property.reset();
  }
}

projectileDataLab.register( 'IntervalTool', IntervalTool );