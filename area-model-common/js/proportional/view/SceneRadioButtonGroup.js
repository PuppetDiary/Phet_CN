// Copyright 2017-2026, University of Colorado Boulder

/**
 * Shows radio buttons that allow selecting between different sized proportional areas.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonRadioButtonGroup from '../../common/view/AreaModelCommonRadioButtonGroup.js';

class SceneRadioButtonGroup extends AreaModelCommonRadioButtonGroup {
  /**
   * @param {ProportionalAreaModel} model
   * @param {Object} [nodeOptions]
   */
  constructor( model, nodeOptions ) {
    const group = new AlignGroup(); // have all the buttons the same size

    assert && assert( model.areas.length === 2 || model.areas.length === 3,
      'We only have strings for the 2 or 3 case (right now)' );

    super( model.currentAreaProperty, model.areas.map( area => {
      return {
        value: area,
        createNode: () => new AlignBox( new Text( area.getDimensionString(), {
          font: AreaModelCommonConstants.SYMBOL_FONT
        } ), { group: group } ),
        options: {

          // pdom
          accessibleName: new PatternStringProperty( AreaModelCommonStrings.a11y.sceneSelectionPatternStringProperty, {
            width: area.maximumSize,
            height: area.maximumSize
          } )
        }
      };
    } ), {

      // pdom
      accessibleName: AreaModelCommonStrings.a11y.areaGridSizeStringProperty
    } );

    this.mutate( nodeOptions );
  }
}

areaModelCommon.register( 'SceneRadioButtonGroup', SceneRadioButtonGroup );
export default SceneRadioButtonGroup;