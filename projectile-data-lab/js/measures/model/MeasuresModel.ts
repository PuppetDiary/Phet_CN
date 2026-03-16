// Copyright 2023-2025, University of Colorado Boulder

/**
 * The Measures Model for Projectile Data Lab.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import SMModel, { SMModelOptions } from '../../common-vsm/model/SMModel.js';
import { VSMFieldIdentifierValues } from '../../common-vsm/model/VSMFieldIdentifier.js';
import Launcher, { MYSTERY_LAUNCHERS } from '../../common/model/Launcher.js';
import { MeanTone } from '../../common/model/MeanTone.js';
import { MysteryOrCustom } from '../../common/model/MysteryOrCustom.js';
import PDLConstants from '../../common/PDLConstants.js';
import projectileDataLab from '../../projectileDataLab.js';
import IntervalTool from './IntervalTool.js';
import MeasuresField from './MeasuresField.js';

type SelfOptions = EmptySelfOptions;

type Parent = WithRequired<SMModelOptions, 'tandem'>;
type MeasuresModelOptions = SelfOptions & StrictOmit<Parent, 'isStandardDeviationAnglePropertyPhetioInstrumented'>;

export default class MeasuresModel extends SMModel<MeasuresField> {

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // These values are DynamicProperties that are determined by the MeasuresField, see MeasuresField.ts and implementation-notes.md

  // The mean distance of the landed projectiles
  public readonly meanDistanceProperty: TReadOnlyProperty<number | null>;

  // The standard deviation of the distance of the landed projectiles
  public readonly standardDeviationDistanceProperty: TReadOnlyProperty<number | null>;

  // The standard error of the mean distance of landed projectiles
  public readonly standardErrorDistanceProperty: TReadOnlyProperty<number | null>;

  // Whether the launcher is custom or mystery
  public readonly mysteryOrCustomProperty: PhetioProperty<MysteryOrCustom>;

  public readonly mysteryLauncherProperty: PhetioProperty<Launcher>;

  // End of DynamicProperties
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Whether the mean is visible on the field and histogram
  public readonly isMeanVisibleProperty: Property<boolean>;

  // Whether the standard deviation is visible on the field and histogram
  public readonly isStandardDeviationVisibleProperty: Property<boolean>;

  // Whether the values are visible on the field and histogram
  public readonly isValuesVisibleProperty: Property<boolean>;

  // Whether the interval tool is visible on the field and histogram
  public readonly isIntervalToolVisibleProperty: Property<boolean>;

  // The interval tool
  public readonly intervalTool: IntervalTool;

  public constructor( providedOptions: MeasuresModelOptions ) {

    const options = optionize<MeasuresModelOptions, SelfOptions, SMModelOptions>()( {
      isStandardDeviationAnglePropertyPhetioInstrumented: true
    }, providedOptions );

    const fieldsTandem = options.tandem.createTandem( 'fields' );
    const fields = VSMFieldIdentifierValues.map( identifier => {
      const fieldTandem = fieldsTandem.createTandem( identifier );

      const lastMysteryLauncherNumber = MYSTERY_LAUNCHERS[ MYSTERY_LAUNCHERS.length - 1 ].launcherNumber;

      const customLauncher = new Launcher(
        'custom',
        LauncherMechanism.SPRING,
        PDLConstants.ANGLE_STANDARD_DEVIATION_RANGE.getCenter(),
        lastMysteryLauncherNumber + 1, {
          tandem: fieldTandem.createTandem( 'customLauncher' ),
          phetioFeatured: true
        } );

      return new MeasuresField( [ ...MYSTERY_LAUNCHERS, customLauncher ], identifier, {
        tandem: fieldsTandem.createTandem( identifier ),
        phetioFeatured: true
      } );
    } );

    super( fields, options );

    this.mysteryOrCustomProperty = new DynamicProperty<MysteryOrCustom, MysteryOrCustom, MeasuresField>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.mysteryOrCustomProperty,
      tandem: options.tandem.createTandem( 'mysteryOrCustomProperty' ),
      phetioFeatured: true,
      phetioValueType: StringUnionIO( [ 'mystery', 'custom' ] )
    } );

    this.mysteryLauncherProperty = new DynamicProperty<Launcher, Launcher, MeasuresField>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.mysteryLauncherProperty,
      tandem: options.tandem.createTandem( 'mysteryLauncherProperty' ),
      phetioFeatured: true,
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    this.meanDistanceProperty = new DynamicProperty<number | null, number | null, MeasuresField>( this.fieldProperty, {
      derive: field => field.meanDistanceProperty,
      phetioFeatured: true,
      tandem: options.tandem.createTandem( 'meanDistanceProperty' ),
      phetioDocumentation: 'The mean distance of the landed projectiles, or null if no projectiles have landed.',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioState: false
    } );

    this.standardDeviationDistanceProperty = new DynamicProperty<number | null, number | null, MeasuresField>( this.fieldProperty, {
      derive: field => field.standardDeviationDistanceProperty,
      phetioFeatured: true,
      tandem: options.tandem.createTandem( 'standardDeviationDistanceProperty' ),
      phetioDocumentation: 'The standard deviation of the distance of the landed projectiles, or null if no projectiles have landed.',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioState: false
    } );

    this.standardErrorDistanceProperty = new DynamicProperty<number | null, number | null, MeasuresField>( this.fieldProperty, {
      derive: field => field.standardErrorDistanceProperty,
      phetioFeatured: true,
      tandem: options.tandem.createTandem( 'standardErrorDistanceProperty' ),
      phetioDocumentation: 'The standard error of the mean distance of landed projectiles, or null if no projectiles have landed.',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioState: false
    } );

    const visiblePropertiesTandem = options.tandem.createTandem( 'visibleProperties' );

    this.isIntervalToolVisibleProperty = new BooleanProperty( false, {
      tandem: visiblePropertiesTandem.createTandem( 'isIntervalToolVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isMeanVisibleProperty = new BooleanProperty( false, {
      tandem: visiblePropertiesTandem.createTandem( 'isMeanVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isStandardDeviationVisibleProperty = new BooleanProperty( false, {
      tandem: visiblePropertiesTandem.createTandem( 'isStandardDeviationVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isValuesVisibleProperty = new BooleanProperty( false, {
      tandem: visiblePropertiesTandem.createTandem( 'isValuesVisibleProperty' ),
      phetioFeatured: true
    } );

    this.intervalTool = new IntervalTool( {
      tandem: options.tandem.createTandem( 'intervalTool' )
    } );

    // Compute the percent of data within the interval tool, only considering the landedProjectiles.
    const updateIntervalToolDataPercentage = () => {
      const min = Math.min( this.intervalTool.edge1Property.value, this.intervalTool.edge2Property.value );
      const max = Math.max( this.intervalTool.edge1Property.value, this.intervalTool.edge2Property.value );
      const field = this.fieldProperty.value;
      const count = field.landedProjectiles.filter( projectile => {
        return projectile.x >= min && projectile.x <= max;
      } ).length;
      this.intervalTool.dataFractionProperty.value = field.landedProjectiles.length === 0 ? 0 : count / field.landedProjectiles.length;
    };

    updateIntervalToolDataPercentage();

    this.fields.forEach( field => {
      field.projectileLandedEmitter.addListener( updateIntervalToolDataPercentage );
      field.projectilesClearedEmitter.addListener( updateIntervalToolDataPercentage );
    } );
    this.fieldProperty.link( updateIntervalToolDataPercentage );
    this.intervalTool.edge1Property.link( updateIntervalToolDataPercentage );
    this.intervalTool.edge2Property.link( updateIntervalToolDataPercentage );
  }

  protected override shouldPlayMeanTone(): boolean {
    return this.isMeanVisibleProperty.value && this.meanDistanceProperty.value !== null;
  }

  protected override playMeanTone(): void {
    assert && assert( this.shouldPlayMeanTone(), 'shouldPlayMeanTone should be true before calling playMeanTone' );
    MeanTone.playMean( this.meanDistanceProperty.value!, 1 );
  }

  public override reset(): void {
    super.reset();

    this.isMeanVisibleProperty.reset();
    this.isStandardDeviationVisibleProperty.reset();
    this.isValuesVisibleProperty.reset();
    this.isIntervalToolVisibleProperty.reset();

    this.intervalTool.reset();
  }
}

projectileDataLab.register( 'MeasuresModel', MeasuresModel );