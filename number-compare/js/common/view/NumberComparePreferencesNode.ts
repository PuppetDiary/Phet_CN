// Copyright 2022-2024, University of Colorado Boulder

/**
 * NumberComparePreferencesNode is the user interface for sim-specific preferences for Number Compare, accessed via the
 * Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Disposable from '../../../../axon/js/Disposable.js';
import NumberSuiteCommonPreferencesNode from '../../../../number-suite-common/js/common/view/NumberSuiteCommonPreferencesNode.js';
import CompareScreen from '../../compare/CompareScreen.js';
import numberCompare from '../../numberCompare.js';
import numberComparePreferences from '../model/numberComparePreferences.js';
import numberCompareUtteranceQueue from './numberCompareUtteranceQueue.js';

export default class NumberComparePreferencesNode extends NumberSuiteCommonPreferencesNode {

  public constructor() {

    super( numberComparePreferences, numberCompareUtteranceQueue, [], {
      secondLanguageControlEnabled: NumberSuiteCommonPreferencesNode.hasScreenType( CompareScreen )
    } );
  }

  public override dispose(): void {
    Disposable.assertNotDisposable();
    super.dispose();
  }
}

numberCompare.register( 'NumberComparePreferencesNode', NumberComparePreferencesNode );