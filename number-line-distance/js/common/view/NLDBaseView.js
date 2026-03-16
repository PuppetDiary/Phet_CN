// Copyright 2020-2025, University of Colorado Boulder

/**
 * A view that contains elements that are used in all scenes/screens of the sim.
 * This view has all the common controls as well as the common display elements.
 * This is a 'base' view because it is meant to be used as the bottom layer in the scene graph for all scenes/screens.
 * Nothing needs to be disposed from this view because all instances of NLDBaseView are present for the sim's lifetime.
 *
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import NLCheckbox from '../../../../number-line-common/js/common/view/NLCheckbox.js';
import NLCheckboxGroup from '../../../../number-line-common/js/common/view/NLCheckboxGroup.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DistanceRepresentation from '../../common/model/DistanceRepresentation.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import NLDPreferences from '../model/NLDPreferences.js';
import NLDConstants from '../NLDConstants.js';
import DistanceStatementAccordionBox from './DistanceStatementAccordionBox.js';
import PointControllerLegendNode from './PointControllerLegendNode.js';

const pointLabelsStringProperty = NumberLineDistanceStrings.pointLabelsStringProperty;
const distanceLabelsStringProperty = NumberLineDistanceStrings.distanceLabelsStringProperty;
const distanceDescriptionStringProperty = NumberLineDistanceStrings.distanceDescriptionStringProperty;
const tickMarksStringProperty = NumberLineDistanceStrings.tickMarksStringProperty;
const absoluteValueStringProperty = NumberLineDistanceStrings.absoluteValueStringProperty;
const directedDistanceStringProperty = NumberLineDistanceStrings.directedDistanceStringProperty;
const displacementStringProperty = NumberLineDistanceStrings.displacementStringProperty;

const DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS = { font: new PhetFont( 16 ), maxWidth: 200 };
const DISTANCE_DESCRIPTION_TEXT_OPTIONS = { font: new PhetFont( 20 ), maxWidth: 515 };

export default class NLDBaseView extends Node {

  /**
   * pointControllerRepresentation parameters are used to represent the point controllers on the bottom left of the view:
   * they are used to display x_1 and x_2 or y_1 and y_2 in the area that allows them to be swapped.
   *
   * @param {AbstractNLDBaseModel} model
   * @param {Node} pointControllerRepresentationOne
   * @param {Node} pointControllerRepresentationTwo
   * @param {Object} config - options are not bubbled to Node superconstructor
   */
  constructor( model, pointControllerRepresentationOne, pointControllerRepresentationTwo, config ) {

    config = merge( {
      distanceDescriptionStrings: {

        // {string}
        absoluteDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.absoluteDistanceDescriptionTemplate
        ),
        directedPositiveDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.directedPositiveDistanceDescriptionTemplate
        ),
        directedNegativeDistanceDescriptionTemplate: required(
          config.distanceDescriptionStrings.directedNegativeDistanceDescriptionTemplate
        ),
        singularUnits: required( config.distanceDescriptionStrings.singularUnits ),
        pluralUnits: required( config.distanceDescriptionStrings.pluralUnits ),

        // Usages determine what the label should be. Make sure to take into consideration the model.isSwappedProperty and
        // model.numberLine.orientationProperty
        primaryPointControllerLabelStringProperty: required( config.distanceDescriptionStrings.primaryPointControllerLabelStringProperty ),
        secondaryPointControllerLabelStringProperty: required( config.distanceDescriptionStrings.secondaryPointControllerLabelStringProperty )
      },
      distanceStatementNodeOptions: { controlsValues: false }
    }, config );

    super();

    // checkboxes that control common model Properties for what should be visible
    // all used spacings and paddings were empirically determined
    const checkboxGroup = new NLCheckboxGroup(
      [
        new NLCheckbox( model.numberLine.showPointLabelsProperty, pointLabelsStringProperty ),
        new NLCheckbox( model.distanceLabelsVisibleProperty, distanceLabelsStringProperty ),
        new NLCheckbox( model.distanceDescriptionVisibleProperty, distanceDescriptionStringProperty ),
        new NLCheckbox( model.numberLine.showTickMarksProperty, tickMarksStringProperty )
      ]
    );

    ManualConstraint.create( this, [ checkboxGroup ], groupProxy => {
      groupProxy.right = NLDConstants.NLD_LAYOUT_BOUNDS.maxX - NLCConstants.SCREEN_VIEW_X_MARGIN;
    } );
    this.addChild( checkboxGroup );

    const createDirectedDistanceNode = () => new Node( {
      children: [
        new Text( directedDistanceStringProperty, merge( {
            visibleProperty:
              new DerivedProperty( [ NLDPreferences.terminologyProperty ],
                terminology => terminology === 'directedDistance' )
          },
          DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS ) ),
        new Text( displacementStringProperty, merge( {
            visibleProperty:
              new DerivedProperty( [ NLDPreferences.terminologyProperty ],
                terminology => terminology === 'displacement' )
          },
          DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS ) )
      ]
    } );

    // Radio buttons for how distance should be represented
    const distanceRepresentationRadioButtonGroup = new VerticalAquaRadioButtonGroup(
      model.distanceRepresentationProperty,
      [
        {
          value: DistanceRepresentation.ABSOLUTE,
          createNode: () => new Text( absoluteValueStringProperty, DISTANCE_TYPE_SELECTOR_TEXT_OPTIONS )
        },
        {
          value: DistanceRepresentation.DIRECTED,
          createNode: () => createDirectedDistanceNode()
        }
      ],
      {
        left: 50, // empirically determined
        top: 25,
        spacing: 9
      }
    );
    this.addChild( distanceRepresentationRadioButtonGroup );

    let pointControllerBoxNode = null;
    model.pointControllerBoxProperty.link( pointControllerBox => {
      pointControllerBoxNode && this.removeChild( pointControllerBoxNode );
      pointControllerBoxNode = new Rectangle( pointControllerBox, {
        fill: 'white',
        stroke: 'black',
        cornerRadius: 6
      } );
      this.addChild( pointControllerBoxNode );
    } );

    // Control at the bottom left for which representation is considered to be first and second.
    const pointControllerLegendNode = new PointControllerLegendNode(
      pointControllerRepresentationOne,
      pointControllerRepresentationTwo,
      model.isPrimaryControllerSwappedProperty,
      model.numberLine.orientationProperty, {
        left: 30,
        bottom: NLDConstants.NLD_LAYOUT_BOUNDS.maxY - 30
      } );
    this.addChild( pointControllerLegendNode );

    // @public {BooleanProperty} - controls whether the distance statement accordion box is opened or closed.
    this.accordionBoxOpenedProperty = new BooleanProperty( true );

    // Accordion box titled 'Distance Statement'
    const distanceStatementAccordionBox = new DistanceStatementAccordionBox( model, {
      expandedProperty: this.accordionBoxOpenedProperty,
      distanceStatementNodeOptions: config.distanceStatementNodeOptions,
      centerX: NLDConstants.NLD_LAYOUT_BOUNDS.centerX,
      top: NLDConstants.NLD_LAYOUT_BOUNDS.minY + 5
    } );
    this.addChild( distanceStatementAccordionBox );

    // DISTANCE DESCRIPTION
    // The labels and the unit properties change depending on context. These properties ensure that the pattern string labels are updated
    // appropriately in the map as needed.
    const unitsStringProperty = new DerivedProperty( [ config.distanceDescriptionStrings.singularUnits, config.distanceDescriptionStrings.pluralUnits, model.distanceProperty ],
      ( singularUnits, pluralUnits, distance ) => {
        return ( distance === 1 || distance === -1 ) ?
               singularUnits : pluralUnits;
      } );
    const patternStringValues = {
      primaryPointControllerLabel: config.distanceDescriptionStrings.primaryPointControllerLabelStringProperty,
      secondaryPointControllerLabel: config.distanceDescriptionStrings.secondaryPointControllerLabelStringProperty,
      difference: model.distanceProperty,
      units: unitsStringProperty
    };

    // Update pattern string labels and values based off of the distance representation and whether the
    // distance is positive or negative.
    const distanceDescriptionMaps = {
      difference: distance => Math.abs( distance )
    };

    const absoluteDistanceDescriptionPatternStringProperty = new PatternStringProperty( config.distanceDescriptionStrings.absoluteDistanceDescriptionTemplate,
      patternStringValues, {
        maps: distanceDescriptionMaps
      } );
    const absoluteDistanceDescriptionVisibleProperty = new BooleanProperty( false );

    const directedPositiveDistancePatternStringProperty = new PatternStringProperty( config.distanceDescriptionStrings.directedPositiveDistanceDescriptionTemplate,
      patternStringValues, {
        maps: distanceDescriptionMaps
      } );
    const directedPositiveDistanceVisibleProperty = new BooleanProperty( false );

    const directedNegativeDistancePatternStringProperty = new PatternStringProperty( config.distanceDescriptionStrings.directedNegativeDistanceDescriptionTemplate,
      patternStringValues, {
        maps: distanceDescriptionMaps
      } );
    const directedNegativeDistanceVisibleProperty = new BooleanProperty( false );

    // a text description for the distance under the distance statement accordion box
    const distanceDescriptionTextVisibleProperty = new DerivedProperty( [ model.distanceDescriptionVisibleProperty, model.pointValuesProperty ],
      distanceDescriptionVisible => {
        return distanceDescriptionVisible && model.areBothPointControllersControllingOnNumberLine();
      } );
    const distanceDescriptionTextWrapper = new Node( {
      visibleProperty: distanceDescriptionTextVisibleProperty,
      children: [ new RichText( absoluteDistanceDescriptionPatternStringProperty, merge( DISTANCE_DESCRIPTION_TEXT_OPTIONS, {
        visibleProperty: absoluteDistanceDescriptionVisibleProperty
      } ) ),
        new RichText( directedPositiveDistancePatternStringProperty, merge( DISTANCE_DESCRIPTION_TEXT_OPTIONS, {
          visibleProperty: directedPositiveDistanceVisibleProperty
        } ) ),
        new RichText( directedNegativeDistancePatternStringProperty, merge( DISTANCE_DESCRIPTION_TEXT_OPTIONS, {
          visibleProperty: directedNegativeDistanceVisibleProperty
        } ) ) ],
      excludeInvisibleChildrenFromBounds: true
    } );

    Multilink.multilink(
      [ model.distanceRepresentationProperty, model.distanceProperty ],
      ( distanceRepresentation, distance ) => {

        // Don't say anything about distance if both point controllers aren't on the number line.
        if ( !model.areBothPointControllersControllingOnNumberLine() ) {
          return;
        }

        absoluteDistanceDescriptionVisibleProperty.value = distanceRepresentation === DistanceRepresentation.ABSOLUTE || distance === 0;
        directedPositiveDistanceVisibleProperty.value = distanceRepresentation === DistanceRepresentation.DIRECTED && distance > 0;
        directedNegativeDistanceVisibleProperty.value = distanceRepresentation === DistanceRepresentation.DIRECTED && distance < 0;
      }
    );

    this.addChild( distanceDescriptionTextWrapper );

    ManualConstraint.create( this, [ distanceDescriptionTextWrapper, distanceStatementAccordionBox ],
      ( wrapperProxy, accordionProxy ) => {
        wrapperProxy.centerX = accordionProxy.centerX;
        wrapperProxy.top = accordionProxy.bottom + 15; // padding empirically determined
      } );
  }
}

numberLineDistance.register( 'NLDBaseView', NLDBaseView );