// Copyright 2020-2025, University of Colorado Boulder

/**
 * View of the 'Generic' screen for the Number Line Distance simulation
 *
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import NumberLineOrientationSelector from '../../../../number-line-common/js/common/view/NumberLineOrientationSelector.js';
import NumberLineRangeSelector from '../../../../number-line-common/js/common/view/NumberLineRangeSelector.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import PointsOffScaleCondition from '../../../../number-line-common/js/common/view/PointsOffScaleCondition.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import NLDConstants from '../../common/NLDConstants.js';
import DistanceShadedNumberLineNode from '../../common/view/DistanceShadedNumberLineNode.js';
import NLDBaseView from '../../common/view/NLDBaseView.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';

const genericAbsoluteDistanceTemplateStringProperty = NumberLineDistanceStrings.genericAbsoluteDistanceTemplateStringProperty;
const genericDirectedPositiveDistanceTemplateStringProperty = NumberLineDistanceStrings.genericDirectedPositiveDistanceTemplateStringProperty;
const genericDirectedNegativeDistanceTemplateStringProperty = NumberLineDistanceStrings.genericDirectedNegativeDistanceTemplateStringProperty;
const horizontalPrimaryPointControllerPatternStringProperty = new PatternStringProperty( NumberLineDistanceStrings.mathSymbolPatternStringProperty, {
  symbol: NLDConstants.X_1_STRING
} );
const verticalPrimaryPointControllerPatternStringProperty = new PatternStringProperty( NumberLineDistanceStrings.mathSymbolPatternStringProperty, {
  symbol: NLDConstants.Y_1_STRING
} );
const horizontalSecondaryPointControllerPatternStringProperty = new PatternStringProperty( NumberLineDistanceStrings.mathSymbolPatternStringProperty, {
  symbol: NLDConstants.X_2_STRING
} );
const verticalSecondaryPointControllerPatternStringProperty = new PatternStringProperty( NumberLineDistanceStrings.mathSymbolPatternStringProperty, {
  symbol: NLDConstants.Y_2_STRING
} );
const unitStringProperty = NumberLineDistanceStrings.unitStringProperty;
const unitsStringProperty = NumberLineDistanceStrings.unitsStringProperty;

const CIRCLE_REPRESENTATION_RADIUS = 6;

class NLDGenericScreenView extends ScreenView {

  /**
   * @param {NLDGenericModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    // the point controllers are represented as circles on the bottom left corner of the screen
    const firstControllerRepresentation = new Circle( CIRCLE_REPRESENTATION_RADIUS, { fill: 'magenta' } );
    const secondControllerRepresentation = new Circle( CIRCLE_REPRESENTATION_RADIUS, { fill: 'blue' } );

    const baseView = new NLDBaseView(
      model,
      firstControllerRepresentation,
      secondControllerRepresentation,
      {
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: genericAbsoluteDistanceTemplateStringProperty,
          directedPositiveDistanceDescriptionTemplate: genericDirectedPositiveDistanceTemplateStringProperty,
          directedNegativeDistanceDescriptionTemplate: genericDirectedNegativeDistanceTemplateStringProperty,
          singularUnits: unitStringProperty,
          pluralUnits: unitsStringProperty,
          primaryPointControllerLabelStringProperty: new DerivedProperty( [ model.numberLine.orientationProperty,
              horizontalPrimaryPointControllerPatternStringProperty, verticalPrimaryPointControllerPatternStringProperty ],
            ( orientation, horizontalPrimaryPoint, verticalPrimaryPoint ) => {
              return ( orientation === Orientation.HORIZONTAL ) ? horizontalPrimaryPoint : verticalPrimaryPoint;
            } ),
          secondaryPointControllerLabelStringProperty: new DerivedProperty( [ model.numberLine.orientationProperty,
              horizontalSecondaryPointControllerPatternStringProperty, verticalSecondaryPointControllerPatternStringProperty ],
            ( orientation, horizontalSecondaryPoint, verticalSecondaryPoint ) => {
              return ( orientation === Orientation.HORIZONTAL ) ? horizontalSecondaryPoint : verticalSecondaryPoint;
            } )
        },
        distanceStatementNodeOptions: { controlsValues: true }
      }
    );
    this.addChild( baseView );

    // reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        baseView.accordionBoxOpenedProperty.reset();
      },
      right: this.layoutBounds.maxX - NLDConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLDConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // adds orientation selectors for the number line
    const orientationSelector = new NumberLineOrientationSelector( model.numberLine.orientationProperty, {
      bottom: NLDConstants.NLD_LAYOUT_BOUNDS.maxY - 50,
      right: resetAllButton.left - 50,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } );
    this.addChild( orientationSelector );

    // adds range selectors for the number line
    this.addChild( new NumberLineRangeSelector(
      model.numberLine.displayedRangeProperty,
      NLDConstants.GENERIC_NUMBER_LINE_RANGES,
      this,
      {
        bottom: orientationSelector.top - 15,
        left: orientationSelector.left
      }
    ) );

    // point controllers
    const pointControllerNodeLayer = new Node( {
      children: model.pointControllers.map( pointController => new PointControllerNode( pointController ) )
    } );
    this.addChild( pointControllerNodeLayer );

    // number line
    const numberLineNode = new DistanceShadedNumberLineNode(
      model,
      {
        pointsOffScaleCondition: PointsOffScaleCondition.SOME,
        pointNameLabelOffsetFromHorizontalNumberLine: 65,
        pointNameLabelOffsetFromVerticalNumberLine: 70
      }
    );
    this.addChild( numberLineNode );
  }

}

numberLineDistance.register( 'NLDGenericScreenView', NLDGenericScreenView );
export default NLDGenericScreenView;