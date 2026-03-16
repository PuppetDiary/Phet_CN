// Copyright 2023-2025, University of Colorado Boulder

/**
 * The SamplingModel is the model for the Projectile Data Lab's Sampling screen. All projectiles are tracked the
 * same as in the parent, to simplify phet-io statefulness, and it adds phases and utilities to launch multiple
 * projectiles to be part of a sample.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import Launcher, { MYSTERY_LAUNCHERS } from '../../common/model/Launcher.js';
import { MeanTone } from '../../common/model/MeanTone.js';
import PDLModel, { PDLModelOptions } from '../../common/model/PDLModel.js';
import { SingleOrContinuous, SingleOrContinuousValues } from '../../common/model/SingleOrContinuous.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLPreferences from '../../common/PDLPreferences.js';
import PDLQueryParameters from '../../common/PDLQueryParameters.js';
import projectileDataLab from '../../projectileDataLab.js';
import SamplingField from './SamplingField.js';
import { SamplingPhase } from './SamplingPhase.js';

type SelfOptions = EmptySelfOptions;

type SamplingModelOptions = SelfOptions & StrictOmit<PDLModelOptions<SamplingField>, 'timeSpeedValues' | 'fields' | 'isPathsVisible' | 'isFieldPropertyPhetioReadonly' | 'fieldPropertyPhetioDocumentation' | 'isPathVisibilityPhetioInstrumented' | 'isStandardDeviationAnglePropertyPhetioInstrumented'>;

export const SAMPLE_SIZES = [ 2, 5, 15, 40 ];

export default class SamplingModel extends PDLModel<SamplingField> {

  public readonly sampleSizeProperty: Property<number>;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // These values are DynamicProperties that are determined by the SamplingField, see SamplingField.ts and implementation-notes.md

  public readonly phaseProperty: TReadOnlyProperty<SamplingPhase>;
  public readonly numberOfStartedSamplesProperty: TReadOnlyProperty<number>;
  public readonly numberOfCompletedSamplesProperty: TReadOnlyProperty<number>;
  public readonly selectedSampleNumberProperty: PhetioProperty<number>;
  public readonly sampleMeanProperty: TReadOnlyProperty<number | null>;

  // End of DynamicProperties
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public readonly launcherProperty: Property<Launcher>;

  public constructor( providedOptions: SamplingModelOptions ) {

    // This is an adapter Property that converts between the SamplingModel's singleOrContinuousProperty which is available
    // after the super() call
    const samplingLaunchModeProperty = new Property<SingleOrContinuous>( 'single', {
      validValues: SingleOrContinuousValues
    } );

    const fields: SamplingField[] = [];
    const NUM_LAUNCHERS = 6;
    const fieldsTandem = providedOptions.tandem.createTandem( 'fields' );
    for ( let i = 0; i < NUM_LAUNCHERS; i++ ) {
      for ( let j = 0; j < SAMPLE_SIZES.length; j++ ) {
        fields.push( new SamplingField( MYSTERY_LAUNCHERS[ i ],
          SAMPLE_SIZES[ j ],
          samplingLaunchModeProperty, {
            tandem: fieldsTandem.createTandem( `launcher${i + 1}SampleSize${SAMPLE_SIZES[ j ]}Field` ),
            phetioFeatured: true
          } ) );
      }
    }

    const options = optionize<SamplingModelOptions, SelfOptions, PDLModelOptions<SamplingField>>()( {
      timeSpeedValues: [ TimeSpeed.NORMAL, TimeSpeed.FAST ],
      fields: fields,
      isPathsVisible: true,
      isPathVisibilityPhetioInstrumented: false,
      isFieldPropertyPhetioReadonly: true,
      fieldPropertyPhetioDocumentation: 'This Property represents the field that is currently selected. '
                                        + 'On the Sampling screen, each combination of launcher and sample size has its own field.',
      isStandardDeviationAnglePropertyPhetioInstrumented: false
    }, providedOptions );

    super( options );

    // In the SamplingModel, the launcher is an independent variable that (with the sample size) determines the Field
    this.launcherProperty = new Property<Launcher>( MYSTERY_LAUNCHERS[ 0 ], {
      tandem: options.tandem.createTandem( 'launcherProperty' ),
      phetioFeatured: true,
      phetioValueType: ReferenceIO( IOType.ObjectIO ),
      validValues: MYSTERY_LAUNCHERS
    } );

    this.singleOrContinuousProperty.link( launchMode => {
      samplingLaunchModeProperty.value = launchMode;
    } );

    this.sampleSizeProperty = new NumberProperty( 2, {
      validValues: SAMPLE_SIZES,
      tandem: options.tandem.createTandem( 'sampleSizeProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'This Property configures the number of projectiles in a sample.'
    } );

    // In the SamplingModel, the field acts like a derived Property based on the selected launcher and sample size
    Multilink.multilink( [ this.sampleSizeProperty, this.launcherProperty ], ( sampleSize, launcher ) => {
      const field = this.fields.find( field => field.sampleSize === sampleSize && field.launcherProperty.value === launcher )!;
      this.fieldProperty.value = field;
    } );

    this.numberOfStartedSamplesProperty = new DynamicProperty<number, number, SamplingField>( this.fieldProperty, {
      derive: field => field.numberOfStartedSamplesProperty
    } );

    this.numberOfCompletedSamplesProperty = new DynamicProperty<number, number, SamplingField>( this.fieldProperty, {
      derive: field => field.numberOfCompletedSamplesProperty,
      tandem: options.tandem.createTandem( 'numberOfCompletedSamplesProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'The number of samples that have been completed.',
      phetioValueType: NumberIO,
      phetioReadOnly: true,
      phetioState: false
    } );

    this.selectedSampleNumberProperty = new DynamicProperty<number, number, SamplingField>( this.fieldProperty, {

      // The up/down carousel card changes the selected sample, so this is bidirectional
      bidirectional: true,
      derive: field => field.selectedSampleNumberProperty,
      tandem: options.tandem.createTandem( 'selectedSampleNumberProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'The index of the currently selected sample.',
      phetioValueType: NumberIO,
      phetioReadOnly: true,
      phetioState: false
    } );

    this.phaseProperty = new DynamicProperty<SamplingPhase, SamplingPhase, SamplingField>( this.fieldProperty, {
      derive: field => field.phaseProperty
    } );

    this.sampleMeanProperty = new DynamicProperty<number | null, number | null, SamplingField>( this.fieldProperty, {
      derive: field => field.sampleMeanProperty
    } );

    // When the user selects "continuous", if there were projectiles in the air, place them on the ground and show the mean
    this.singleOrContinuousProperty.link( launchMode => {

      if ( launchMode === 'continuous' ) {
        const field = this.fieldProperty.value;
        if ( field.phaseProperty.value === 'showingAirborneProjectiles' || field.phaseProperty.value === 'showingCompleteSampleWithoutMean' ) {
          field.finishCurrentSample();

          field.phaseProperty.value = 'showingCompleteSampleWithMean';
          field.updateComputedProperties();
          field.projectilesChangedEmitter.emit();
        }
      }
    } );

    // When the field is changed, if the phase is showingAirborneProjectiles or showingCompleteSampleWithoutMean, change the mode from
    // continuous to single
    this.fieldProperty.link( field => {
      if ( field.phaseProperty.value === 'showingAirborneProjectiles' || field.phaseProperty.value === 'showingCompleteSampleWithoutMean' ) {
        this.singleOrContinuousProperty.value = 'single';
      }
    } );

    // When the field is changed, if the phase is showingAirborneProjectiles or showingCompleteSampleWithoutMean, change the mode from
    // continuous to single
    this.fieldProperty.lazyLink( () => {

      // redo all fields with the same mystery launcher, unless they already have data.
      this.fields.forEach( field => {
        if ( field.launcherProperty.value === this.launcherProperty.value && field.numberOfCompletedSamplesProperty.value === 0 ) {
          field.clearProjectiles();
        }
      } );
    } );
  }

  /**
   * When the launch button is pressed, the behavior depends on a variety of factors:
   * - If AUTO_GENERATE_DATA_PROPERTY is true, then the field is cleared and new samples are generated.
   * - If the singleOrContinuousProperty is 'single', then a single projectile is launched, beginning a new sample.
   * - If the singleOrContinuousProperty is 'continuous', then isContinuousLaunchingProperty is toggled
   *      If toggled to true, it starts creating samples.
   *
   * See also the superclass documentation.
   */
  public override launchButtonPressed(): void {

    const field = this.fieldProperty.value;
    const phaseProperty = field.phaseProperty;

    // Regenerate data if set for autogeneration
    if ( PDLPreferences.autoGenerateDataProperty.value ) {

      field.clearProjectiles();
      field.phaseProperty.value = 'showingCompleteSampleWithMean';

      for ( let i = 1; i <= PDLQueryParameters.maxSamples; i++ ) {
        field.selectedSampleNumberProperty.value = i;
        field.finishCurrentSample();
      }

      field.updateComputedProperties();
      field.projectilesChangedEmitter.emit();
    }
    else {

      assert && assert( this.numberOfStartedSamplesProperty.value < PDLQueryParameters.maxSamples, 'Cannot launch when all samples have already been launched' );
      assert && assert( phaseProperty.value === 'idle' || phaseProperty.value === 'showingCompleteSampleWithMean',
        `The launch button should only be enabled in phase: idle | showingCompleteSampleWithMean
Current phase: ${phaseProperty.value}
Number of started samples: ${this.numberOfStartedSamplesProperty.value}  
Number of completed samples: ${this.numberOfCompletedSamplesProperty.value}
model.phase = ${this.phaseProperty.value}` );

      if ( this.singleOrContinuousProperty.value === 'single' ) {

        // If the simulation is paused, unpause it.
        this.isPlayingProperty.value = true;

        // Update the selected sample number before changing the phase, so that we have the correct phase on the current sample
        this.selectedSampleNumberProperty.value = field.numberOfCompletedSamplesProperty.value + 1;

        phaseProperty.value = 'showingAirborneProjectiles';
      }

      else if ( this.singleOrContinuousProperty.value === 'continuous' ) {

        // Toggle the isContinuousLaunchingProperty
        field.isContinuousLaunchingProperty.value = !field.isContinuousLaunchingProperty.value;

        if ( phaseProperty.value === 'idle' ) {
          assert && assert( this.selectedSampleNumberProperty.value === 1, 'selectedSampleNumberProperty should be 1 when in idle phase.' );

          if ( field.isContinuousLaunchingProperty.value ) {

            // If the simulation is paused, unpause it.
            this.isPlayingProperty.value = true;

            field.finishCurrentSample();
            phaseProperty.value = 'showingCompleteSampleWithMean';

            MeanTone.playMean( this.sampleMeanProperty.value! );
          }
        }
        else {
          if ( field.isContinuousLaunchingProperty.value ) {

            // When resuming continuous sampling, make sure that the most recent sample is shown
            this.selectedSampleNumberProperty.value = field.numberOfCompletedSamplesProperty.value;

            // If the simulation is paused, unpause it.
            this.isPlayingProperty.value = true;
          }

          phaseProperty.value = 'showingCompleteSampleWithMean';
        }
      }
    }
  }

  public override step( dt: number ): void {
    super.step( dt );

    if ( !this.isPlayingProperty.value ) {
      return;
    }

    dt = dt * ( this.timeSpeedProperty.value === TimeSpeed.FAST ? PDLConstants.TIME_SPEED_FAST : 1 );
    this.fieldProperty.value.step( dt, this.timeSpeedProperty.value );
  }

  /**
   * Resets the model.
   */
  public override reset(): void {
    super.reset();

    // After the parent type changes the field, it sets the sampleSizeProperty and launcher associated with that field.
    // Therefore, we must reset these last, so they will determine the field correctly.
    this.sampleSizeProperty.reset();
    this.launcherProperty.reset();
  }
}

projectileDataLab.register( 'SamplingModel', SamplingModel );