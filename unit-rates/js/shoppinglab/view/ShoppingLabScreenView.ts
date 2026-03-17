// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the 'Shopping Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import ShoppingScreenView from '../../shopping/view/ShoppingScreenView.js';
import unitRates from '../../unitRates.js';
import ShoppingLabModel from '../model/ShoppingLabModel.js';
import ShoppingLabCategoryNode from './ShoppingLabCategoryNode.js';

export default class ShoppingLabScreenView extends ShoppingScreenView {

  public constructor( model: ShoppingLabModel, tandem: Tandem ) {

    super( model, tandem, {
      createCategoryNode: ( category, categoryProperty, layoutBounds, keypadLayer, viewProperties ) =>
        new ShoppingLabCategoryNode( category, categoryProperty, layoutBounds, keypadLayer, viewProperties )
    } );
  }
}

unitRates.register( 'ShoppingLabScreenView', ShoppingLabScreenView );