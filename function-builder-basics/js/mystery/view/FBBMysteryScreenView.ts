// Copyright 2017-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBScreenView from '../../../../function-builder/js/common/view/FBScreenView.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
import FBBMysteryModel from '../model/FBBMysteryModel.js';
import FBBMysterySceneNode from './FBBMysterySceneNode.js';

export default class FBBMysteryScreenView extends FBScreenView {

  public constructor( model: FBBMysteryModel, tandem: Tandem ) {
    super( model, FBBMysterySceneNode, {
      sceneRadioButtonGroupYOffset: 535, // offset of SceneRadioButtonGroup from top of screen
      tandem: tandem
    } );
  }
}

functionBuilderBasics.register( 'FBBMysteryScreenView', FBBMysteryScreenView );