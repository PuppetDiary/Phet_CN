// Copyright 2023-2024, University of Colorado Boulder

/**
 * SolarSystemCommonVisibleProperties is the parent abstract class that has common visible properties,
 * and is extended by MySolarSystemVisibleProperties and KeplersLawsVisibleProperties.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import solarSystemCommon from '../solarSystemCommon.js';

export default class SolarSystemCommonVisibleProperties {

  // Indicates if the speed values are visible.
  public readonly speedVisibleProperty: BooleanProperty;

  // Indicates if the velocity arrows are visible.
  public readonly velocityVisibleProperty: BooleanProperty;

  // Indicates if the gravity arrows are visible.
  public readonly gravityVisibleProperty: BooleanProperty;

  // Indicates if the path is visible. Lives in the model because it's also linked to model properties.
  public readonly pathVisibleProperty: BooleanProperty;

  // Indicates if the grid is visible.
  public readonly gridVisibleProperty: BooleanProperty;

  // Indicates if the measuring tape is visible.
  public readonly measuringTapeVisibleProperty: BooleanProperty;


  public constructor( tandem: Tandem ) {

    // Properties that control visibility of things in the UI, controlled by checkboxes, grouped under a parent tandem

    this.speedVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'speedVisibleProperty' ),
      phetioFeatured: true
    } );
    this.velocityVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'velocityVisibleProperty' ),
      phetioFeatured: true
    } );
    this.gravityVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gravityVisibleProperty' ),
      phetioFeatured: true
    } );
    this.pathVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'pathVisibleProperty' ),
      phetioFeatured: true
    } );
    this.gridVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gridVisibleProperty' ),
      phetioFeatured: true
    } );
    this.measuringTapeVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'measuringTapeVisibleProperty' ),
      phetioFeatured: true
    } );

  }

  public reset(): void {
    this.speedVisibleProperty.reset();
    this.velocityVisibleProperty.reset();
    this.gravityVisibleProperty.reset();
    this.pathVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.measuringTapeVisibleProperty.reset();
  }
}

solarSystemCommon.register( 'SolarSystemCommonVisibleProperties', SolarSystemCommonVisibleProperties );