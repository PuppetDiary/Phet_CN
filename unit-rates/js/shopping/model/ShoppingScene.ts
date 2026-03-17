// Copyright 2016-2025, University of Colorado Boulder

/**
 * A scene in the 'Shopping' screen. A scene has:
 * - 1 type of item
 * - N sets of questions
 * - a double number line
 * - a scale
 * - a shelf
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Axis, { AxisOptions } from '../../common/model/Axis.js';
import DoubleNumberLine, { FixedAxis } from '../../common/model/DoubleNumberLine.js';
import Marker from '../../common/model/Marker.js';
import MarkerEditor from '../../common/model/MarkerEditor.js';
import Rate from '../../common/model/Rate.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import Bag from './Bag.js';
import CostOfQuestion from './CostOfQuestion.js';
import ItemsForQuestion from './ItemsForQuestion.js';
import Scale from './Scale.js';
import Shelf from './Shelf.js';
import ShoppingItem from './ShoppingItem.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingQuestion from './ShoppingQuestion.js';
import UnitRateQuestion from './UnitRateQuestion.js';

const noScaleUnitsStringProperty = new StringProperty( '' );

type SelfOptions = {
  rate?: Rate | null; // if null, will be initialized to unit rate
  fixedAxis?: FixedAxis;
  fixedAxisRange?: Range;
  numeratorAxisOptions?: AxisOptions; // options specific to the rate's numerator
  denominatorAxisOptions?: AxisOptions; // options specific to the rate's denominator
  isMajorMarker?: ( numerator: number, denominator: number ) => boolean;

  // questions
  quantitySingularUnitsStringProperty?: TReadOnlyProperty<string>; // units for questions with singular quantities
  quantityPluralUnitsStringProperty?: TReadOnlyProperty<string>;  // units for questions with plural quantities
  amountOfQuestionUnitsStringProperty?: TReadOnlyProperty<string>;  // units used for "Apples for $10.00?" type questions

  // scale
  scaleQuantityIsDisplayed?: boolean; // whether quantity is displayed on the scale
  scaleQuantityUnitsStringProperty?: TReadOnlyProperty<string>; // units for quantity on scale
  bagsOpen?: boolean; // do bags open to display individual items?
};

export type ShoppingSceneOptions = SelfOptions;

export default class ShoppingScene {

  public readonly itemData: ShoppingItemData;
  public readonly numeratorAxis: Axis;
  public readonly denominatorAxis: Axis;
  public readonly rate: Rate;
  public readonly scaleQuantityIsDisplayed: boolean;
  public readonly doubleNumberLine: DoubleNumberLine;
  public readonly markerEditor: MarkerEditor;
  public readonly shelf: Shelf;
  public readonly scale: Scale;
  public readonly bags: Bag[];

  // unpacked from ShoppingItemData
  public readonly numberOfBags: number;
  public readonly quantityPerBag: number;
  public readonly singularNameStringProperty: TReadOnlyProperty<string>;
  public readonly pluralNameStringProperty: TReadOnlyProperty<string>;
  public readonly itemImage: HTMLImageElement;
  public readonly bagImage: HTMLImageElement;

  public readonly unitRateQuestion: UnitRateQuestion; // 'Unit Rate?' type question
  public readonly questionSets: ShoppingQuestion[][];
  private readonly questionSetsIndexProperty: NumberProperty; // index of the question set that's being shown
  public readonly questionSetProperty: Property<ShoppingQuestion[]>; // the current set of questions

  private createMarkerEnabled: boolean; // flag to disable creation of spurious markers during reset

  protected constructor( itemData: ShoppingItemData, providedOptions?: ShoppingSceneOptions ) {

    // verify that itemData has all required properties
    assert && assert( itemData.questionQuantities.length > 1, 'more than 1 set of questions is required' );

    // default option values apply to Fruit items
    const options = optionize<ShoppingSceneOptions, StrictOmit<SelfOptions, 'numeratorAxisOptions' | 'denominatorAxisOptions'>>()( {

      // ShoppingSceneOptions
      rate: null, // will be initialized to unit rate
      fixedAxis: 'denominator', // range of the denominator (quantity) is fixed
      fixedAxisRange: new Range( 0, 16 ),
      isMajorMarker: ( numerator: number, denominator: number ) => Number.isInteger( denominator ),
      quantitySingularUnitsStringProperty: itemData.singularNameStringProperty,
      quantityPluralUnitsStringProperty: itemData.pluralNameStringProperty,
      amountOfQuestionUnitsStringProperty: itemData.pluralNameStringProperty,
      scaleQuantityIsDisplayed: false,
      scaleQuantityUnitsStringProperty: noScaleUnitsStringProperty,
      bagsOpen: false
    }, providedOptions );

    this.itemData = itemData;

    this.numeratorAxis = new Axis( combineOptions<AxisOptions>( {
      unitsStringProperty: UnitRatesStrings.dollarsStringProperty,
      valueFormatStringProperty: UnitRatesStrings.pattern_0costStringProperty
    }, options.numeratorAxisOptions ) );

    this.denominatorAxis = new Axis( combineOptions<AxisOptions>( {
      unitsStringProperty: itemData.pluralNameStringProperty,
      trimZeros: true
    }, options.denominatorAxisOptions ) );

    this.rate = options.rate || Rate.withUnitRate( itemData.unitRate );

    // unpack itemData: ShoppingItemData
    this.numberOfBags = itemData.numberOfBags;
    this.quantityPerBag = itemData.quantityPerBag;
    this.singularNameStringProperty = itemData.singularNameStringProperty;
    this.pluralNameStringProperty = itemData.pluralNameStringProperty;
    this.itemImage = itemData.itemImage;
    this.bagImage = itemData.bagImage;

    this.scaleQuantityIsDisplayed = options.scaleQuantityIsDisplayed;

    this.doubleNumberLine = new DoubleNumberLine( this.rate.unitRateProperty, this.numeratorAxis, this.denominatorAxis, {
      fixedAxis: options.fixedAxis,
      fixedAxisRange: options.fixedAxisRange,
      isMajorMarker: options.isMajorMarker
    } );

    this.markerEditor = new MarkerEditor( this.rate.unitRateProperty, this.numeratorAxis, this.denominatorAxis );

    // Does not work for mipmap, bagImage.width is undefined.
    // If considering a switch to mipmaps, see https://github.com/phetsims/unit-rates/issues/157
    assert && assert( this.bagImage.width && this.bagImage.height, 'Are you using the image plugin?' );
    const bagSize = new Dimension2(
      URConstants.BAG_IMAGE_SCALE * this.bagImage.width,
      URConstants.BAG_IMAGE_SCALE * this.bagImage.height );

    assert && assert( this.itemImage.width && this.itemImage.height, 'Are you using the image plugin?' );
    const itemSize = new Dimension2(
      URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.width,
      URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.height );

    this.shelf = new Shelf( {
      position: new Vector2( 512, 560 ),
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      bagRowYOffset: ( options.bagsOpen ? 0 : 10 ),
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize
    } );

    this.scale = new Scale( this.rate.unitRateProperty, {
      position: this.shelf.position.minusXY( 0, 220 ), // centered above the shelf
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize,
      quantityPerBag: this.quantityPerBag,
      quantityUnitsStringProperty: options.scaleQuantityUnitsStringProperty
    } );

    // The marker that corresponds to what's currently on the scale
    let scaleMarker: Marker | null = null;

    this.createMarkerEnabled = true;

    // Create a marker when what's on the scale changes
    this.scale.quantityProperty.lazyLink( quantity => {

      // the marker for what was previously on the scale becomes erasable
      if ( scaleMarker ) {
        scaleMarker.colorProperty.value = URColors.majorMarker;
        scaleMarker.erasable = true;
      }

      // the new marker for what's on the scale
      if ( quantity > 0 && this.createMarkerEnabled ) {
        scaleMarker = new Marker( 'scale', this.scale.costProperty.value, quantity, this.numeratorAxis, this.denominatorAxis, {
          isMajor: true, // all scale markers are major, per the design document
          color: URColors.scaleMarker,
          erasable: false
        } );
        this.doubleNumberLine.addMarker( scaleMarker );
      }
    } );

    this.unitRateQuestion = new UnitRateQuestion(
      this.rate.unitRateProperty.value,
      options.quantitySingularUnitsStringProperty,
      this.numeratorAxis,
      this.denominatorAxis
    );

    this.questionSets = ShoppingScene.createQuestionSets(
      itemData.questionQuantities,
      this.rate.unitRateProperty.value,
      options.quantitySingularUnitsStringProperty,
      options.quantityPluralUnitsStringProperty,
      options.amountOfQuestionUnitsStringProperty,
      this.numeratorAxis,
      this.denominatorAxis
    );

    // Randomize the order of the question sets
    if ( URQueryParameters.randomEnabled ) {
      this.questionSets = dotRandom.shuffle( this.questionSets );
    }

    this.questionSetsIndexProperty = new NumberProperty( 0, {
      numberType: 'Integer'
    } );

    this.questionSetProperty = new Property( this.questionSets[ this.questionSetsIndexProperty.value ] );

    this.questionSetsIndexProperty.lazyLink( questionSetsIndex => { // no unlink required
      this.questionSetProperty.value = this.questionSets[ questionSetsIndex ];
    } );

    // When the unit rate changes, cancel any marker edit that is in progress, unlink not needed
    this.rate.unitRateProperty.lazyLink( unitRate => {
      this.markerEditor.reset();
    } );

    // When a question is answered correctly, create a corresponding marker on the double number line.
    const questionCorrectListener = ( question: ShoppingQuestion ) => {
      const creator = ( question instanceof UnitRateQuestion ) ? 'unitRateQuestion' : 'question';
      const marker = new Marker( creator, question.numerator, question.denominator, this.numeratorAxis, this.denominatorAxis, {
        isMajor: true, // all question markers are major, per the design document
        color: URColors.questionMarker,
        erasable: false
      } );
      this.doubleNumberLine.addMarker( marker );
    };
    this.unitRateQuestion.correctEmitter.addListener( questionCorrectListener ); // no removeListener required
    this.questionSets.forEach( questionSet => {
      questionSet.forEach( question => {
        question.correctEmitter.addListener( questionCorrectListener ); // no removeListener required
      } );
    } );

    // Create bags and items
    this.bags = [];
    for ( let i = 0; i < this.numberOfBags; i++ ) {

      // the bag's position on the shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert( bagCellIndex !== -1, 'shelf is full' );
      const bagPosition = this.shelf.bagRow.getCellPosition( bagCellIndex );

      // create items if the bag opens when placed on the scale
      let items = null;
      if ( options.bagsOpen ) {

        items = [];
        for ( let j = 0; j < this.quantityPerBag; j++ ) {

          // create item, initially invisible and not on shelf or scale
          const item = new ShoppingItem( this.pluralNameStringProperty, this.itemImage, {
            visible: false
          } );
          items.push( item );
        }
      }

      // create bag
      const bag = new Bag( this.pluralNameStringProperty, this.bagImage, {
        position: bagPosition,
        items: items
      } );
      this.bags.push( bag );

      // put bag on shelf
      this.shelf.bagRow.put( bag, bagCellIndex );
    }
  }

  /**
   * Updates time-dependent parts of the model.
   * @param dt - time since the previous step, in seconds
   */
  public step( dt: number ): void {

    // animate bags
    for ( let i = 0; i < this.bags.length; i++ ) {
      this.bags[ i ].step( dt );

      // animate items
      const items = this.bags[ i ].items;
      if ( items ) {
        for ( let j = 0; j < items.length; j++ ) {
          items[ j ].step( dt );
        }
      }
    }
  }

  public reset(): void {

    this.rate.reset();

    // reset questions
    this.unitRateQuestion.reset();
    this.questionSets.forEach( questionSet => {
      questionSet.forEach( question => question.reset() );
    } );
    this.questionSetsIndexProperty.reset();

    this.resetShelfAndScale();

    // reset these last, since moving bags and items can create markers
    this.doubleNumberLine.reset();
    this.markerEditor.reset();
  }

  /**
   * Resets the shelf and scale.
   * All items are put back into bags, and all bags are returned to the shelf.
   */
  public resetShelfAndScale(): void {

    // clear all cells on the shelf
    this.shelf.reset();

    // clear all cells on the scale
    this.createMarkerEnabled = false; // prevent creation of spurious markers
    this.scale.reset();
    this.createMarkerEnabled = true;

    for ( let i = 0; i < this.bags.length; i++ ) {

      // return bag to shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert( bagCellIndex !== -1, 'shelf is full' );
      this.shelf.bagRow.put( this.bags[ i ], bagCellIndex );
      this.bags[ i ].visibleProperty.value = true;

      // reset items, making them invisible
      const items = this.bags[ i ].items;
      if ( items ) {
        for ( let j = 0; j < items.length; j++ ) {
          items[ j ].reset();
        }
      }
    }
  }

  /**
   * Creates question sets from raw data.
   *
   * @param questionQuantities - number of items for each question, see ShoppingItemData
   * @param unitRate
   * @param denominatorSingularUnitsStringProperty - denominator units to use for questions with singular quantities
   * @param denominatorPluralUnitsStringProperty - denominator units to use for questions with plural quantities
   * @param questionUnitsStringProperty - units used for "Apples for $10.00?" type questions
   * @param numeratorAxis
   * @param denominatorAxis
   */
  private static createQuestionSets( questionQuantities: number[][],
                                     unitRate: number,
                                     denominatorSingularUnitsStringProperty: TReadOnlyProperty<string>,
                                     denominatorPluralUnitsStringProperty: TReadOnlyProperty<string>,
                                     questionUnitsStringProperty: TReadOnlyProperty<string>,
                                     numeratorAxis: Axis,
                                     denominatorAxis: Axis ): ShoppingQuestion[][] {

    const questionSets: ShoppingQuestion[][] = [];

    questionQuantities.forEach( quantities => {

      const questions = [];

      // the first N-1 questions are of the form 'Cost of 3 Apples?'
      for ( let i = 0; i < quantities.length - 1; i++ ) {
        questions.push( new CostOfQuestion( quantities[ i ], unitRate, denominatorSingularUnitsStringProperty,
          denominatorPluralUnitsStringProperty, numeratorAxis, denominatorAxis ) );
      }

      // the last question is of the form 'Apples for $3.00?'
      questions.push( new ItemsForQuestion( quantities[ quantities.length - 1 ],
        unitRate, denominatorSingularUnitsStringProperty, denominatorPluralUnitsStringProperty,
        questionUnitsStringProperty, numeratorAxis, denominatorAxis ) );

      questionSets.push( questions );
    } );

    return questionSets;
  }


  /**
   * Gets the next set of questions.
   * While the order of the sets is random, we cycle through the sets in the same order each time.
   */
  public nextQuestionSet(): void {

    assert && assert( this.questionSets.length > 1, 'this implementation requires more than 1 question set' );

    // Clear markers related to previous questions from the number line. This does not clear the unit rate question.
    this.doubleNumberLine.markers.slice().forEach( marker => {
      if ( marker.creator === 'question' ) {
        this.doubleNumberLine.removeMarker( marker );
      }
    } );

    // Reset the previous questions so that they are all unsolved.
    this.questionSetProperty.value.forEach( question => question.reset() );

    // adjust the index to point to the next question set
    if ( this.questionSetsIndexProperty.value < this.questionSets.length - 1 ) {
      this.questionSetsIndexProperty.value = this.questionSetsIndexProperty.value + 1;
    }
    else {
      this.questionSetsIndexProperty.value = 0;
    }
  }
}

unitRates.register( 'ShoppingScene', ShoppingScene );