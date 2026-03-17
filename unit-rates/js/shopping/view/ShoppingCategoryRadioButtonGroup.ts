// Copyright 2016-2025, University of Colorado Boulder

/**
 * Radio button group for selecting a category of items in the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import RectangularRadioButtonGroup, { RectangularRadioButtonGroupItem, RectangularRadioButtonGroupOptions } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import URColors from '../../common/URColors.js';
import unitRates from '../../unitRates.js';
import ShoppingCategory from '../model/ShoppingCategory.js';

type SelfOptions = EmptySelfOptions;

type ShoppingCategoryRadioButtonGroupOptions = SelfOptions & NodeTranslationOptions;

export default class ShoppingCategoryRadioButtonGroup extends RectangularRadioButtonGroup<ShoppingCategory> {

  public constructor( categories: ShoppingCategory[],
                      categoryProperty: Property<ShoppingCategory>,
                      providedOptions?: ShoppingCategoryRadioButtonGroupOptions ) {

    const options = optionize<ShoppingCategoryRadioButtonGroupOptions, SelfOptions, RectangularRadioButtonGroupOptions>()( {

      // RectangularRadioButtonGroupOptions
      isDisposable: false,
      orientation: 'horizontal',
      spacing: 12,
      radioButtonOptions: {
        baseColor: URColors.categoryButtonColorProperty,
        xMargin: 5,
        yMargin: 5
      }
    }, providedOptions );

    // describe a radio button for each category
    const items: RectangularRadioButtonGroupItem<ShoppingCategory>[] = categories.map( category => {
      return {
        value: category,
        createNode: () => new Image( category.image, { scale: 0.5 } )
      };
    } );

    super( categoryProperty, items, options );
  }
}

unitRates.register( 'ShoppingCategoryRadioButtonGroup', ShoppingCategoryRadioButtonGroup );