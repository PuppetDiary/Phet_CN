// Copyright 2014-2024, University of Colorado Boulder

/**
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import leastSquaresRegression from '../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from './LeastSquaresRegressionConstants.js';
import LeastSquaresRegressionModel from './model/LeastSquaresRegressionModel.js';
import LeastSquaresRegressionScreenView from './view/LeastSquaresRegressionScreenView.js';

export default class LeastSquaresRegressionScreen extends Screen<LeastSquaresRegressionModel, LeastSquaresRegressionScreenView> {
  public constructor() {
    super(
      () => new LeastSquaresRegressionModel(),
      model => new LeastSquaresRegressionScreenView( model ), {
        backgroundColorProperty: new Property( LeastSquaresRegressionConstants.BACKGROUND_COLOR ),
        tandem: Tandem.OPT_OUT
      }
    );
  }
}

leastSquaresRegression.register( 'LeastSquaresRegressionScreen', LeastSquaresRegressionScreen );