// Copyright 2019-2025, University of Colorado Boulder

/**
 * The 'Lab' screen. Used in both 'Number Compare' and 'Number Play' simulations.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import labScreenIcon_png from '../../images/labScreenIcon_png.js';
import NumberSuiteCommonPreferences from '../common/model/NumberSuiteCommonPreferences.js';
import NumberSuiteCommonColors from '../common/NumberSuiteCommonColors.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
import type SymbolType from './view/SymbolType.js';

class LabScreen<T extends NumberSuiteCommonPreferences> extends Screen<LabModel, LabScreenView<NumberSuiteCommonPreferences>> {

  public constructor( symbolTypes: SymbolType[], preferences: T, tandem: Tandem ) {

    const options = {
      name: NumberSuiteCommonStrings.screen.labStringProperty,
      backgroundColorProperty: NumberSuiteCommonColors.lightPurpleBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( labScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new LabModel( tandem.createTandem( 'model' ) ),
      ( model: LabModel ) => new LabScreenView( model, symbolTypes, preferences, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

numberSuiteCommon.register( 'LabScreen', LabScreen );
export default LabScreen;