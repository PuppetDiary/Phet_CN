// Copyright 2023-2024, University of Colorado Boulder

/**
 * Extends the Game screen in Area Model: Multiplication. Passes in AMM's JugglerImages to the Game screen.
 *
 * @author Luisa Vargas
 */

import GenericGameScreen from '../../../area-model-common/js/screens/GenericGameScreen.js';
import areaModelMultiplication from '../areaModelMultiplication.js';
import AreaModelMultiplicationImages from '../AreaModelMultiplicationImages.js';
import AreaModelMultiplicationQueryParameters from '../AreaModelMultiplicationQueryParameters.js';

class GameScreen extends GenericGameScreen {

  /**
   * @public
   */
  constructor() {

    super( AreaModelMultiplicationImages.genericGameScreenIconImageProperty,
      [
        AreaModelMultiplicationImages.level1ImageProperty,
        AreaModelMultiplicationImages.level2ImageProperty,
        AreaModelMultiplicationImages.level3ImageProperty,
        AreaModelMultiplicationImages.level4ImageProperty,
        AreaModelMultiplicationImages.level5ImageProperty,
        AreaModelMultiplicationImages.level6ImageProperty
      ],
      AreaModelMultiplicationQueryParameters.gameLevels );
  }
}

areaModelMultiplication.register( 'GameScreen', GameScreen );
export default GameScreen;