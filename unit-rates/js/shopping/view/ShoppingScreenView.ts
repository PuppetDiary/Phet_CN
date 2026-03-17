// Copyright 2016-2025, University of Colorado Boulder

/**
 * View for the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import ShoppingCategory from '../model/ShoppingCategory.js';
import ShoppingModel from '../model/ShoppingModel.js';
import ShoppingCategoryNode from './ShoppingCategoryNode.js';
import ShoppingCategoryRadioButtonGroup from './ShoppingCategoryRadioButtonGroup.js';
import ShoppingViewProperties from './ShoppingViewProperties.js';

type SelfOptions = {

  // Creates a Node for a shopping category.
  createCategoryNode?: ( category: ShoppingCategory,
                         categoryProperty: Property<ShoppingCategory>,
                         layoutBounds: Bounds2,
                         keypadLayer: KeypadLayer,
                         viewProperties: ShoppingViewProperties ) => Node;
};

type ShoppingScreenViewOptions = SelfOptions;

export default class ShoppingScreenView extends ScreenView {

  public constructor( model: ShoppingModel, tandem: Tandem, providedOptions?: ShoppingScreenViewOptions ) {

    const options = optionize<ShoppingScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      // SelfOptions
      createCategoryNode: ( category, categoryProperty, layoutBounds, keypadLayer, viewProperties ) =>
        new ShoppingCategoryNode( category, categoryProperty, layoutBounds, keypadLayer, viewProperties ),

      // ScreenViewOptions
      tandem: tandem
    }, providedOptions );

    super( options );

    // Properties that are specific to the view
    const viewProperties = new ShoppingViewProperties();

    // separate layer for model keypad
    const keypadLayer = new KeypadLayer();

    // Create the view for each category
    const categoryNodes = model.categories.map( category =>
      options.createCategoryNode( category, model.categoryProperty, this.layoutBounds, keypadLayer, viewProperties ) );

    // Category radio button group
    const categoryRadioButtonGroup = new ShoppingCategoryRadioButtonGroup( model.categories, model.categoryProperty, {
      left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.bottom - ( 2 * URConstants.SCREEN_Y_MARGIN )
    } );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.maxY - URConstants.SCREEN_Y_MARGIN
    } );

    // keypadLayer in the foreground!
    const screenViewRootNode = new Node( {
      children: [ ...categoryNodes, categoryRadioButtonGroup, resetAllButton, keypadLayer ]
    } );
    this.addChild( screenViewRootNode );
  }
}

unitRates.register( 'ShoppingScreenView', ShoppingScreenView );