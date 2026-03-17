// Copyright 2016-2023, University of Colorado Boulder

/**
 * A category in the 'Shopping' screen. A category is a group of related scenes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';
import ShoppingScene from './ShoppingScene.js';

export default class ShoppingCategory {

  public readonly image: HTMLImageElement; // image used to represent the category
  public readonly shoppingScenes: ShoppingScene[]; // scenes in the category
  public readonly shoppingSceneProperty: Property<ShoppingScene>; // the selected scene

  /**
   * @param image - image used to represent the category
   * @param shoppingScenes - scenes in the category
   */
  public constructor( image: HTMLImageElement, shoppingScenes: ShoppingScene[] ) {

    assert && assert( shoppingScenes.length > 0, 'at least 1 ShoppingScene is required' );

    this.image = image;
    this.shoppingScenes = shoppingScenes;

    // validate
    const shoppingSceneIndex = URQueryParameters.randomEnabled ? dotRandom.nextIntBetween( 0, shoppingScenes.length - 1 ) : 0;
    assert && assert( shoppingSceneIndex >= 0 && shoppingSceneIndex < shoppingScenes.length, `invalid shoppingSceneIndex: ${shoppingSceneIndex}` );
    this.shoppingSceneProperty = new Property( shoppingScenes[ shoppingSceneIndex ] );
  }

  public reset(): void {

    // Reset all scenes
    this.shoppingScenes.forEach( shoppingScene => shoppingScene.reset() );

    this.shoppingSceneProperty.reset();
  }

  /**
   * Updates time-dependent parts of the model.
   * @param dt - time since the previous step, in seconds
   */
  public step( dt: number ): void {

    // step the selected scene
    this.shoppingSceneProperty.value.step( dt );
  }
}

unitRates.register( 'ShoppingCategory', ShoppingCategory );