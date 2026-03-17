// Copyright 2016-2024, University of Colorado Boulder

/**
 * Model for the 'Shopping' screen. Also used as the base class for the 'Shopping Lab' model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import TModel from '../../../../joist/js/TModel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import apple_png from '../../../images/apple_png.js';
import carrot_png from '../../../images/carrot_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import unitRates from '../../unitRates.js';
import CandyScene from './CandyScene.js';
import FruitScene from './FruitScene.js';
import ShoppingCategory from './ShoppingCategory.js';
import ShoppingItemData from './ShoppingItemData.js';
import VegetableScene from './VegetableScene.js';

type SelfOptions = {
  categoryIndex?: number; // index of the category that is initially selected
  categories?: ShoppingCategory[]; // categories, populated automatically if not provided
};

export type ShoppingModelOptions = SelfOptions;

export default class ShoppingModel implements TModel {

  public readonly categories: ShoppingCategory[];
  public readonly categoryProperty: Property<ShoppingCategory>; // the selected category

  public constructor( tandem: Tandem, providedOptions?: ShoppingModelOptions ) {

    const options = optionize<ShoppingModelOptions, StrictOmit<SelfOptions, 'categories'>>()( {

      // SelfOptions
      categoryIndex: 0
    }, providedOptions );

    // items are grouped into categories
    this.categories = options.categories || [

      // fruits
      new ShoppingCategory( apple_png, [
        new FruitScene( ShoppingItemData.APPLES ),
        new FruitScene( ShoppingItemData.LEMONS ),
        new FruitScene( ShoppingItemData.ORANGES ),
        new FruitScene( ShoppingItemData.PEARS )
      ] ),

      // vegetables
      new ShoppingCategory( carrot_png, [
        new VegetableScene( ShoppingItemData.CARROTS ),
        new VegetableScene( ShoppingItemData.CUCUMBERS ),
        new VegetableScene( ShoppingItemData.POTATOES ),
        new VegetableScene( ShoppingItemData.TOMATOES )
      ] ),

      // candies
      new ShoppingCategory( purpleCandy_png, [
        new CandyScene( ShoppingItemData.PURPLE_CANDY ),
        new CandyScene( ShoppingItemData.RED_CANDY ),
        new CandyScene( ShoppingItemData.GREEN_CANDY ),
        new CandyScene( ShoppingItemData.BLUE_CANDY )
      ] )
    ];

    // validate options
    assert && assert( options.categoryIndex >= 0 && options.categoryIndex < this.categories.length,
      `invalid categoryIndex: ${options.categoryIndex}` );

    this.categoryProperty = new Property( this.categories[ options.categoryIndex ], {
      validValues: this.categories
    } );
  }

  public reset(): void {
    this.categoryProperty.reset();
    this.categories.forEach( category => category.reset() );
  }

  /**
   * Updates time-dependent parts of the model.
   * @param dt - time since the previous step, in seconds
   */
  public step( dt: number ): void {

    // Cap dt, see https://github.com/phetsims/unit-rates/issues/193
    dt = Math.min( dt, 0.1 );

    // step the selected category
    for ( let i = 0; i < this.categories.length; i++ ) {
      if ( this.categories[ i ] === this.categoryProperty.value ) {
        this.categories[ i ].step( dt );
        break;
      }
    }
  }
}

unitRates.register( 'ShoppingModel', ShoppingModel );