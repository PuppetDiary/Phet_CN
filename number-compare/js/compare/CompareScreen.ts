// Copyright 2019-2025, University of Colorado Boulder

/**
 * The 'Compare' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import compareScreenIcon_png from '../../images/compareScreenIcon_png.js';
import NumberCompareColors from '../common/NumberCompareColors.js';
import NumberCompareQueryParameters from '../common/NumberCompareQueryParameters.js';
import numberCompareUtteranceQueue from '../common/view/numberCompareUtteranceQueue.js';
import numberCompare from '../numberCompare.js';
import NumberCompareStrings from '../NumberCompareStrings.js';
import CompareModel from './model/CompareModel.js';
import CompareScreenView from './view/CompareScreenView.js';

class CompareScreen extends Screen<CompareModel, CompareScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: NumberCompareStrings.screen.compareStringProperty,
      backgroundColorProperty: NumberCompareColors.whiteBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( compareScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new CompareModel(
        NumberCompareQueryParameters.compareMax,
        numberCompareUtteranceQueue.compareScreenSpeechDataProperty,
        tandem.createTandem( 'model' ) ),
      model => new CompareScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

numberCompare.register( 'CompareScreen', CompareScreen );
export default CompareScreen;