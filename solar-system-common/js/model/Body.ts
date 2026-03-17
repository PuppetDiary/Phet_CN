// Copyright 2023-2025, University of Colorado Boulder

/**
 * Model for a gravitational interacting Body
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty, { NumberPropertyOptions } from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property, { Vector2PropertyOptions } from '../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import Color from '../../../scenery/js/util/Color.js';
import isSettingPhetioStateProperty from '../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../tandem/js/types/ReferenceIO.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import BodyInfo from './BodyInfo.js';

export type BodyStateObject = ReferenceIOState; // because BodyIO is a subtype of ReferenceIO

export default class Body extends PhetioObject {

  // Index of the body, 1-based to correspond to the UI and PhET-iO.
  public readonly index: number;

  public readonly massProperty: NumberProperty;
  public readonly radiusProperty: TReadOnlyProperty<number>;
  public readonly positionProperty: Property<Vector2>;
  public readonly velocityProperty: Property<Vector2>;
  public readonly speedProperty: TReadOnlyProperty<number>;
  public readonly accelerationProperty: Property<Vector2>;
  public readonly gravityForceProperty: Property<Vector2>;

  // Collision handling
  public readonly collidedEmitter = new TinyEmitter();

  // Determines if the body is currently visible on screen and considered in calculations.
  public readonly isActiveProperty: Property<boolean>;

  // True when the body goes off-screen
  public readonly isOffscreenProperty: Property<boolean>;

  // True when the user is controlling the mass, position, or velocity of the Body
  public readonly userIsControllingMassProperty: Property<boolean>;
  public readonly userIsControllingPositionProperty: Property<boolean>;
  public readonly userIsControllingVelocityProperty: Property<boolean>;

  // The color used for the Body in icons, paths, UI components, etc.
  public readonly colorProperty: TReadOnlyProperty<Color>;

  // Array of points for drawing the path
  public readonly pathPoints: ObservableArray<Vector2>;

  // Total length of the body's drawn path. This is a Property because it needs to be stateful for PhET-iO.
  private readonly pathLengthProperty: NumberProperty;

  public constructor( index: number, bodyInfo: BodyInfo, colorProperty: ReadOnlyProperty<Color>, tandem: Tandem ) {
    assert && assert( Number.isInteger( index ) && index >= 1, `invalid index: ${index}` );

    super( {
      isDisposable: false,
      tandem: tandem,
      phetioType: Body.BodyIO,
      phetioState: false,
      phetioFeatured: true
    } );

    this.index = index;

    this.massProperty = new NumberProperty( bodyInfo.mass,
      combineOptions<NumberPropertyOptions>( {
        range: bodyInfo.massRange,
        isValidValue: mass => ( mass > 0 ),
        hasListenerOrderDependencies: true, // during reset listener order is key for calculating correct values.
        tandem: tandem.createTandem( 'massProperty' ),
        phetioDocumentation: 'This is the value of N, where mass is N x 10<sup>28</sup> kg.',
        phetioFeatured: true
      }, bodyInfo.massPropertyOptions ) );

    this.radiusProperty = new DerivedProperty( [ this.massProperty ], mass => Body.massToRadius( mass ) );

    // bodyInfo.position.copy() because velocityProperty's value may be mutated directly
    this.positionProperty = new Vector2Property( bodyInfo.position.copy(),
      combineOptions<Vector2PropertyOptions>( {
        units: 'AU',
        tandem: tandem.createTandem( 'positionProperty' ),
        phetioFeatured: true,
        reentrant: true
      }, bodyInfo.positionPropertyOptions ) );

    // bodyInfo.velocity.copy() because velocityProperty's value may be mutated directly
    this.velocityProperty = new Vector2Property( bodyInfo.velocity.copy(),
      combineOptions<Vector2PropertyOptions>( {
        units: 'km/s',

        // To prevent an infinite loop based on how the EllipticalOrbitEngine.update() sometimes constrains Body
        // Property values, see https://github.com/phetsims/keplers-laws/issues/264
        valueComparisonStrategy: 'equalsFunction',
        tandem: tandem.createTandem( 'velocityProperty' ),
        phetioFeatured: true,
        reentrant: true
      }, bodyInfo.velocityPropertyOptions ) );

    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], velocity => velocity.magnitude, {
      units: 'km/s',
      tandem: tandem.createTandem( 'speedProperty' ),
      phetioValueType: NumberIO,
      phetioFeatured: true,
      phetioDocumentation: 'The magnitude of velocity'
    } );

    this.accelerationProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'accelerationProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'This value is not in standard units and is for internal use only.'
    } );

    this.gravityForceProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'gravityForceProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'This value is not in standard units and is for internal use only.'
    } );

    this.isActiveProperty = new BooleanProperty( bodyInfo.isActive, {
      tandem: tandem.createTandem( 'isActiveProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'False if this body is not part of the selected orbital system, or if the body has collided and exploded.'
    } );

    this.isOffscreenProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isOffscreenProperty' ),
      phetioReadOnly: true
    } );

    this.userIsControllingMassProperty = new BooleanProperty( false );

    this.userIsControllingPositionProperty = new BooleanProperty( false );

    this.userIsControllingVelocityProperty = new BooleanProperty( false );

    this.colorProperty = colorProperty;
    this.addLinkedElement( colorProperty, {
      tandemName: 'colorProperty' // so that all Body elements have the same linked element name
    } );

    // Data for rendering the path
    this.pathPoints = createObservableArray( {
      tandem: tandem.createTandem( 'pathPoints' ),
      phetioReadOnly: true,
      phetioType: createObservableArray.ObservableArrayIO( Vector2.Vector2IO ),
      phetioDocumentation: 'The set of points used to draw the body\'s path'
    } );

    this.pathLengthProperty = new NumberProperty( 0, {
      units: 'AU',
      tandem: tandem.createTandem( 'pathLengthProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The length of the body\'s drawn path'
    } );
  }

  public reset(): void {
    this.massProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.gravityForceProperty.reset();
    this.isOffscreenProperty.reset();
    this.clearPath();
  }

  /**
   * Add a point to the collection of points that follow the trajectory of a moving body.
   * This also removes points when the path gets too long.
   */
  public addPathPoint(): void {
    const pathPoint = this.positionProperty.value.copy();

    if ( this.pathPoints.length === 0 ) {

      // First point in the path, so no distance to add, and no need to check if the path length has exceeded limit.
      this.pathPoints.push( pathPoint );
    }
    else {

      // The last point in the array that defines the path.
      const lastPoint = this.pathPoints[ this.pathPoints.length - 1 ];

      // Only add or remove points if the body is effectively moving.
      if ( !pathPoint.equals( lastPoint ) ) {
        this.pathPoints.push( pathPoint );

        // Add the length to the tracked path length
        this.pathLengthProperty.value += pathPoint.distance( lastPoint );

        // Remove points from the path when the path length exceeds the limit.
        while ( ( this.pathLengthProperty.value > SolarSystemCommonConstants.MAX_PATH_DISTANCE ) ||
                ( this.pathPoints.length > SolarSystemCommonConstants.MAX_PATH_POINTS ) ) {
          this.pathLengthProperty.value -= this.pathPoints[ 1 ].distance( this.pathPoints[ 0 ] );
          this.pathPoints.shift();
        }
      }
    }
  }

  /**
   * Gets the subset of BodyInfo that is needed by SolarSystemCommonModel loadBodyInfo.
   */
  public getBodyInfo(): BodyInfo {
    return new BodyInfo( {
      mass: this.massProperty.value,
      position: this.positionProperty.value.copy(), // copy because positionProperty value may be mutated directly
      velocity: this.velocityProperty.value.copy(), // copy because positionProperty value may be mutated directly
      isActive: this.isActiveProperty.value
    } );
  }

  public isOverlapping( otherBody: Body ): boolean {
    const distance = this.positionProperty.value.distance( otherBody.positionProperty.value );
    const radiusSum = this.radiusProperty.value + otherBody.radiusProperty.value;
    return distance < radiusSum;
  }

  public preventCollision( bodies: Body[] ): void {
    bodies.forEach( body => {
      if ( body !== this && this.isOverlapping( body ) ) {
        // If it's going to collide, arbitrarily move it 1 AU up
        this.positionProperty.value = this.positionProperty.value.plus( new Vector2( 0, 1 ) );
        this.preventCollision( bodies );
      }
    } );
  }

  /**
   * Clear the whole path of points tracking the body's trajectory.
   */
  public clearPath(): void {

    // This guard is a workaround for https://github.com/phetsims/my-solar-system/issues/294. When restoring state,
    // clearPath should not be called. This is not the greatest place to be putting this guard. But there are so many
    // places where body.clearPath or body.reset is called that this was the only viable option.
    if ( !isSettingPhetioStateProperty.value ) {
      this.pathPoints.clear();
      this.pathLengthProperty.reset();
    }
  }

  public static massToRadius( mass: number ): number {
    const minRadius = 0.03;
    return Math.max( minRadius, 0.023 * Math.pow( mass, 1 / 3 ) );
  }

  /**
   * BodyIO implements 'Reference type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * Reference type serialization is appropriate because all Body instances are created at startup, and exist
   * for the lifetime of the simulation.
   */
  public static readonly BodyIO = new IOType<Body, BodyStateObject>( 'BodyIO', {
    valueType: Body,
    supertype: ReferenceIO( IOType.ObjectIO )
  } );
}

solarSystemCommon.register( 'Body', Body );