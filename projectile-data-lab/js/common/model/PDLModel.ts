// Copyright 2023-2025, University of Colorado Boulder

/**
 * The PDLModel is the base class for all models in Projectile Data Lab (PDL).
 * It contains model elements for the launcher, field, tools, histograms and overlays.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import TModel from '../../../../joist/js/TModel.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import projectileDataLab from '../../projectileDataLab.js';
import Field from './Field.js';
import Histogram from './Histogram.js';
import Launcher from './Launcher.js';
import { LauncherOrientation, LauncherOrientationValues } from './LauncherOrientation.js';
import ProjectileType from './ProjectileType.js';
import { SingleOrContinuous, SingleOrContinuousValues } from './SingleOrContinuous.js';

// See the documentation at the PDLModel class attributes for more information on these options.
type SelfOptions<T extends Field> = {
  timeSpeedValues: TimeSpeed[];
  fields: T[];
  isPathsVisible: boolean;

  // Additional options for PhET-iO instrumentation, since the VSM screens and the Sampling screen are instrumented differently.
  isPathVisibilityPhetioInstrumented: boolean;
  isFieldPropertyPhetioReadonly: boolean;
  fieldPropertyPhetioDocumentation: string;

  isStandardDeviationAnglePropertyPhetioInstrumented: boolean;
};
export type PDLModelOptions<T extends Field> = SelfOptions<T> & { tandem: Tandem };

export default abstract class PDLModel<T extends Field> implements TModel {

  // Whether the simulation is playing (animating via the step() function)
  public readonly isPlayingProperty: Property<boolean>;

  // The rate of animation when the simulation is playing
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // The allowed time speeds for this screen
  public readonly timeSpeedValues: TimeSpeed[];

  // The fields that are available for the user to select on this screen
  public readonly fields: T[];

  // The currently selected Field.
  public readonly fieldProperty: Property<T>;

  // The model for the Histogram
  public readonly histogram: Histogram;

  // single launch vs continuous launch (rapid fire) mode.
  public readonly singleOrContinuousProperty: Property<SingleOrContinuous>;

  // Setting for whether the user wants to see the paths of the projectiles
  public readonly isPathsVisibleProperty: Property<boolean>;

  // Abstract Property that indicates the selected Launcher
  protected readonly abstract launcherProperty: TReadOnlyProperty<Launcher>;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // These values are DynamicProperties that are determined by the Field, see Field.ts and implementation-notes.md
  public readonly launcherOrientationProperty: PhetioProperty<LauncherOrientation>;

  public readonly projectileTypeProperty: PhetioProperty<ProjectileType>;

  public readonly meanLaunchAngleProperty: TReadOnlyProperty<number>;
  public readonly meanLaunchSpeedProperty: TReadOnlyProperty<number>;
  public readonly standardDeviationSpeedProperty: TReadOnlyProperty<number>;
  public readonly standardDeviationAngleProperty: TReadOnlyProperty<number>;

  public readonly launcherHeightProperty: TReadOnlyProperty<number>;

  public readonly isContinuousLaunchingProperty: TProperty<boolean>;

  // End of DynamicProperties
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  protected constructor( providedOptions: PDLModelOptions<T> ) {

    const visiblePropertiesTandem = providedOptions.tandem.createTandem( 'visibleProperties' );

    const timeControlTandem = providedOptions.tandem.createTandem( 'timeControl' );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: timeControlTandem.createTandem( 'isPlayingProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates whether the simulation is playing. When false, the simulation is paused.'
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: providedOptions.timeSpeedValues,
      tandem: timeControlTandem.createTandem( 'timeSpeedProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates the rate of animation when the simulation is playing.'
    } );

    this.timeSpeedValues = providedOptions.timeSpeedValues;

    this.fields = providedOptions.fields;

    this.fieldProperty = new Property( this.fields[ 0 ], {
      validValues: this.fields,
      tandem: providedOptions.tandem.createTandem( 'fieldProperty' ),
      phetioFeatured: true,
      phetioDocumentation: providedOptions.fieldPropertyPhetioDocumentation,
      phetioValueType: ReferenceIO( Field.FieldIO ),
      phetioReadOnly: providedOptions.isFieldPropertyPhetioReadonly
    } );

    this.histogram = new Histogram( () => this.shouldPlayMeanTone(), () => this.playMeanTone(), { tandem: providedOptions.tandem.createTandem( 'histogram' ) } );

    this.singleOrContinuousProperty = new StringUnionProperty<SingleOrContinuous>( 'single', {
      validValues: SingleOrContinuousValues,
      tandem: providedOptions.tandem.createTandem( 'singleOrContinuousProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates whether the launcher is in single or continuous launch mode.'
    } );

    this.launcherOrientationProperty = new DynamicProperty<LauncherOrientation, LauncherOrientation, T>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.launcherOrientationProperty,

      // The DynamicProperty is instrumented if and only if the field launcherOrientationProperty is instrumented.
      tandem: this.fieldProperty.value.launcherOrientationProperty.isPhetioInstrumented() ? providedOptions.tandem.createTandem( 'launcherOrientationProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates the current launcher orientation.',
      phetioValueType: StringUnionIO( LauncherOrientationValues ),
      phetioReadOnly: true,
      phetioState: false,

      // Take whatever valid values were specified for the field launcherOrientationProperty. In the sampling screen,
      // it is constrained to angle45
      validValues: this.fieldProperty.value.launcherOrientationProperty.validValues
    } );

    this.projectileTypeProperty = new DynamicProperty<ProjectileType, ProjectileType, T>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.projectileTypeProperty,

      // The DynamicProperty is instrumented if and only if the field projectileTypeProperty is instrumented.
      tandem: this.fieldProperty.value.projectileTypeProperty.isPhetioInstrumented() ? providedOptions.tandem.createTandem( 'projectileTypeProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'This Property indicates the type of projectile being launched.',
      phetioValueType: ProjectileType.ProjectileTypeIO,
      phetioReadOnly: true,
      phetioState: false,

      // Take whatever valid values were specified for the field projectileTypeProperty. In the sampling screen,
      // it is constrained to a cannonball
      validValues: this.fieldProperty.value.projectileTypeProperty.validValues
    } );

    this.meanLaunchAngleProperty = new DynamicProperty<number, number, T>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.meanAngleProperty
    } );

    this.meanLaunchSpeedProperty = new DynamicProperty<number, number, T>( this.fieldProperty, {
      derive: field => field.meanSpeedProperty
    } );

    this.standardDeviationSpeedProperty = new DynamicProperty<number, number, T>( this.fieldProperty, {
      derive: field => field.standardDeviationSpeedProperty
    } );

    this.standardDeviationAngleProperty = new DynamicProperty<number, number, T>( this.fieldProperty, {
      derive: field => field.standardDeviationAngleProperty,
      tandem: providedOptions.isStandardDeviationAnglePropertyPhetioInstrumented ? providedOptions.tandem.createTandem( 'standardDeviationAngleProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'This Property represents the standard deviation of the angle of launch.',
      phetioValueType: NumberIO,
      phetioReadOnly: true,
      phetioState: false
    } );

    this.launcherHeightProperty = new DynamicProperty<number, number, T>( this.fieldProperty, {
      bidirectional: true,
      derive: field => field.launchHeightProperty
    } );

    this.isContinuousLaunchingProperty = new DynamicProperty<boolean, boolean, T>( this.fieldProperty, {
      bidirectional: true, // So that launching the last projectile can automatically pause continuous mode in the selected field.
      derive: field => field.isContinuousLaunchingProperty
    } );

    this.isPathsVisibleProperty = new BooleanProperty( providedOptions.isPathsVisible, {
      tandem: providedOptions.isPathVisibilityPhetioInstrumented ? visiblePropertiesTandem.createTandem( 'isPathsVisibleProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true
    } );

    this.singleOrContinuousProperty.link( singleOrContinuous => {
      if ( singleOrContinuous === 'single' ) {
        this.fieldProperty.value.isContinuousLaunchingProperty.value = false;
      }
    } );
  }

  /**
   * When the HistogramSonifier is playing a sound, this method is called to determine whether the mean tone should be played at the end.
   * This is played only on the Measures screen.
   */
  protected shouldPlayMeanTone(): boolean {
    return false;
  }

  /**
   * When the HistogramSonifier is playing a sound, this method is called to play the mean tone at the end. This is played only on the Measures screen.
   * This method is called only when shouldPlayMeanTone() returns true.
   */
  protected playMeanTone(): void {
    //nothing to do here, see documentation above
  }

  /**
   * This method is called when the launch button is pressed. The launch button has multi-modal behaviors where its behavior
   * differs depending on the current state of the simulation.
   */
  public abstract launchButtonPressed(): void;

  public step( dt: number ): void {
    this.histogram.step( dt );
  }

  public reset(): void {
    this.singleOrContinuousProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();

    this.fields.forEach( field => field.reset() );
    this.fieldProperty.reset();

    this.isPathsVisibleProperty.reset();
    this.histogram.reset();
  }

  public clearCurrentField(): void {
    this.fieldProperty.value.clearProjectiles();
  }
}
projectileDataLab.register( 'PDLModel', PDLModel );