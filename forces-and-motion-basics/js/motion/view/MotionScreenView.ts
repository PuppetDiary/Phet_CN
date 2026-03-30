// Copyright 2013-2025, University of Colorado Boulder

/**
 * Main scenery view for the Motion, Friction and Acceleration screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { newtonsUnit } from '../../../../scenery-phet/js/units/newtonsUnit.js';
import PDOMPeer from '../../../../scenery/js/accessibility/pdom/PDOMPeer.js';
import { pdomFocusProperty } from '../../../../scenery/js/accessibility/pdomFocusProperty.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import skateboard_svg from '../../../images/skateboard_svg.js';
import ForcesAndMotionBasicsQueryParameters from '../../common/ForcesAndMotionBasicsQueryParameters.js';
import ForcesAndMotionBasicsLayoutBounds from '../../common/view/ForcesAndMotionBasicsLayoutBounds.js';
import ReadoutArrow from '../../common/view/ReadoutArrow.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import ForcesAndMotionBasicsFluent from '../../ForcesAndMotionBasicsFluent.js';
import Item from '../model/Item.js';
import MotionModel from '../model/MotionModel.js';
import AccelerometerNode from './AccelerometerNode.js';
import AppliedForceControl from './AppliedForceControl.js';
import ItemNode from './ItemNode.js';
import ItemStackGroupNode from './ItemStackGroupNode.js';
import ItemToolboxGroupNode from './ItemToolboxGroupNode.js';
import MotionAccelerationDescriptionNode from './MotionAccelerationDescriptionNode.js';
import MotionControlPanel from './MotionControlPanel.js';
import MotionForcesDescriptionNode from './MotionForcesDescriptionNode.js';
import MotionGrabReleaseCueNode from './MotionGrabReleaseCueNode.js';
import MotionScreenSummaryContent from './MotionScreenSummaryContent.js';
import MotionSpeedDescriptionNode from './MotionSpeedDescriptionNode.js';
import MotionStackDescriptionNode from './MotionStackDescriptionNode.js';
import MovingBackgroundNode from './MovingBackgroundNode.js';
import PusherNode from './PusherNode.js';
import SpeedometerNode from './SpeedometerNode.js';
import WaterBucketNode from './WaterBucketNode.js';
import FeedbackManager from '../../common/model/FeedbackManager.js';
import { motionFeedbackRules, frictionFeedbackRules, encouragementRules } from './MotionFeedbackRules.js';
import { accelerationFeedbackRules } from './AccelerationFeedbackRules.js';
import TutorialOverlayNode, { type TutorialStep } from '../../common/view/TutorialOverlayNode.js';

const sumOfForcesStringProperty = ForcesAndMotionBasicsFluent.sumOfForcesStringProperty;

// constants
const PLAY_PAUSE_BUFFER = 10; // separation between step and reset all button, useful for i18n

// strings
const accelerationStringProperty = ForcesAndMotionBasicsFluent.accelerationStringProperty;
const appliedForceStringProperty = ForcesAndMotionBasicsFluent.appliedForceStringProperty;
const frictionForceStringProperty = ForcesAndMotionBasicsFluent.frictionForceStringProperty;
const pattern0Name1ValueUnitsAccelerationStringProperty = ForcesAndMotionBasicsFluent.pattern[ '0name' ][ '1valueUnitsAccelerationStringProperty' ];
const sumOfForcesEqualsZeroStringProperty = ForcesAndMotionBasicsFluent.sumOfForcesEqualsZeroStringProperty;

export default class MotionScreenView extends ScreenView {

  private readonly resetAllButton: ResetAllButton;
  private readonly feedbackManager: FeedbackManager;
  private readonly sumArrow: ReadoutArrow;
  private readonly sumOfForcesNode: Node;
  public readonly itemNodes: ItemNode[];
  private readonly appliedForceArrow: ReadoutArrow;
  private readonly frictionArrow: ReadoutArrow;
  private readonly itemModelToNodeMap = new Map<Item, ItemNode>();
  private readonly toolboxContainer: Node;
  private readonly grabReleaseCueNode: MotionGrabReleaseCueNode;

  // Keyboard navigation groups
  public readonly itemToolboxGroup: ItemToolboxGroupNode;
  public readonly itemStackGroup: ItemStackGroupNode;

  // Tutorial system
  private readonly tutorialOverlay: TutorialOverlayNode;
  private readonly appliedForceControl: AppliedForceControl;
  private readonly controlPanel: MotionControlPanel;
  private readonly speedometerNode: SpeedometerNode;
  private readonly accelerometerNode: Node | null;  // Only available on acceleration screen

  /**
   * @param model model for the entire screen
   * @param tandem
   */
  public constructor( private readonly model: MotionModel, tandem: Tandem ) {

    super( {
      layoutBounds: ForcesAndMotionBasicsLayoutBounds,
      tandem: tandem,
      screenSummaryContent: new MotionScreenSummaryContent( model )
    } );

    // Variables for this constructor, for convenience
    const width = this.layoutBounds.width;
    const height = this.layoutBounds.height;

    // Constants
    const skyHeight = 362;
    const groundHeight = height - skyHeight;

    // Create the static background
    const skyGradient = new LinearGradient( 0, 0, 0, skyHeight ).addColorStop( 0, '#02ace4' ).addColorStop( 1, '#cfecfc' );
    const sky = new Rectangle( -width, -skyHeight, width * 3, skyHeight * 2, { fill: skyGradient, pickable: false } );

    const groundNode = new Rectangle( -width, skyHeight, width * 3, groundHeight * 3, {
      fill: '#c59a5b',
      pickable: false
    } );
    this.addChild( sky );
    this.addChild( groundNode );

    // Create the dynamic (moving) background
    this.addChild( new MovingBackgroundNode( model, this.layoutBounds.width / 2 ).mutate( { layerSplit: true } ) );

    // The pusher should be behind the skateboard
    this.addChild( new PusherNode( model, this.layoutBounds.width, this.itemModelToNodeMap, tandem.createTandem( 'pusherNode' ) ) );

    // Add the skateboard if on the 'motion' screen
    if ( model.skateboard ) {
      this.addChild( new Image( skateboard_svg, {
        scale: 0.75,
        centerX: width / 2, y: 315 + 12,
        pickable: false
      } ) );
    }

    // Add toolbox backgrounds for the objects
    const boxHeight = 180;
    const showItemToolboxes = ForcesAndMotionBasicsQueryParameters.showItemToolboxes;
    const fill = showItemToolboxes ? '#e7e8e9' : null;
    const stroke = showItemToolboxes ? '#000000' : null;
    const leftItemToolboxNode = new Rectangle( 10, height - boxHeight - 10, 300, boxHeight, 10, 10, {
      fill: fill,
      stroke: stroke,
      lineWidth: 1
    } );
    const rightItemToolboxNode = new Rectangle( width - 10 - 300, height - boxHeight - 10, 300, boxHeight, 10, 10, {
      fill: fill,
      stroke: stroke,
      lineWidth: 1
    } );

    this.appliedForceControl = new AppliedForceControl( ( rightItemToolboxNode.left - leftItemToolboxNode.right ) - 10, model, tandem.createTandem( 'appliedForceControl' ) );

    const appliedForcePlayAreaControlNode = new Node( {
      tagName: 'div',
      accessibleHeading: ForcesAndMotionBasicsFluent.a11y.motionScreen.playAreaControls.appliedForceControl.accessibleHeadingStringProperty,
      descriptionContent: ForcesAndMotionBasicsFluent.a11y.motionScreen.playAreaControls.appliedForceControl.descriptionStringProperty,
      appendDescription: false,
      children: [ this.appliedForceControl ]
    } );

    // The FineCoarseSpinner does not have an accessibleName. Instead, we manually create an association to the
    // "Applied Force Control" heading.
    this.appliedForceControl.spinner.addAriaLabelledbyAssociation( {

      // This element's focusable element is labelled by...
      thisElementName: PDOMPeer.PRIMARY_SIBLING,

      // ...the heading of the applied force play area control node
      otherNode: appliedForcePlayAreaControlNode,
      otherElementName: PDOMPeer.HEADING_SIBLING
    } );

    const top = leftItemToolboxNode.top - 4;
    ManualConstraint.create( this, [ appliedForcePlayAreaControlNode ], appliedForcePlayAreaControlNodeProxy => {
      appliedForcePlayAreaControlNodeProxy.centerX = this.layoutBounds.centerX;
      appliedForcePlayAreaControlNodeProxy.top = top;
    } );

    this.addChild( appliedForcePlayAreaControlNode );

    // Accessible forces list description for Motion screens
    const forcesDescriptionNode = new MotionForcesDescriptionNode( model );
    this.addChild( forcesDescriptionNode );

    // Acceleration description (visible only on acceleration screen when checkbox enabled)
    const accelerationDescriptionNode = new MotionAccelerationDescriptionNode( model );
    this.addChild( accelerationDescriptionNode );

    // Compute dynamic speed description to announce when Speed is enabled
    const speedDescriptionNode = new MotionSpeedDescriptionNode( model );
    this.addChild( speedDescriptionNode );

    // Create the speedometer.  Specify the position after construction so we can set the 'top'
    this.speedometerNode = new SpeedometerNode( model.speedProperty, model.showSpeedProperty, model.showValuesProperty, {
      x: 300,
      top: 8
    } );

    this.addChild( this.speedometerNode );

    // Initialize accelerometer node (will be set if on acceleration screen)
    this.accelerometerNode = null;

    // Create and add the control panel (pass dynamic speed description for accessibility announcement)
    this.controlPanel = new MotionControlPanel( model, forcesDescriptionNode.netForceDescriptionProperty, speedDescriptionNode.speedDescriptionProperty, accelerationDescriptionNode.accelerationDescriptionProperty, tandem.createTandem( 'controlPanel' ) );
    this.addChild( this.controlPanel );

    const stopwatchDragBounds = new Bounds2( this.layoutBounds.minX, this.layoutBounds.minY, this.controlPanel.left, 200 );
    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      tandem: tandem.createTandem( 'stopwatchNode' ),
      visibleProperty: model.stopwatch.isVisibleProperty,
      dragBoundsProperty: new Property( stopwatchDragBounds ),
      dragListenerOptions: {
        positionProperty: model.stopwatch.positionProperty
      },
      numberDisplayOptions: {
        textOptions: {
          maxWidth: 80
        }
      },
      keyboardDragListenerOptions: {
        dragSpeed: 300,
        shiftDragSpeed: 20
      }
    } );

    // We want to reset the position to what was explicitly set after the stopwatchNode was created.
    const stopwatchInitialPosition = this.controlPanel.leftTop.plusXY( -stopwatchNode.width, 10 );
    model.stopwatch.positionProperty.setInitialValue( stopwatchInitialPosition );
    model.stopwatch.positionProperty.value = stopwatchInitialPosition;

    // Stopwatch Play Area section with heading, visible only when Stopwatch is checked
    const stopwatchPlayAreaSection = new Node( {
      tagName: 'div',
      accessibleHeading: ForcesAndMotionBasicsFluent.stopwatchStringProperty,
      visibleProperty: model.stopwatch.isVisibleProperty,
      appendDescription: false,
      children: [ stopwatchNode ]
    } );
    this.addChild( stopwatchPlayAreaSection );

    // play, step, and reset buttons in an HBox aligned left bottom under the control panel
    const playPauseVerticalOffset = 35;
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      tandem: tandem.createTandem( 'timeControlNode' ),
      leftCenter: this.controlPanel.leftBottom.plusXY( 0, playPauseVerticalOffset ),
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => { model.manualStep(); }
        }
      }
    } );

    // Reset all button goes beneath the control panel.  Not a closure variable since API access is required.
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();

        this.grabReleaseCueNode.reset();
        this.feedbackManager!.reset();
        resetItemFocusState();
      },
      radius: 23,
      rightCenter: this.controlPanel.rightBottom.plusXY( 0, playPauseVerticalOffset ),
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // i18n - if the play control buttons are too close to reset all, they should be separated
    if ( timeControlNode.right > this.resetAllButton.left - PLAY_PAUSE_BUFFER ) {
      timeControlNode.leftCenter = this.controlPanel.leftBottom.plusXY( -2 * PLAY_PAUSE_BUFFER, playPauseVerticalOffset );
    }

    this.addChild( timeControlNode );
    this.addChild( this.resetAllButton );

    // Add the accelerometer, if on the final screen
    if ( model.accelerometer ) {

      const accelerometerNode = new AccelerometerNode( model.accelerationProperty );

      // build up the string label for the acceleration
      const labelTextStringProperty = new DerivedStringProperty( [
          model.showValuesProperty, pattern0Name1ValueUnitsAccelerationStringProperty, accelerationStringProperty, model.accelerationProperty ],
        ( showValues, pattern0Name1ValueUnitsAccelerationString, accelerationString, acceleration ) => {
          return showValues ?
                 StringUtils.format( pattern0Name1ValueUnitsAccelerationString, accelerationString, StringUtils.toFixedLTR( acceleration, 2 ) ) :
                 accelerationString;
        } );
      const labelText = new RichText( labelTextStringProperty, {
        font: new PhetFont( 18 ),
        supScale: 0.60,
        supYOffset: 2,
        maxWidth: accelerometerNode.width * 3 / 2
      } );

      // create the tick labels
      const tickLabel = ( label: string, tick: Node, tandemID: string ) => new Text( label, {
        pickable: false,
        font: new PhetFont( 16 ),
        centerX: tick.centerX,
        top: tick.bottom + 27
      } );
      const tickLabels = new Node( {
        children: [
          tickLabel( '-20', accelerometerNode.ticks[ 0 ], 'Negative20' ),
          tickLabel( '0', accelerometerNode.ticks[ 2 ], 'Zero' ),
          tickLabel( '20', accelerometerNode.ticks[ 4 ], 'Positive20' )
        ]
      } );

      // put it all together in a VBox
      this.accelerometerNode = new Node( {
        children: [ labelText, accelerometerNode, tickLabels ],
        pickable: false,
        centerX: 300,
        y: 170
      } );
      labelText.bottom = accelerometerNode.top;
      tickLabels.top = accelerometerNode.bottom;
      model.showAccelerationProperty.linkAttribute( this.accelerometerNode, 'visible' );

      this.addChild( this.accelerometerNode );

      // whenever showValues and acceleration changes, update the label text position
      const initialLabelWidth = labelText.width;
      Multilink.multilink( [ model.showValuesProperty, labelTextStringProperty ], showValues => {

        // Make sure that the acceleration readout does not shift as the value changes by compensating for the change
        // in width.
        labelText.centerX = showValues ?
                            accelerometerNode.centerX + ( labelText.width - initialLabelWidth ) / 2 - 40 :
                            accelerometerNode.centerX;
      } );
    }

    // Map the items to their correct toolbox, one of left or right, corresponding to the side of the screen that
    // toolbox is sitting on.
    const getItemSide = ( item: Item ) => {
      // the fridge and the crates both go in hte left toolbox
      if ( item.name === 'fridge' || item.name === 'crate1' || item.name === 'crate2' ) {
        return 'left';
      }
      else {
        return 'right';
      }
    };

    // Iterate over the items in the model and create and add nodes for each one
    const leftItemLayer = new Node();
    const rightItemLayer = new Node();
    this.itemNodes = [];

    const itemsTandem = tandem.createTandem( 'items' );
    for ( let i = 0; i < model.items.length; i++ ) {
      const item = model.items[ i ];
      const itemSide = getItemSide( item );
      const itemLayer = itemSide === 'left' ? leftItemLayer : rightItemLayer;

      const sittingImageProperty = item.sittingImageProperty.value ? item.sittingImageProperty : item.imageProperty;
      const holdingImageProperty = item.holdingImageProperty.value ? item.holdingImageProperty : item.imageProperty;

      const itemNode = item.isBucket ?
                       new WaterBucketNode( model, this, item, item.imageProperty, sittingImageProperty, holdingImageProperty, model.showMassesProperty, itemLayer, itemsTandem.createTandem( item.name + 'Node' ) ) :
                       new ItemNode( model, this, item, item.imageProperty, sittingImageProperty, holdingImageProperty, model.showMassesProperty, itemLayer, itemsTandem.createTandem( item.name + 'Node' ) );

      this.itemNodes.push( itemNode );

      // Provide a reference from the item model to its view so that view dimensions can be looked up easily
      this.itemModelToNodeMap.set( item, itemNode );
      // Don't add to itemLayer yet - will be added to groups
    }

    // Create keyboard navigation groups AFTER items are created
    this.itemToolboxGroup = new ItemToolboxGroupNode( leftItemToolboxNode.bounds, rightItemToolboxNode.bounds );
    this.itemStackGroup = new ItemStackGroupNode( model.screen );

    // A container for the Skateboard/Stack heading, the stack description list, and the items themselves
    const stackSection = new Node( {
      tagName: 'div',
      accessibleHeading: model.skateboard ? ForcesAndMotionBasicsFluent.a11y.objectToolboxes.skateboardStringProperty :
                         ForcesAndMotionBasicsFluent.a11y.objectToolboxes.stackStringProperty
    } );

    // Add the requested list under the heading, before the objects
    const stackDescriptionNode = new MotionStackDescriptionNode( model );
    stackSection.addChild( stackDescriptionNode );
    stackSection.addChild( this.itemStackGroup );

    // Announce stack movement direction changes for accessibility, driven by velocityProperty
    const EPSILON = 1E-6;
    model.velocityProperty.lazyLink( ( velocity, oldVelocity ) => {
      const sign = ( v: number ) => v > EPSILON ? 1 : ( v < -EPSILON ? -1 : 0 );

      // Compute previous sign; if oldVelocity is undefined, treat as no change
      const prev = sign( oldVelocity );
      const curr = sign( velocity );
      if ( curr !== prev ) {
        if ( curr > 0 ) {
          stackSection.addAccessibleContextResponse( ForcesAndMotionBasicsFluent.a11y.motionScreen.stackMovement.stackMovingRightStringProperty.value );
        }
        else if ( curr < 0 ) {
          stackSection.addAccessibleContextResponse( ForcesAndMotionBasicsFluent.a11y.motionScreen.stackMovement.stackMovingLeftStringProperty.value );
        }
        else {
          stackSection.addAccessibleContextResponse( ForcesAndMotionBasicsFluent.a11y.motionScreen.stackMovement.stackStationaryStringProperty.value );
        }
      }
    } );

    // Add all items to toolbox group initially and set up keyboard strategies
    this.itemNodes.forEach( itemNode => {
      this.itemToolboxGroup.addItemNode( itemNode, false );
    } );

    // Add the force arrows & associated readouts in front of the items
    const arrowScale = 0.3;

    // Round the forces so that the sum is correct in the display, see https://github.com/phetsims/forces-and-motion-basics/issues/72 and
    // https://github.com/phetsims/forces-and-motion-basics/issues/74
    const roundedAppliedForceProperty = new DerivedProperty( [ model.appliedForceProperty ], appliedForce => roundSymmetric( appliedForce ) );
    const roundedFrictionForceProperty = new DerivedProperty( [ model.frictionForceProperty ], frictionForce => roundSymmetric( frictionForce ) );

    // Only update the sum force arrow after both friction and applied force changed, so we don't get partial updates, see
    // https://github.com/phetsims/forces-and-motion-basics/issues/83
    const roundedSumProperty = new NumberProperty( roundedAppliedForceProperty.value + roundedFrictionForceProperty.value, {
      tandem: tandem.createTandem( 'roundedSumProperty' ),
      units: newtonsUnit,
      phetioReadOnly: true
    } );

    model.stepEmitter.addListener( () => {
      roundedSumProperty.value = roundedAppliedForceProperty.value + roundedFrictionForceProperty.value;
    } );

    this.sumArrow = new ReadoutArrow( 'sum', sumOfForcesStringProperty, '#96c83c', this.layoutBounds.width / 2, 225, roundedSumProperty, model.showValuesProperty, {
      labelPosition: 'top',
      arrowScale: arrowScale,
      screen: 'motion'
    } );
    this.sumOfForcesNode = new Panel( new Text( sumOfForcesEqualsZeroStringProperty, {
      pickable: false,
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: 125
    } ), {
      xMargin: 4,
      yMargin: 4,
      stroke: null,
      fill: new Color( 'white' ).withAlpha( 0.5 )
    } );

    const sumOfForcesAlignBox = new AlignBox( this.sumOfForcesNode, {
      alignBounds: this.layoutBounds,
      xAlign: 'center',
      y: 195,
      yAlign: 'top'
    } );

    // If the (rounded) sum of forces arrow is zero, then show the text "Sum of Forces = 0", see #76
    new DerivedProperty( [ model.showSumOfForcesProperty, roundedSumProperty ],
      ( showSumOfForces, sumOfForces ) => showSumOfForces && sumOfForces === 0 ).linkAttribute( this.sumOfForcesNode, 'visible' );
    this.appliedForceArrow = new ReadoutArrow( 'applied', appliedForceStringProperty, '#e66e23', this.layoutBounds.width / 2, 280, roundedAppliedForceProperty, model.showValuesProperty, {
      labelPosition: 'side',
      arrowScale: arrowScale
    } );
    this.frictionArrow = new ReadoutArrow( 'friction', frictionForceStringProperty, 'red', this.layoutBounds.width / 2, 280, roundedFrictionForceProperty, model.showValuesProperty, {
      labelPosition: 'side',
      arrowScale: arrowScale
    } );

    // toolboxes and their children should be in front of all above items
    // contain the toolboxes in a parent node so that we can easily change the z-order of each toolbox.  This way
    // items of the right toolbox will not be layered in front of items of left toolbox items
    this.toolboxContainer = new Node( {
      tandem: tandem.createTandem( 'toolboxContainer' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
    this.toolboxContainer.addChild( leftItemToolboxNode );
    this.toolboxContainer.addChild( rightItemToolboxNode );
    this.addChild( this.toolboxContainer );

    // Add keyboard navigation groups to scene graph
    this.addChild( this.itemToolboxGroup );
    this.addChild( stackSection );

    // Allow moveToFront on the individual layers, while still being behind the arrows and readouts
    const itemLayer = new Node( { children: [ leftItemLayer, rightItemLayer ] } );
    this.addChild( itemLayer );

    // add the force arrows, which should be in front of all items and pusher
    this.addChild( this.sumArrow );
    this.addChild( this.appliedForceArrow );
    this.addChild( this.frictionArrow );
    this.addChild( sumOfForcesAlignBox );

    // Keyboard hint: space/enter to grab (mirrors Net Force)
    this.grabReleaseCueNode = new MotionGrabReleaseCueNode( this.itemNodes, this.layoutBounds );
    this.addChild( this.grabReleaseCueNode );

    // Hide hint after first keyboard grab interaction
    this.itemNodes.forEach( itemNode => {
      itemNode.item.modeProperty.link( mode => {
        if ( mode === 'keyboardGrabbedFromToolbox' || mode === 'keyboardGrabbedFromStack' ) {
          this.grabReleaseCueNode.hasInteractedProperty.value = true;
        }
      } );
    } );

    // When a PhET-iO client hides the toolbox, hide any items that are in the toolboxes, and vice versa.
    this.toolboxContainer.visibleProperty.link( visible => {
      this.itemNodes.forEach( itemNode => {
        if ( !itemNode.item.inStackProperty.value && !itemNode.item.userControlledProperty.value ) {
          itemNode.visible = visible;
        }
      } );
    } );

    // Whichever arrow is smaller should be in front (in z-ordering)
    const frictionLargerProperty = new DerivedProperty( [ roundedAppliedForceProperty, roundedFrictionForceProperty ],
      ( roundedAppliedForce, roundedFrictionForce ) => Math.abs( roundedFrictionForce ) > Math.abs( roundedAppliedForce ) );
    frictionLargerProperty.link( frictionLarger => {
      const node = frictionLarger ? this.appliedForceArrow : this.frictionArrow;
      node.moveToFront();
    } );

    // On the motion screens, when the 'Friction' label overlaps the force vector it should be displaced vertically
    Multilink.multilink( [ model.appliedForceProperty, model.frictionForceProperty ], ( appliedForce, frictionForce ) => {
      const sameDirection = ( appliedForce < 0 && frictionForce < 0 ) || ( appliedForce > 0 && frictionForce > 0 );
      this.frictionArrow.overlapsOther = sameDirection;
      this.frictionArrow.labelPosition = sameDirection ? 'bottom' : 'side';

      // the applied force arrow must be updated directly since its label position doesn't change
      this.appliedForceArrow.overlapsOther = sameDirection;
      this.appliedForceArrow.update();
    } );

    model.showForceProperty.linkAttribute( this.appliedForceArrow, 'visible' );
    model.showForceProperty.linkAttribute( this.frictionArrow, 'visible' );
    model.showSumOfForcesProperty.linkAttribute( this.sumArrow, 'visible' );

    // After the view is constructed, move one of the blocks to the top of the stack.
    model.viewInitialized( this );

    // Helper function to perform group transfer logic using unified mode property
    const performGroupTransfer = ( itemNode: ItemNode, focusItem: boolean ) => {
      const mode = itemNode.item.modeProperty.value;
      const isGrabbed = itemNode.item.isGrabbed();

      // Only transfer when item is not being grabbed (to avoid focus loss during interaction)
      if ( !isGrabbed ) {
        if ( mode === 'onStack' ) {

          // Item moved to stack - transfer from toolbox group to stack group
          if ( this.itemToolboxGroup.itemNodes.includes( itemNode ) ) {
            this.itemToolboxGroup.removeItemNode( itemNode );
            this.itemStackGroup.addItemNode( itemNode, model.stackedItems, focusItem );

            // Update PDOM order after transfer
            this.updateItemPDOMOrder();
          }
        }
        else if ( mode === 'inToolbox' ) {

          // Item moved to toolbox - ensure it's in toolbox group and not in stack group
          // Remove from stack group if it's there
          if ( this.itemStackGroup.stackItemNodes.includes( itemNode ) ) {
            this.itemStackGroup.removeItemNode( itemNode );
          }

          // Add to toolbox group if it's not already there
          if ( !this.itemToolboxGroup.itemNodes.includes( itemNode ) ) {
            this.itemToolboxGroup.addItemNode( itemNode, focusItem );
          }

          // Update PDOM order after transfer
          this.updateItemPDOMOrder();
        }
        // Note: Animation modes are handled automatically and don't require group transfers
      }
    };

    // Listen to each item's mode property to transfer between groups
    this.itemNodes.forEach( itemNode => {

      itemNode.item.modeProperty.lazyLink( ( newMode, oldMode ) => {

        if ( newMode === 'onStack' || newMode === 'inToolbox' ) {
          performGroupTransfer( itemNode, itemNode.item.lastInteractionType === 'pdom' );
        }
      } );

      if ( itemNode.item.name === 'crate1' ) {
        performGroupTransfer( itemNode, false );
      }
    } );

    // Listen to model stackedItems changes for proper ordering in stack group
    model.stackedItems.lengthProperty.link( () => {

      // Only re-sort when no items are being grabbed (to avoid focus loss during interaction)
      const anyItemGrabbed = this.itemNodes.some( itemNode => itemNode.item.userControlledProperty.value );
      if ( !anyItemGrabbed ) {

        // Update PDOM after re-sorting
        this.updateItemPDOMOrder();
      }
    } );

    // Keep track of the last focused item in each region, so that we can restore focus to it if the user returns
    // to that group. If that item is no longer in that region, then the first item in that region will be focused.
    // See https://github.com/phetsims/forces-and-motion-basics/issues/464
    let lastFocusedToolboxItem: ItemNode | null = null;
    let lastFocusedStackItem: ItemNode | null = null;

    const resetItemFocusState = (): void => {
      this.itemToolboxGroup.reset();
      this.itemStackGroup.reset();

      const groupedNodes = new Set<ItemNode>( [
        ...this.itemToolboxGroup.itemNodes,
        ...this.itemStackGroup.stackItemNodes
      ] );

      this.itemNodes.forEach( itemNode => {
        if ( !groupedNodes.has( itemNode ) ) {
          itemNode.focusable = false;
        }
      } );

      lastFocusedToolboxItem = this.itemToolboxGroup.itemNodes.find( itemNode => itemNode.focusable ) || null;
      lastFocusedStackItem = this.itemStackGroup.stackItemNodes.find( itemNode => itemNode.focusable ) || null;
    };

    /**
     * When focus changes or when item modes change, update the focusable state of all items.
     * Only items that are not on the same surface as the focused item should be focusable.
     * This prevents keyboard users from tabbing to items that should only be reachable by the arrow keys.
     */
    Multilink.multilinkAny( [
      pdomFocusProperty,
      ...this.itemNodes.map( itemNode => itemNode.item.modeProperty ),
      ...this.itemNodes.map( itemNode => itemNode.visibleProperty )
    ], () => {
      const focus = pdomFocusProperty.value;
      const focusedNode = focus ? focus.trail.lastNode() : null;
      if ( focusedNode && focusedNode instanceof ItemNode ) {
        const focusedNodeState = focusedNode.item.modeProperty.value;

        this.itemNodes.forEach( itemNode => {

          if ( itemNode !== focusedNode ) {
            const state = itemNode.item.modeProperty.value;

            if ( focusedNodeState !== state ) {
              itemNode.focusable = itemNode.visibleProperty.value && itemNode.inputEnabled; // true, but only if visible, since it can be hidden via phet-io
            }

            else if ( focusedNodeState === state ) {
              itemNode.focusable = false;
            }
          }
        } );

        // if more than one itemNode in the toolbox or stack is focusable, then just choose the first one to be focusable
        const focusableToolboxItemNodes = this.itemNodes.filter( itemNode => itemNode.focusable && itemNode.item.modeProperty.value === 'inToolbox' && itemNode.visibleProperty.value && itemNode.inputEnabled );
        if ( focusableToolboxItemNodes.length > 1 ) {
          const preferredItem = lastFocusedToolboxItem && focusableToolboxItemNodes.includes( lastFocusedToolboxItem ) ? lastFocusedToolboxItem : focusableToolboxItemNodes[ 0 ];
          focusableToolboxItemNodes.forEach( itemNode => {
            itemNode.focusable = itemNode === preferredItem;
          } );
        }

        const focusableStackItemNodes = this.itemNodes.filter( itemNode => itemNode.focusable && itemNode.item.modeProperty.value === 'onStack' && itemNode.visibleProperty.value && itemNode.inputEnabled );
        if ( focusableStackItemNodes.length > 1 ) {
          const preferredItem = lastFocusedStackItem && focusableStackItemNodes.includes( lastFocusedStackItem ) ? lastFocusedStackItem : focusableStackItemNodes[ 0 ];
          focusableStackItemNodes.forEach( itemNode => {
            itemNode.focusable = itemNode === preferredItem;
          } );
        }
      }
    } );

    pdomFocusProperty.lazyLink( ( focus, oldFocus ) => {

      if ( oldFocus ) {
        const oldItemNode = oldFocus.trail.lastNode();
        if ( oldItemNode instanceof ItemNode ) {

          if ( oldItemNode.item.modeProperty.value === 'inToolbox' ) {
            lastFocusedToolboxItem = oldItemNode;
          }

          else if ( oldItemNode.item.modeProperty.value === 'onStack' ) {
            lastFocusedStackItem = oldItemNode;
          }
        }
      }
    } );

    // Update PDOM order when items move between regions or change position
    this.itemNodes.forEach( itemNode => {
      itemNode.item.inStackProperty.link( () => this.updateItemPDOMOrder() );
      itemNode.item.positionProperty.link( () => this.updateItemPDOMOrder() );
    } );

    // Initial PDOM order
    this.updateItemPDOMOrder();

    this.pdomPlayAreaNode.pdomOrder = [
      forcesDescriptionNode,
      speedDescriptionNode,
      accelerationDescriptionNode,
      this.itemToolboxGroup,
      stackSection,
      appliedForcePlayAreaControlNode,
      this.appliedForceArrow,
      this.frictionArrow,
      this.sumArrow,
      this.speedometerNode,
      stopwatchPlayAreaSection
    ];

    this.pdomControlAreaNode.pdomOrder = [
      this.controlPanel,
      timeControlNode,
      this.resetAllButton
    ];

    this.model.fallenProperty.lazyLink( fallen => {
      if ( fallen ) {
        this.addAccessibleContextResponse( ForcesAndMotionBasicsFluent.a11y.motionScreen.pusherResponses.fellDownAppliedForceZeroStringProperty.value );
      }
    } );

    // Initialize FeedbackManager for positive feedback
    this.feedbackManager = new FeedbackManager( {
      tandem: tandem.createTandem( 'feedbackManager' ),
      layoutBounds: this.layoutBounds
    } );

    // Register feedback rules based on screen type
    switch( model.screen ) {
      case 'motion':
        motionFeedbackRules.forEach( rule => {
          this.feedbackManager.registerRule( rule );
        } );
        break;
      case 'friction':
        frictionFeedbackRules.forEach( rule => {
          this.feedbackManager.registerRule( rule );
        } );
        break;
      case 'acceleration':
        accelerationFeedbackRules.forEach( rule => {
          this.feedbackManager.registerRule( rule );
        } );
        break;
    }

    // Register common encouragement rules for all screens
    encouragementRules.forEach( rule => {
      this.feedbackManager.registerRule( rule );
    } );

    // Set FeedbackManager parent node
    this.feedbackManager.setParentNode( this );

    // Link model properties to check for feedback triggers
    this.model.stepEmitter.addListener( () => {
      this.feedbackManager.update( this.model );
    } );

    // Reset feedback when reset all is triggered
    this.model.resetAllEmitter.addListener( () => {
      this.feedbackManager.reset();
    } );

    // Initialize Tutorial Overlay
    this.tutorialOverlay = new TutorialOverlayNode( {
      layoutBounds: this.layoutBounds,
      steps: this.getTutorialSteps(),
      onComplete: () => {
        // Enable feedback manager after tutorial completes
        this.feedbackManager.setEnabled( true );
        // Small delay to ensure tutorial is fully hidden before showing feedback
        setTimeout( () => {
          // Show the first feedback immediately, bypassing cooldown checks
          this.feedbackManager.showFirstFeedback( this.model );
        }, 400 );
      }
    } );
    this.addChild( this.tutorialOverlay );

    // Show tutorial after a short delay to allow UI to fully render
    setTimeout( () => {
      // Disable feedback manager before showing tutorial
      this.feedbackManager.setEnabled( false );
      this.tutorialOverlay.restart();
    }, 1500 );
  }

  /**
   * Get tutorial steps based on the current screen
   */
  private getTutorialSteps(): TutorialStep[] {
    switch( this.model.screen ) {
      case 'motion':
        return this.getMotionTutorialSteps();
      case 'friction':
        return this.getFrictionTutorialSteps();
      case 'acceleration':
        return this.getAccelerationTutorialSteps();
      default:
        return [];
    }
  }

  /**
   * Get tutorial steps for Motion screen
   */
  private getMotionTutorialSteps(): TutorialStep[] {
    return [
      {
        target: this.appliedForceControl,
        title: '欢迎使用运动实验室！',
        content: '拖动滑块向右或向左施加推力，观察箱子如何运动。',
        position: 'right'
      },
      {
        target: this.itemToolboxGroup,
        title: '添加物体',
        content: '从工具箱拖动不同物体到滑板上，改变总质量，观察对运动的影响。',
        position: 'top'
      },
      {
        target: this.speedometerNode,
        title: '测量速度',
        content: '速度计显示物体的实时速度，单位是<nobr>m/s</nobr>。',
        position: 'left',
        onShow: () => {
          this.model.showSpeedProperty.value = true;
        },
        onHide: () => {
          this.model.showSpeedProperty.value = false;
        }
      },
      {
        target: this.controlPanel,
        title: '显示数据',
        content: '在控制面板中勾选不同的选项，可以显示力、速度、质量等数值。',
        position: 'left',
        onShow: () => {
          this.model.showValuesProperty.value = true;
        }
        // Keep values visible after tutorial completes
      }
    ];
  }

  /**
   * Get tutorial steps for Friction screen
   */
  private getFrictionTutorialSteps(): TutorialStep[] {
    return [
      {
        target: this.controlPanel,
        title: '欢迎使用摩擦力实验室！',
        content: '在控制面板中调节摩擦力滑块，改变地面的摩擦系数。向右更粗糙，向左更光滑。',
        position: 'left'
      },
      {
        target: this.itemStackGroup,
        title: '观察摩擦力',
        content: '红色箭头显示摩擦力的大小和方向。摩擦力总是阻碍物体的运动。',
        position: 'bottom',
        onShow: () => {
          this.model.showForceProperty.value = true;
        },
        onHide: () => {
          this.model.showForceProperty.value = false;
        }
      },
      {
        target: this.appliedForceControl,
        title: '施加推力',
        content: '尝试施加不同的力，观察静摩擦力如何抵抗你的推力。',
        position: 'right'
      },
      {
        target: this.controlPanel,
        title: '显示数值',
        content: '勾选 "数值" 可以看到摩擦力的具体数值。',
        position: 'left',
        onShow: () => {
          this.model.showValuesProperty.value = true;
        }
        // Keep values visible after tutorial completes
      }
    ];
  }

  /**
   * Get tutorial steps for Acceleration screen
   */
  private getAccelerationTutorialSteps(): TutorialStep[] {
    return [
      {
        target: this.appliedForceControl,
        title: '欢迎使用加速度实验室！',
        content: '拖动滑块施加推力，观察物体的加速度变化。',
        position: 'right'
      },
      {
        target: this.itemToolboxGroup,
        title: '改变质量',
        content: '添加不同质量的物体，观察质量对加速度的影响。',
        position: 'top'
      },
      {
        target: this.speedometerNode,
        title: '观察速度计',
        content: '速度计显示物体的实时速度，单位是<nobr>m/s</nobr>。',
        position: 'left',
        onShow: () => {
          this.model.showSpeedProperty.value = true;
        },
        onHide: () => {
          this.model.showSpeedProperty.value = false;
        }
      },
      {
        target: () => this.accelerometerNode || this.controlPanel,
        title: '观察加速度计',
        content: '加速度计显示物体的实时加速度，单位是<nobr>m/s²</nobr>。',
        position: 'bottom',
        onShow: () => {
          this.model.showAccelerationProperty.value = true;
        },
        onHide: () => {
          this.model.showAccelerationProperty.value = false;
        }
      },
      {
        target: () => {
          // 创建一个临时节点用于框选加速度计+箱子
          const container = new Node();
          // 设置代理边界，覆盖加速度计和箱子
          const accelBounds = this.accelerometerNode ? this.accelerometerNode.globalBounds : null;
          const itemBounds = this.itemStackGroup.globalBounds;

          if ( accelBounds ) {
            Object.defineProperty( container, 'globalBounds', {
              get: () => new Bounds2(
                Math.min( accelBounds.minX, itemBounds.minX ),
                Math.min( accelBounds.minY, itemBounds.minY ),
                Math.max( accelBounds.maxX, itemBounds.maxX ),
                Math.max( accelBounds.maxY, itemBounds.maxY )
              )
            } );
          } else {
            container.globalBounds = itemBounds;
          }

          return container;
        },
        title: '合力与加速度',
        content: '合力越大，加速度越大。这就是牛顿第二定律 F = ma！',
        position: 'bottom',
        onShow: () => {
          this.model.showAccelerationProperty.value = true;
          this.model.showSumOfForcesProperty.value = true;
        },
        onHide: () => {
          this.model.showAccelerationProperty.value = false;
          this.model.showSumOfForcesProperty.value = false;
        }
      },
      {
        target: this.controlPanel,
        title: '显示数据',
        content: '勾选 "加速度" 可以显示加速度数值和加速度计。',
        position: 'left',
        onShow: () => {
          this.model.showAccelerationProperty.value = true;
        }
        // Keep acceleration visible after tutorial completes
      }
    ];
  }

  // Get the height of the objects in the stack (doesn't include skateboard)
  private get stackHeight(): number {
    let sum = 0;
    for ( let i = 0; i < this.model.stackedItems.length; i++ ) {
      const itemNode = this.itemModelToNodeMap.get( this.model.stackedItems.get( i ) );
      affirm( itemNode, 'itemNode should not be null' );
      sum = sum + itemNode.height;
    }
    return sum;
  }

  // Find the top of the stack, so that a new object can be placed on top
  public get topOfStack(): number {
    const n = this.model.skateboard ? 334 : 360;
    return n - this.stackHeight;
  }

  // Get the size of an item's image.  Dependent on the current scale of the image.
  public getSize( item: Item ): { width: number; height: number } {
    // get the current scale for the element and apply it to the image
    const itemNode = this.itemModelToNodeMap.get( item );
    affirm( itemNode, 'itemNode should not be null' );
    const scaledWidth = itemNode.sittingImageNode.width * item.getCurrentScale();
    return { width: scaledWidth, height: itemNode.height };
  }

  public isToolboxContainerVisible(): boolean {
    return this.toolboxContainer.visible;
  }

  // Update PDOM order for toolbox and stack items
  private updateItemPDOMOrder(): void {

    const toolboxItems = this.itemToolboxGroup.itemNodes
      .slice()
      .sort( ( a, b ) => a.centerX - b.centerX );

    const stackItems = this.itemStackGroup.stackItemNodes
      .slice()
      .sort( ( a, b ) => a.top - b.top );

    if ( this.itemToolboxGroup.pdomOrder === null || this.itemToolboxGroup.pdomOrder.length > toolboxItems.length ) {
      this.itemToolboxGroup.pdomOrder = toolboxItems;
      this.itemStackGroup.pdomOrder = stackItems;
    }
    else {
      this.itemStackGroup.pdomOrder = stackItems;
      this.itemToolboxGroup.pdomOrder = toolboxItems;
    }
  }
}

forcesAndMotionBasics.register( 'MotionScreenView', MotionScreenView );
