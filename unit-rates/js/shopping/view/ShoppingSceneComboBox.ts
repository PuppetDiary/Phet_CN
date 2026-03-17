// Copyright 2016-2025, University of Colorado Boulder

/**
 * Combo box for selecting a scene in the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node, { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import unitRates from '../../unitRates.js';
import ShoppingScene from '../model/ShoppingScene.js';

type SelfOptions = {
  iconSize?: Dimension2; // size of the icons in the combo box
};

type ShoppingSceneComboBoxOptions = SelfOptions & NodeTranslationOptions;

export default class ShoppingSceneComboBox extends ComboBox<ShoppingScene> {

  /**
   * @param shoppingSceneProperty - the selected scene
   * @param shoppingScenes
   * @param parentNode - the parent node of the combo box
   * @param [providedOptions]
   */
  public constructor( shoppingSceneProperty: Property<ShoppingScene>, shoppingScenes: ShoppingScene[],
                      parentNode: Node, providedOptions?: ShoppingSceneComboBoxOptions ) {

    assert && assert( shoppingScenes.length > 0, 'at least 1 ShoppingScene is required' );

    const options = optionize<ShoppingSceneComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // SelfOptions
      iconSize: new Dimension2( 30, 30 ),

      // ComboBoxOptions
      isDisposable: false,
      listPosition: 'above',
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 10
    }, providedOptions );

    // {ComboBoxItem[]}
    const items: ComboBoxItem<ShoppingScene>[] = shoppingScenes.map( shoppingScene => createItem( shoppingScene, options.iconSize ) );

    super( shoppingSceneProperty, items, parentNode, options );
  }
}

/**
 * Creates an item for the combo box.
 */
function createItem( shoppingScene: ShoppingScene, iconSize: Dimension2 ): ComboBoxItem<ShoppingScene> {

  // Scale the image down if it's larger than iconSize
  const imageNode = new Image( shoppingScene.itemImage );
  if ( imageNode.width > iconSize.width || imageNode.height > iconSize.height ) {
    const scale = Math.min( iconSize.width / imageNode.width, iconSize.height / imageNode.height );
    imageNode.setScaleMagnitude( scale );
  }

  // Create uniform icon size by centering the image on a transparent rectangle
  const iconNode = new Node( {
    children: [
      imageNode,
      new Rectangle( 0, 0, iconSize.width, iconSize.height, { center: imageNode.center } )
    ]
  } );

  // Use the plural name to label the item
  const labelNode = new Text( shoppingScene.pluralNameStringProperty, {
    font: new PhetFont( 18 ),
    maxWidth: 140,
    children: [ new HStrut( 140 ) ] // makes labels for all items the same width
  } );

  return {
    value: shoppingScene,

    // icon to the left of label
    createNode: () => new HBox( {
      align: 'center',
      spacing: 10,
      children: [ iconNode, labelNode ]
    } )
  };
}

unitRates.register( 'ShoppingSceneComboBox', ShoppingSceneComboBox );