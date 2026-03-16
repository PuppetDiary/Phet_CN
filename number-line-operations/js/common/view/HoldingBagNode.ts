// Copyright 2020-2025, University of Colorado Boulder

/**
 * HoldingBagNode is the view representation of a HoldingBag, which is the place where items with value are placed so
 * that they count towards the total value tracked by the model.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import assetsBag_png from '../../../images/assetsBag_png.js';
import debtsBag_png from '../../../images/debtsBag_png.js';
import numberLineOperations from '../../numberLineOperations.js';
import HoldingBag from '../model/HoldingBag.js';

// constants
const TAG_RECTANGLE_COMMON_OPTIONS = {
  fill: Color.WHITE,
  stroke: Color.BLACK,
  cornerRadius: 5
};

// value for sizing the tag and positioning the text within, empirically determined to look good with various strings
const TAG_Y_MARGIN = 8;
const TAG_X_MARGIN = 12;
const TAG_ATTACHMENT_POINT_OFFSET = 9;
const LABEL_WIDTH = 90;

class HoldingBagNode extends Node {

  public constructor( holdingBag: HoldingBag, labelTextProperty: TReadOnlyProperty<string> ) {

    // Get the image that is associated with this bag's supported values.
    const image = holdingBag.itemAcceptanceTest === HoldingBag.ACCEPT_ONLY_NEGATIVE_VALUES ?
                  debtsBag_png :
                  assetsBag_png;

    const imageNode = new Image( image, {
      maxWidth: holdingBag.radius * 2,
      centerX: holdingBag.position.x,

      // Because the bag images have a sort of "tied off" area on top, position the bag based on the bottom.
      bottom: holdingBag.position.y + holdingBag.radius
    } );

    // label text that will go on the tag
    const labelTextNode = new Text( labelTextProperty, {
      font: new PhetFont( 20 ),
      maxWidth: LABEL_WIDTH
    } );

    // The tag is a rectangle with a white background and a textual label on it.  It is intended to like the sort of tag
    // that one would attach to a gift.  Because the artwork has a ribbon that ends where the tags are supposed to be
    // placed, some of the positioning and layout below are fairly "tweaky" and will need to be adjusted if the artwork
    // changes.
    const tag = new Rectangle(
      0,
      0,
      LABEL_WIDTH + 2 * TAG_X_MARGIN + TAG_ATTACHMENT_POINT_OFFSET,
      labelTextNode.height + 2 * TAG_Y_MARGIN,
      TAG_RECTANGLE_COMMON_OPTIONS
    );

    // Position the text and the label based on whether the tag's ribbon attaches on the left or right side.
    if ( image === debtsBag_png ) {
      tag.right = imageNode.centerX - 19;
      tag.centerY = imageNode.top + 4;
    }
    else {
      tag.left = imageNode.centerX + 20;
      tag.centerY = imageNode.top + 6;
    }

    tag.addChild( labelTextNode );

    ManualConstraint.create( tag, [ labelTextNode ], textProxy => {
      labelTextNode.centerY = tag.height / 2;
      if ( image === debtsBag_png ) {
        labelTextNode.left = TAG_X_MARGIN;
      }
      else {
        labelTextNode.right = tag.width - TAG_X_MARGIN;
      }
    } );

    super( { children: [ tag, imageNode ] } );
  }
}

numberLineOperations.register( 'HoldingBagNode', HoldingBagNode );
export default HoldingBagNode;