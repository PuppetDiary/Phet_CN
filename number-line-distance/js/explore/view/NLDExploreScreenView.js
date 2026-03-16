// Copyright 2020-2025, University of Colorado Boulder

/**
 * View of the 'Explore' screen for the Number Line Distance simulation
 *
 * @author Saurabh Totey
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import birdInAir_png from '../../../../number-line-common/images/birdInAir_png.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import house_png from '../../../images/house_png.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistanceSceneView from './DistanceSceneView.js';
import ElevationSceneView from './ElevationSceneView.js';
import TemperatureSceneView from './TemperatureSceneView.js';

const ICON_SIZE = new Dimension2( 38, 38 );

class NLDExploreScreenView extends ScreenView {

  /**
   * @param {NLDExploreModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    // Scenes
    const distanceSceneView = new DistanceSceneView( model.distanceSceneModel );
    const temperatureSceneView = new TemperatureSceneView( model.temperatureSceneModel );
    const elevationSceneView = new ElevationSceneView( model.elevationSceneModel );

    // Show the selected scene.
    const sceneViews = [ distanceSceneView, temperatureSceneView, elevationSceneView ];
    model.selectedSceneModelProperty.link( selectedSceneModel => sceneViews.forEach( sceneView => {
      sceneView.visible = sceneView.model === selectedSceneModel;
    } ) );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        distanceSceneView.reset();
        temperatureSceneView.reset();
        elevationSceneView.reset();
      },
      right: this.layoutBounds.maxX - NLDConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLDConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // Describe the radio buttons for each scene.
    const sceneRadioButtonGroupItems = [
      {
        value: model.distanceSceneModel,
        createNode: () => new Image( house_png, { maxWidth: ICON_SIZE.width, maxHeight: ICON_SIZE.height } )
      },
      {
        value: model.temperatureSceneModel,
        createNode: () => new ThermometerNode( new NumberProperty( 0.5 ), 0, 1, {
          scale: 0.25
        } )
      },
      {
        value: model.elevationSceneModel,
        createNode: () => new Image( birdInAir_png, { maxWidth: ICON_SIZE.width, maxHeight: ICON_SIZE.height } )
      }
    ];

    // Create radio buttons for selecting a scene.
    const sceneRadioButtonGroup = new RectangularRadioButtonGroup(
      model.selectedSceneModelProperty,
      sceneRadioButtonGroupItems,
      {
        orientation: 'horizontal',
        spacing: 7,
        touchAreaXDilation: 3,
        touchAreaYDilation: 3,
        radioButtonOptions: {
          xMargin: 5,
          yMargin: 5,
          baseColor: 'white',
          buttonAppearanceStrategyOptions: {
            selectedLineWidth: 2,
            deselectedLineWidth: 0.5,
            deselectedButtonOpacity: 0.25
          }
        },
        center: resetAllButton.centerTop.plus( NLDConstants.BOTTOM_BOX_BOUNDS.rightCenter ).dividedScalar( 2 )
      }
    );

    this.addChild( sceneRadioButtonGroup );
    this.addChild( resetAllButton );
    this.addChild( distanceSceneView );
    this.addChild( temperatureSceneView );
    this.addChild( elevationSceneView );
  }

}

numberLineDistance.register( 'NLDExploreScreenView', NLDExploreScreenView );
export default NLDExploreScreenView;