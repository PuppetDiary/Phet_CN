// Copyright 2016-2025, University of Colorado Boulder

/**
 * ShoppingItemData is a data structure that describe a type of item in the 'Shopping' screen.
 * These data structures are used to instantiate instances of ShoppingItem and its subclasses.
 * Using a data structure like this is an alternative to having a large number of constructor parameters.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Color from '../../../../scenery/js/util/Color.js';
import apple_png from '../../../images/apple_png.js';
import appleBag_png from '../../../images/appleBag_png.js';
import blueCandy_png from '../../../images/blueCandy_png.js';
import blueCandyBag_png from '../../../images/blueCandyBag_png.js';
import carrot_png from '../../../images/carrot_png.js';
import carrotBag_png from '../../../images/carrotBag_png.js';
import cucumber_png from '../../../images/cucumber_png.js';
import cucumberBag_png from '../../../images/cucumberBag_png.js';
import greenCandy_png from '../../../images/greenCandy_png.js';
import greenCandyBag_png from '../../../images/greenCandyBag_png.js';
import lemon_png from '../../../images/lemon_png.js';
import lemonBag_png from '../../../images/lemonBag_png.js';
import orange_png from '../../../images/orange_png.js';
import orangeBag_png from '../../../images/orangeBag_png.js';
import pear_png from '../../../images/pear_png.js';
import pearBag_png from '../../../images/pearBag_png.js';
import potato_png from '../../../images/potato_png.js';
import potatoBag_png from '../../../images/potatoBag_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import purpleCandyBag_png from '../../../images/purpleCandyBag_png.js';
import redCandy_png from '../../../images/redCandy_png.js';
import redCandyBag_png from '../../../images/redCandyBag_png.js';
import tomato_png from '../../../images/tomato_png.js';
import tomatoBag_png from '../../../images/tomatoBag_png.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';

// Description of a shopping item, all fields are required
export type ShoppingItemDataOptions = {

  unitRate: number; // cost per item, in $
  numberOfBags: number;  // number of bags of the item
  quantityPerBag: number;  // quantity in each bag
  singularNameStringProperty: TReadOnlyProperty<string>; // name to use for singular quantities (e.g. '1 Apple')
  pluralNameStringProperty: TReadOnlyProperty<string>; // name to use for plural quantities (e.g. '2 Apples')
  itemImage: HTMLImageElement; // image for individual items
  itemRowOverlap: number; // for tweaking how items overlap when stacked, specific to itemImage
  bagImage: HTMLImageElement; // image for a bag of items
  pickerColor: Color | string; // color of NumberPickers related to this item

  // Number of items (or pounds, for Candy) for each question, grouped into 'question sets'.
  // See 'Unit Rates & Challenge Prompts' table in design document.
  // ShoppingQuestionFactory takes these values and creates ShoppingQuestion instances.
  questionQuantities: number[][];
};

export default class ShoppingItemData {

  // See ShoppingItemDataOptions
  public readonly unitRate: number;
  public readonly numberOfBags: number;
  public readonly quantityPerBag: number;
  public readonly singularNameStringProperty: TReadOnlyProperty<string>;
  public readonly pluralNameStringProperty: TReadOnlyProperty<string>;
  public readonly itemImage: HTMLImageElement;
  public readonly itemRowOverlap: number;
  public readonly bagImage: HTMLImageElement;
  public readonly pickerColor: Color | string;
  public readonly questionQuantities: number[][];

  // Constructor is private because all instances are static members of this class.
  private constructor( options: ShoppingItemDataOptions ) {
    this.unitRate = options.unitRate;
    this.numberOfBags = options.numberOfBags;
    this.quantityPerBag = options.quantityPerBag;
    this.singularNameStringProperty = options.singularNameStringProperty;
    this.pluralNameStringProperty = options.pluralNameStringProperty;
    this.itemImage = options.itemImage;
    this.itemRowOverlap = options.itemRowOverlap;
    this.bagImage = options.bagImage;
    this.pickerColor = options.pickerColor;
    this.questionQuantities = options.questionQuantities;
  }

  public static readonly APPLES = new ShoppingItemData( {
    unitRate: 0.5,
    numberOfBags: 3,
    quantityPerBag: 5,
    singularNameStringProperty: UnitRatesStrings.appleStringProperty,
    pluralNameStringProperty: UnitRatesStrings.applesStringProperty,
    itemImage: apple_png,
    itemRowOverlap: 7,
    bagImage: appleBag_png,
    pickerColor: 'red',
    questionQuantities: [
      [ 10, 6, 8 ],
      [ 10, 14, 13 ],
      [ 15, 9, 7 ],
      [ 15, 4, 9 ]
    ]
  } );

  public static readonly LEMONS = new ShoppingItemData( {
    unitRate: 0.25,
    numberOfBags: 3,
    quantityPerBag: 5,
    singularNameStringProperty: UnitRatesStrings.lemonStringProperty,
    pluralNameStringProperty: UnitRatesStrings.lemonsStringProperty,
    itemImage: lemon_png,
    itemRowOverlap: 5,
    bagImage: lemonBag_png,
    pickerColor: 'yellow',

    // number of items
    questionQuantities: [
      [ 10, 4, 14 ],
      [ 10, 14, 7 ],
      [ 15, 6, 11 ],
      [ 15, 11, 9 ]
    ]
  } );

  public static readonly ORANGES = new ShoppingItemData( {
    unitRate: 0.75,
    numberOfBags: 3,
    quantityPerBag: 5,
    singularNameStringProperty: UnitRatesStrings.orangeStringProperty,
    pluralNameStringProperty: UnitRatesStrings.orangesStringProperty,
    itemImage: orange_png,
    itemRowOverlap: 5,
    bagImage: orangeBag_png,
    pickerColor: 'orange',

    // number of items
    questionQuantities: [
      [ 10, 4, 11 ],
      [ 10, 14, 8 ],
      [ 15, 9, 14 ],
      [ 15, 6, 12 ]
    ]
  } );

  public static readonly PEARS = new ShoppingItemData( {
    unitRate: 0.40,
    numberOfBags: 3,
    quantityPerBag: 5,
    singularNameStringProperty: UnitRatesStrings.pearStringProperty,
    pluralNameStringProperty: UnitRatesStrings.pearsStringProperty,
    itemImage: pear_png,
    itemRowOverlap: 5,
    bagImage: pearBag_png,
    pickerColor: 'green',

    // number of items
    questionQuantities: [
      [ 10, 6, 7 ],
      [ 10, 14, 12 ],
      [ 15, 4, 8 ],
      [ 15, 11, 13 ]
    ]
  } );

  public static readonly CARROTS = new ShoppingItemData( {
    unitRate: 0.15,
    numberOfBags: 4,
    quantityPerBag: 4,
    singularNameStringProperty: UnitRatesStrings.carrotStringProperty,
    pluralNameStringProperty: UnitRatesStrings.carrotsStringProperty,
    itemImage: carrot_png,
    itemRowOverlap: 0,
    bagImage: carrotBag_png,
    pickerColor: 'orange',

    // number of items
    questionQuantities: [
      [ 9, 19, 21 ],
      [ 15, 25, 23 ],
      [ 6, 21, 36 ],
      [ 14, 18, 28 ]
    ]
  } );

  public static readonly CUCUMBERS = new ShoppingItemData( {
    unitRate: 0.22,
    numberOfBags: 4,
    quantityPerBag: 3,
    singularNameStringProperty: UnitRatesStrings.cucumberStringProperty,
    pluralNameStringProperty: UnitRatesStrings.cucumbersStringProperty,
    itemImage: cucumber_png,
    itemRowOverlap: 0,
    bagImage: cucumberBag_png,
    pickerColor: 'green',

    // number of items
    questionQuantities: [
      [ 7, 19, 18 ],
      [ 11, 25, 23 ],
      [ 8, 17, 27 ],
      [ 13, 23, 22 ]
    ]
  } );

  public static readonly POTATOES = new ShoppingItemData( {
    unitRate: 0.45,
    numberOfBags: 4,
    quantityPerBag: 3,
    singularNameStringProperty: UnitRatesStrings.potatoStringProperty,
    pluralNameStringProperty: UnitRatesStrings.potatoesStringProperty,
    itemImage: potato_png,
    itemRowOverlap: 0,
    bagImage: potatoBag_png,
    pickerColor: 'brown',

    // number of items
    questionQuantities: [
      [ 7, 17, 21 ],
      [ 8, 19, 18 ],
      [ 11, 23, 25 ],
      [ 13, 25, 22 ]
    ]
  } );

  public static readonly TOMATOES = new ShoppingItemData( {
    unitRate: 0.3,
    numberOfBags: 4,
    quantityPerBag: 4,
    singularNameStringProperty: UnitRatesStrings.tomatoStringProperty,
    pluralNameStringProperty: UnitRatesStrings.tomatoesStringProperty,
    itemImage: tomato_png,
    itemRowOverlap: 0,
    bagImage: tomatoBag_png,
    pickerColor: 'red',

    // number of items
    questionQuantities: [
      [ 7, 23, 28 ],
      [ 13, 25, 23 ],
      [ 14, 35, 26 ],
      [ 6, 21, 19 ]
    ]
  } );

  public static readonly PURPLE_CANDY = new ShoppingItemData( {
    unitRate: 5.40,
    numberOfBags: 4,
    quantityPerBag: 0.4,
    singularNameStringProperty: UnitRatesStrings.purpleCandyStringProperty,
    pluralNameStringProperty: UnitRatesStrings.purpleCandyStringProperty,
    itemImage: purpleCandy_png,
    itemRowOverlap: 0,
    bagImage: purpleCandyBag_png,
    pickerColor: 'purple',

    // pounds
    questionQuantities: [
      [ 0.6, 2.2, 2.4 ],
      [ 1.5, 3.2, 3.1 ],
      [ 0.3, 2.4, 2.3 ],
      [ 1.3, 2.1, 2.5 ]
    ]
  } );

  public static readonly RED_CANDY = new ShoppingItemData( {
    unitRate: 3.80,
    numberOfBags: 4,
    quantityPerBag: 0.3,
    singularNameStringProperty: UnitRatesStrings.redCandyStringProperty,
    pluralNameStringProperty: UnitRatesStrings.redCandyStringProperty,
    itemImage: redCandy_png,
    itemRowOverlap: 0,
    bagImage: redCandyBag_png,
    pickerColor: 'red',

    // pounds
    questionQuantities: [
      [ 0.4, 2.3, 2 ],
      [ 0.7, 2.1, 2.4 ],
      [ 0.8, 1.7, 1.9 ],
      [ 1.3, 2.4, 2.8 ]
    ]
  } );

  public static readonly GREEN_CANDY = new ShoppingItemData( {
    unitRate: 8.20,
    numberOfBags: 4,
    quantityPerBag: 0.3,
    singularNameStringProperty: UnitRatesStrings.greenCandyStringProperty,
    pluralNameStringProperty: UnitRatesStrings.greenCandyStringProperty,
    itemImage: greenCandy_png,
    itemRowOverlap: 0,
    bagImage: greenCandyBag_png,
    pickerColor: 'green',

    // pounds
    questionQuantities: [
      [ 0.7, 1.9, 2.2 ],
      [ 1.3, 2.5, 2.4 ],
      [ 0.4, 1.8, 1.9 ],
      [ 1.5, 2.1, 1.8 ]
    ]
  } );

  public static readonly BLUE_CANDY = new ShoppingItemData( {
    unitRate: 1.30,
    numberOfBags: 4,
    quantityPerBag: 0.4,
    singularNameStringProperty: UnitRatesStrings.blueCandyStringProperty,
    pluralNameStringProperty: UnitRatesStrings.blueCandyStringProperty,
    itemImage: blueCandy_png,
    itemRowOverlap: 0,
    bagImage: blueCandyBag_png,
    pickerColor: 'blue',

    // pounds
    questionQuantities: [
      [ 0.3, 1.9, 3.2 ],
      [ 0.7, 2.2, 2.3 ],
      [ 1.3, 2.6, 2.4 ],
      [ 1.4, 2.8, 2.9 ]
    ]
  } );
}

unitRates.register( 'ShoppingItemData', ShoppingItemData );