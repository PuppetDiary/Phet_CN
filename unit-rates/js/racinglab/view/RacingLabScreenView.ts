// Copyright 2017-2025, University of Colorado Boulder

/**
 * View for the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import URConstants from '../../common/URConstants.js';
import DoubleNumberLineAccordionBox from '../../common/view/DoubleNumberLineAccordionBox.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import RacingLabModel from '../model/RacingLabModel.js';
import NumberOfCarsRadioButtonGroup from './NumberOfCarsRadioButtonGroup.js';
import RaceCarRateAccordionBox from './RaceCarRateAccordionBox.js';
import RaceTrackNode from './RaceTrackNode.js';
import RacingLabViewProperties from './RacingLabViewProperties.js';
import ResetRaceButton from './ResetRaceButton.js';
import StartStopButton from './StartStopButton.js';

// constants
const BUTTON_X_SPACE = 20; // space between buttons
const ACCORDION_BOX_X_SPACE = 10; // space between accordion boxes

export default class RacingLabScreenView extends ScreenView {

  public constructor( model: RacingLabModel, tandem: Tandem ) {

    super( {
      tandem: tandem
    } );

    // Properties that are specific to the view
    const viewProperties = new RacingLabViewProperties();

    // separate layer for model keypad
    const keypadLayer = new KeypadLayer();

    // Double number line for car1
    const doubleNumberLineAccordionBox1 = new DoubleNumberLineAccordionBox(
      model.car1.doubleNumberLine, model.car1.markerEditor, keypadLayer, {
        axisViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
        titleStringProperty: UnitRatesStrings.doubleNumberLine1StringProperty,
        expandedProperty: viewProperties.doubleNumberLine1ExpandedProperty,
        indicatorXProperty: model.car1.distanceProperty,
        indicatorColor: model.car1.color,
        keypadPanelPosition: 'below'
      } );

    // Double number line for car2
    const doubleNumberLineAccordionBox2 = new DoubleNumberLineAccordionBox(
      model.car2.doubleNumberLine, model.car2.markerEditor, keypadLayer, {
        axisViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
        titleStringProperty: UnitRatesStrings.doubleNumberLine2StringProperty,
        expandedProperty: viewProperties.doubleNumberLine2ExpandedProperty,
        indicatorXProperty: model.car2.distanceProperty,
        indicatorColor: model.car2.color,
        keypadPanelPosition: 'above'
      } );

    // Rate control for car1
    const rateAccordionBox1 = new RaceCarRateAccordionBox( model.car1, {
      titleStringProperty: UnitRatesStrings.rate1StringProperty,
      expandedProperty: viewProperties.rate1ExpandedProperty
    } );

    // Rate control for car2
    const rateAccordionBox2 = new RaceCarRateAccordionBox( model.car2, {
      titleStringProperty: UnitRatesStrings.rate2StringProperty,
      expandedProperty: viewProperties.rate2ExpandedProperty
    } );

    const hBox1 = new HBox( {
      stretch: true,
      children: [ doubleNumberLineAccordionBox1, rateAccordionBox1 ],
      spacing: ACCORDION_BOX_X_SPACE,
      align: 'top',
      left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      top: this.layoutBounds.top + URConstants.SCREEN_Y_MARGIN
    } );

    const hBox2 = new HBox( {
      stretch: true,
      children: [ doubleNumberLineAccordionBox2, rateAccordionBox2 ],
      spacing: ACCORDION_BOX_X_SPACE,
      align: 'top',
      left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.bottom - URConstants.SCREEN_Y_MARGIN
    } );

    // Track for car1
    const trackNode1 = new RaceTrackNode( model.car1, viewProperties.timer1ExpandedProperty, viewProperties.arrowsVisibleProperty, {
      timerTitleStringProperty: UnitRatesStrings.timer1StringProperty,
      trackViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
      x: this.globalToLocalPoint( doubleNumberLineAccordionBox1.getGlobalOrigin() ).x, // aligned with double number line
      bottom: this.layoutBounds.centerY - 10
    } );

    // Track for car2
    const trackNode2 = new RaceTrackNode( model.car2, viewProperties.timer2ExpandedProperty, viewProperties.arrowsVisibleProperty, {
      timerTitleStringProperty: UnitRatesStrings.timer2StringProperty,
      trackViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
      x: this.globalToLocalPoint( doubleNumberLineAccordionBox2.getGlobalOrigin() ).x, // aligned with double number line
      top: this.layoutBounds.centerY + ( this.layoutBounds.centerY - trackNode1.bottom )
    } );

    // Radio button group for number of cars
    const numberOfCarsRadioButtonGroup = new NumberOfCarsRadioButtonGroup( model.car2.visibleProperty, {
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      centerY: this.layoutBounds.centerY
    } );

    // Start/Stop button
    const startStopButton = new StartStopButton( model.runningProperty, {
      right: numberOfCarsRadioButtonGroup.left - BUTTON_X_SPACE,
      centerY: this.layoutBounds.centerY
    } );

    // Reset Race button
    const resetRace = new ResetRaceButton( {
      listener: () => {
        model.runningProperty.value = false;
        model.car1.resetRace();
        model.car2.resetRace();
      },
      right: startStopButton.left - BUTTON_X_SPACE,
      centerY: startStopButton.centerY
    } );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.maxY - URConstants.SCREEN_Y_MARGIN
    } );

    const screenViewRootNode = new Node( {
      children: [
        hBox1,
        hBox2,
        trackNode1,
        trackNode2,
        numberOfCarsRadioButtonGroup,
        startStopButton,
        resetRace,
        resetAllButton,
        keypadLayer // last, so that keypad is in front of everything
      ]
    } );
    this.addChild( screenViewRootNode );

    // car1 should always be visible, because the view doesn't support hiding it. unlink not needed.
    model.car1.visibleProperty.link( visible => {
      assert && assert( model.car1.visibleProperty.value, 'car1 should always be visible' );
    } );

    // Show/hide components related to car2. unlink not needed.
    model.car2.visibleProperty.link( visible => {
      rateAccordionBox2.visible = visible;
      doubleNumberLineAccordionBox2.visible = visible;
      trackNode2.visible = visible;
    } );

    // Disable the restart button when both cars are at the starting line. unmultilink not needed
    Multilink.multilink( [ model.car1.distanceProperty, model.car2.distanceProperty ],
      ( distance1, distance2 ) => {
        resetRace.enabled = !( distance1 === 0 && distance2 === 0 );
      } );
  }
}

unitRates.register( 'RacingLabScreenView', RacingLabScreenView );