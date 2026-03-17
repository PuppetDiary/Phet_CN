// Copyright 2023-2025, University of Colorado Boulder

/**
 * SolarSystemCommonModel is the base class for the top-level model, used by all screens in my-solar-system and
 * keplers-laws.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import TimeSpeed from '../../../scenery-phet/js/TimeSpeed.js';
import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import phetioStateSetEmitter from '../../../tandem/js/phetioStateSetEmitter.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import Body from './Body.js';
import BodyInfo from './BodyInfo.js';
import Engine from './Engine.js';
import SolarSystemCommonMeasuringTape from './SolarSystemCommonMeasuringTape.js';

// Type definitions
type SelfOptions = {
  zoomLevelRange: RangeWithValue;
  defaultBodyInfo: BodyInfo[];
  bodyColors: ProfileColorProperty[];
  engineTimeScale: number; // Scales down the normal dt (in seconds) to engine times
  modelToViewTime?: number; // Scales times from model to view (years)
  phetioFeaturedTimeProperty?: boolean;
};

export type SolarSystemCommonModelOptions = SelfOptions &
  PickRequired<PhetioObjectOptions, 'tandem'>;

// BodyInfo[] for unspecified bodies
const INACTIVE_BODIES_DEFAULT_STATE = [
  new BodyInfo( { isActive: true, mass: 0.1, position: new Vector2( 0, 3 ), velocity: new Vector2( -10, 0 ) } ),
  new BodyInfo( { isActive: true, mass: 0.1, position: new Vector2( 0, -3 ), velocity: new Vector2( 10, 0 ) } ),
  new BodyInfo( { isActive: true, mass: 0.1, position: new Vector2( 3, 0 ), velocity: new Vector2( 0, 10 ) } ),
  new BodyInfo( { isActive: true, mass: 0.1, position: new Vector2( -3, 0 ), velocity: new Vector2( 0, -10 ) } )
];


export default abstract class SolarSystemCommonModel {

  // Initial values that were used to instantiate Body instances
  protected readonly defaultBodyInfo: BodyInfo[];

  // The complete set of Body instances, active and inactive
  public readonly bodies: Body[];

  // Bodies will be set to these values when restart is called. Updated when the user changes a Body.
  // This needs to be stateful so that we return to the desired configuration when resetting the time control.
  private startingBodyInfoProperty: Property<BodyInfo[]>;

  // The engine that will run all the physical calculations, including body interactions and collisions.
  // Must be instantiated by the subclass.
  public abstract readonly engine: Engine;

  // Emitter that fires when the user interaction starts
  public readonly userInteractingEmitter = new Emitter();

  // Controls the velocity of time by scaling dt
  public readonly engineTimeScale: number;

  // Transform between model's and view's times
  public readonly modelToViewTime: number;

  // Maps a TimeSpeed to a multiplier for dt
  public readonly timeSpeedMap = new Map<TimeSpeed, number>( [
    [ TimeSpeed.FAST, 7 / 4 ],
    [ TimeSpeed.NORMAL, 1 ],
    [ TimeSpeed.SLOW, 1 / 4 ]
  ] );

  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly hasPlayedProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Numerical level of zoom selected. It's not directly the zoom applied, but an integer to be used in the calculation.
  public readonly zoomLevelProperty: NumberProperty;

  // How much to scale the model-view transform when zooming in and out
  public abstract zoomScaleProperty: TReadOnlyProperty<number>;

  // Power of 10 to which the gravity force is scaled
  public readonly gravityForceScalePowerProperty: NumberProperty;

  // Indicates whether any gravity force vector is currently off scale (too small to see).
  public readonly isAnyGravityForceOffscaleProperty: TReadOnlyProperty<boolean>;

  public readonly measuringTape: SolarSystemCommonMeasuringTape;

  public readonly interruptSubtreeEmitter = new Emitter();
  public readonly interruptBodiesSubtreeEmitter = new Emitter();

  protected constructor( providedOptions: SolarSystemCommonModelOptions ) {

    const options = optionize<SolarSystemCommonModelOptions, SelfOptions>()( {

      // SelfOptions
      modelToViewTime: 1000 * SolarSystemCommonConstants.TIME_MULTIPLIER,
      phetioFeaturedTimeProperty: true
    }, providedOptions );

    assert && assert( options.defaultBodyInfo.length === options.bodyColors.length, 'Body colors must be provided for each body' );

    this.defaultBodyInfo = options.defaultBodyInfo;

    // The complete set of Body elements, grouped under a parent tandem, in ascending order of index.
    const bodiesTandem = options.tandem.createTandem( 'bodies' );
    this.bodies = this.defaultBodyInfo.map( ( bodyInfo, index ) =>
      new Body( index + 1, bodyInfo, options.bodyColors[ index ],
        bodiesTandem.createTandem( bodyInfo.tandemName ? bodyInfo.tandemName : `body${index + 1}` ) )
    );

    this.startingBodyInfoProperty = new Property<BodyInfo[]>( [], {
      tandem: options.tandem.createTandem( 'startingBodyInfoProperty' ),
      phetioReadOnly: true,
      phetioValueType: ArrayIO( BodyInfo.BodyInfoIO ),
      phetioDocumentation: 'For internal use only'
    } );
    this.saveStartingBodyInfo();

    this.gravityForceScalePowerProperty = new NumberProperty( 0, {
      range: new Range( -2, 8 ),
      tandem: options.tandem.createTandem( 'gravityForceScalePowerProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Power of 10 to which the gravity force is scaled'
    } );

    // True if any gravity force vector would be too small to see when drawn.
    this.isAnyGravityForceOffscaleProperty = DerivedProperty.deriveAny(
      [ ...this.bodies.map( body => body.gravityForceProperty ), ...this.bodies.map( body => body.isActiveProperty ), this.gravityForceScalePowerProperty ],
      () => !!_.find( this.bodies, body => {
        const magnitudeLog = Math.log10( body.gravityForceProperty.value.magnitude );
        // 3.2 is the magnitude at which the vector starts being too small to see
        return body.isActiveProperty.value && ( magnitudeLog < 3.2 - this.gravityForceScalePowerProperty.value );
      } ) );

    // Time settings
    this.engineTimeScale = options.engineTimeScale;
    this.modelToViewTime = options.modelToViewTime;

    // Time Properties, grouped under a parent tandem
    const timeTandem = options.tandem.createTandem( 'time' );
    this.timeProperty = new NumberProperty( 0, {
      units: 'years',
      tandem: timeTandem.createTandem( 'timeProperty' ),
      phetioReadOnly: true,
      phetioFeatured: options.phetioFeaturedTimeProperty,
      phetioDocumentation: 'The model time, in years'
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      tandem: timeTandem.createTandem( 'timeSpeedProperty' ),
      phetioDocumentation: 'Controls how fast the simulation\'s internal clock runs',
      phetioFeatured: true
    } );

    this.isPlayingProperty = new BooleanProperty( false, {
      tandem: timeTandem.createTandem( 'isPlayingProperty' ),
      phetioDocumentation: 'True when the clock is running',
      phetioFeatured: true
    } );

    this.isPlayingProperty.link( isPlaying => {
      if ( isPlaying ) {
        this.interruptSubtreeEmitter.emit();
      }
    } );

    this.hasPlayedProperty = new BooleanProperty( false, {
      tandem: timeTandem.createTandem( 'hasPlayedProperty' ),
      phetioDocumentation: 'True when the clock has ran',
      phetioReadOnly: true
    } );

    this.timeProperty.link( time => {
      if ( time > 0 ) {
        this.hasPlayedProperty.value = true;
      }
    } );

    this.zoomLevelProperty = new NumberProperty( options.zoomLevelRange.defaultValue, {
      range: options.zoomLevelRange,
      numberType: 'Integer',
      tandem: options.tandem.createTandem( 'zoomLevelProperty' ),
      phetioDocumentation: 'Integer index that is used to compute how the view is scaled. Larger values are more zoomed in.',
      phetioFeatured: true
    } );

    this.measuringTape = new SolarSystemCommonMeasuringTape( {
      basePosition: new Vector2( 0, 1 ),
      tipPosition: new Vector2( 1, 1 ),
      tandem: options.tandem.createTandem( 'measuringTape' )
    } );

    // Saving starting body info when phetioState is finished being set
    phetioStateSetEmitter.addListener( () => {
        this.saveStartingBodyInfo();
    } );
  }

  public saveStartingBodyInfo(): void {
    this.startingBodyInfoProperty.value = this.bodies.map( body => body.getBodyInfo() );
  }

  /**
   * Sets Body instances to have the specified values.
   */
  public loadBodyInfo( bodiesInfo: BodyInfo[] ): void {
    for ( let i = 0; i < this.bodies.length; i++ ) {
      const bodyInfo = bodiesInfo[ i ];

      if ( bodyInfo ) {
        this.bodies[ i ].isActiveProperty.value = bodyInfo.isActive;

        // Setting initial values and then resetting the body to make sure the body is in the correct state
        this.bodies[ i ].massProperty.setInitialValue( bodyInfo.mass );
        this.bodies[ i ].positionProperty.setInitialValue( bodyInfo.position.copy() ); // copy because positionProperty value may be mutated directly
        this.bodies[ i ].velocityProperty.setInitialValue( bodyInfo.velocity.copy() ); // copy because velocityProperty value may be mutated directly
        this.bodies[ i ].reset();
      }
      else {
        const defaultBodyInfo = INACTIVE_BODIES_DEFAULT_STATE[ i ];
        this.bodies[ i ].isActiveProperty.value = false;
        this.bodies[ i ].massProperty.setInitialValue( defaultBodyInfo.mass );
        this.bodies[ i ].positionProperty.setInitialValue( defaultBodyInfo.position.copy() ); // copy because positionProperty value may be mutated directly
        this.bodies[ i ].velocityProperty.setInitialValue( defaultBodyInfo.velocity.copy() ); // copy because velocityProperty value may be mutated directly
      }
    }

    this.saveStartingBodyInfo();
  }

  public reset(): void {
    this.interruptSubtreeEmitter.emit();
    this.isPlayingProperty.value = false; // Pause the sim
    this.hasPlayedProperty.reset();
    this.timeSpeedProperty.reset();
    this.zoomLevelProperty.reset();
    this.gravityForceScalePowerProperty.reset();
    this.measuringTape.reset();

    this.startingBodyInfoProperty.value = this.defaultBodyInfo;
    this.restart();
  }

  // Restart is for when the time controls are brought back to 0
  // Bodies move to their last modified position
  public restart(): void {
    this.interruptSubtreeEmitter.emit();
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeProperty.reset(); // Reset the time
    this.hasPlayedProperty.value = false;
    this.loadBodyInfo( this.startingBodyInfoProperty.value ); // Reset the bodies
    this.update();
  }

  /**
   * Updating for when the bodies are changed
   */
  public abstract update(): void;

  // The child class should implement this method to advance time and update the bodies properties
  public abstract stepOnce( dt: number ): void;

  public step( dt: number ): void {
    this.update();

    if ( this.isPlayingProperty.value ) {
      this.stepOnce( dt );
    }
  }
}

solarSystemCommon.register( 'SolarSystemCommonModel', SolarSystemCommonModel );