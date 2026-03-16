// Copyright 2019-2025, University of Colorado Boulder

/**
 * Model class for the 'Compare' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Disposable from '../../../../axon/js/Disposable.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import LocalizedStringProperty from '../../../../chipper/js/browser/LocalizedStringProperty.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import Range from '../../../../dot/js/Range.js';
import TModel from '../../../../joist/js/TModel.js';
import CountingArea from '../../../../number-suite-common/js/common/model/CountingArea.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberComparePreferences from '../../common/model/numberComparePreferences.js';
import numberCompare from '../../numberCompare.js';
import NumberCompareStrings from '../../NumberCompareStrings.js';
import CompareCountingType from './CompareCountingType.js';

class CompareModel implements TModel {

  public readonly sumRange: Range;
  public readonly countingTypeProperty: EnumerationProperty<CompareCountingType>;
  public readonly comparisonSignsAndTextVisibleProperty: Property<boolean>;
  public readonly leftCountingArea: CountingArea;
  public readonly rightCountingArea: CountingArea;
  public readonly leftCountingObjectTypeProperty: EnumerationProperty<CountingObjectType>;
  public readonly rightCountingObjectTypeProperty: EnumerationProperty<CountingObjectType>;
  public readonly comparisonStringProperty: TReadOnlyProperty<string>;

  public constructor( highestCount: number, speechDataProperty: TProperty<string | null>, tandem: Tandem ) {

    this.sumRange = new Range( 0, highestCount );

    this.leftCountingObjectTypeProperty = new EnumerationProperty( CountingObjectType.DOG );
    this.rightCountingObjectTypeProperty = new EnumerationProperty( CountingObjectType.DOG );

    this.countingTypeProperty = new EnumerationProperty( CompareCountingType.BLOCKS );
    this.comparisonSignsAndTextVisibleProperty = new BooleanProperty( true );

    // create the left and right countingAreas
    this.leftCountingArea = new CountingArea( highestCount, new BooleanProperty( true ) );
    this.rightCountingArea = new CountingArea( highestCount, new BooleanProperty( true ) );

    // number => string Property, potentially using the second locale
    const getNumberWordProperty = ( numberProperty: TReadOnlyProperty<number> ): TReadOnlyProperty<string> => {
      return new DynamicProperty( new DerivedProperty( [
        numberProperty,
        numberComparePreferences.isPrimaryLocaleProperty,
        numberComparePreferences.secondLocaleProperty
      ], ( currentNumber, isPrimaryLocale, secondLocale ) => {
        return NumberSuiteCommonConstants.numberToWordProperty( secondLocale, currentNumber, isPrimaryLocale );
      } ) );
    };

    const leftNumberWordProperty = getNumberWordProperty( this.leftCountingArea.sumProperty );
    const rightNumberWordProperty = getNumberWordProperty( this.rightCountingArea.sumProperty );

    // Given a translated string Property, returns an equivalent string Property that may be switched to the second
    // locale when isPrimaryLocaleProperty's value is false.
    const getPrimaryOrSecondaryStringProperty = ( stringProperty: LocalizedStringProperty ): TReadOnlyProperty<string> => {
      return new DynamicProperty( new DerivedProperty( [
        numberComparePreferences.isPrimaryLocaleProperty,
        numberComparePreferences.secondLocaleProperty
      ], ( isPrimaryLocale, secondLocale ) => {
        return isPrimaryLocale ? stringProperty : stringProperty.getTranslatedStringProperty( secondLocale );
      } ) );
    };

    // To avoid creating/disposing things, we'll create all three conditions and then use the one we need below.
    const isLessThanStringProperty = new PatternStringProperty( getPrimaryOrSecondaryStringProperty( NumberCompareStrings.isLessThanStringProperty ), {
      smallerNumber: leftNumberWordProperty,
      greaterNumber: rightNumberWordProperty
    } );
    const isGreaterThanStringProperty = new PatternStringProperty( getPrimaryOrSecondaryStringProperty( NumberCompareStrings.isGreaterThanStringProperty ), {
      greaterNumber: leftNumberWordProperty,
      smallerNumber: rightNumberWordProperty
    } );
    const isEqualToStringProperty = new PatternStringProperty( getPrimaryOrSecondaryStringProperty( NumberCompareStrings.isEqualToStringProperty ), {
      equalNumberLeft: leftNumberWordProperty,
      equalNumberRight: rightNumberWordProperty
    } );

    // Swap in the correct comparison based on the numbers
    this.comparisonStringProperty = new DynamicProperty( new DerivedProperty( [
      this.leftCountingArea.sumProperty,
      this.rightCountingArea.sumProperty
    ], ( leftCurrentNumber, rightCurrentNumber ) => {
      if ( leftCurrentNumber < rightCurrentNumber ) {
        return isLessThanStringProperty;
      }
      else if ( leftCurrentNumber > rightCurrentNumber ) {
        return isGreaterThanStringProperty;
      }
      else {
        return isEqualToStringProperty;
      }
    } ) );

    // Update the speechDataProperty when the comparisonString or comparisonSignsAndTextVisible changes. If the
    // comparison sign and text is not visible, set the speech to null.
    Multilink.multilink( [ this.comparisonStringProperty, this.comparisonSignsAndTextVisibleProperty ],
      ( comparisonString, comparisonSignsAndTextVisible ) => {
        speechDataProperty.value = comparisonSignsAndTextVisible ? comparisonString : null;
      } );
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    numberComparePreferences.isPrimaryLocaleProperty.reset();
    this.leftCountingArea.reset();
    this.rightCountingArea.reset();
    this.rightCountingObjectTypeProperty.reset();
    this.leftCountingObjectTypeProperty.reset();
    this.comparisonSignsAndTextVisibleProperty.reset();
    this.countingTypeProperty.reset();
  }

  public dispose(): void {
    Disposable.assertNotDisposable();
  }
}

numberCompare.register( 'CompareModel', CompareModel );
export default CompareModel;