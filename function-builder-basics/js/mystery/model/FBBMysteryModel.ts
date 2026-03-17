// Copyright 2017-2024, University of Colorado Boulder

/**
 * Model for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBModel from '../../../../function-builder/js/common/model/FBModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
import FBBMysteryChallenges from './FBBMysteryChallenges.js';
import FBBMysteryScene from './FBBMysteryScene.js';

export default class FBBMysteryModel extends FBModel {

  public constructor( tandem: Tandem ) {
    super( [
      new FBBMysteryScene( FBBMysteryChallenges.POOL1, { numberOfSlots: 1 } ),
      new FBBMysteryScene( FBBMysteryChallenges.POOL2, { numberOfSlots: 2 } ),
      new FBBMysteryScene( FBBMysteryChallenges.POOL3, { numberOfSlots: 3 } )
    ] );
  }
}

functionBuilderBasics.register( 'FBBMysteryModel', FBBMysteryModel );