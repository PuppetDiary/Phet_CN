// Copyright 2017-2023, University of Colorado Boulder

/**
 * The 'Mystery' screen in 'Function Builder: Basics'.
 * This screen differs significantly from the Mystery screen in Function Builder.
 * Instead of numeric cards and functions, this Mystery screen uses pattern (image) cards and functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBColors from '../../../function-builder/js/common/FBColors.js';
import FBIconFactory from '../../../function-builder/js/common/view/FBIconFactory.js';
import FunctionBuilderStrings from '../../../function-builder/js/FunctionBuilderStrings.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import functionBuilderBasics from '../functionBuilderBasics.js';
import FBBMysteryModel from './model/FBBMysteryModel.js';
import FBBMysteryScreenView from './view/FBBMysteryScreenView.js';

export default class FBBMysteryScreen extends Screen<FBBMysteryModel, FBBMysteryScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {

      // ScreenOptions
      name: FunctionBuilderStrings.screen.mysteryStringProperty,
      backgroundColorProperty: FBColors.mysteryScreenBackgroundColorProperty,
      homeScreenIcon: FBIconFactory.createMysteryScreenIcon( {
        functionFill: 'white',
        questionMarkFill: 'red'
      } ),
      tandem: tandem
    };

    super(
      () => new FBBMysteryModel( options.tandem.createTandem( 'model' ) ),
      model => new FBBMysteryScreenView( model, options.tandem.createTandem( 'view' ) ),
      options
    );
  }
}

functionBuilderBasics.register( 'FBBMysteryScreen', FBBMysteryScreen );