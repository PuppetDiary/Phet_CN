// Copyright 2019-2025, University of Colorado Boulder

/**
 * BankPointControllerNode is a Scenery node that is used to control point positions in the "Bank" scene of the Number
 * Line Integers sim
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import MoneyJarDecoration from '../../../../number-line-common/js/explore/model/MoneyJarDecoration.js';
import MoneyJarNode from '../../../../number-line-common/js/explore/view/MoneyJarNode.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import FlowBox from '../../../../scenery/js/layout/nodes/FlowBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import NLIColors from '../../common/NLIColors.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

// constants
const MIN_WIDTH = 48; // screen coords, empirically determined
const MAX_WIDTH = 118; // screen coords, empirically determined
const TOUCH_DILATION = 7; // dilates piggy banks enough to not overlap touch areas with account balance buttons
const READOUT_DISTANCE_FROM_IMAGE = 5;
const COIN_RADIUS = 10;
const COIN_ANIMATION_DURATION = 0.5; // seconds

const balanceAmountStringProperty = NumberLineIntegersStrings.balanceAmountStringProperty;
const currencyUnitsStringProperty = NumberLineIntegersStrings.currencyUnitsStringProperty;
const debtAmountStringProperty = NumberLineIntegersStrings.debtAmountStringProperty;
const moneyAmountStringProperty = NumberLineIntegersStrings.moneyAmountStringProperty;

// constants
const COIN_DEPOSIT_ANIMATION_START_Y = -95; // above the money jar, in screen coordinates, empirically determined
const COIN_DEPOSIT_ANIMATION_END_Y = -60; // inside the money jar, in screen coordinates, empirically determined
const COIN_WITHDRAWAL_ANIMATION_START_Y = 70; // inside the money jar, in screen coordinates, empirically determined
const COIN_WITHDRAWAL_ANIMATION_END_Y = 95; // below the money jar, in screen coordinates, empirically determined
const NUMBER_OF_COINS_TO_PRE_CREATE = 20; // number of coins to create for animation, empirically determined
const COIN_NODE_X_POSITION = 0;

class BankPointControllerNode extends PointControllerNode {

  /**
   * @param {PointController} pointController
   * @param {Emitter} balanceChangedByButtonEmitter
   * @param {MoneyJarDecoration} decorationType - indicates artwork on bank
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, balanceChangedByButtonEmitter, decorationType, options ) {

    assert && assert( !options || !options.node, 'options should not include a node for this constructor' );

    // root node for draggable controller portion, separate for absolute value display and coin animation
    const controllerNode = new Node();

    // Choose the overlay image source, which is artwork that must exactly match the shape of the outline.
    const moneyJarNode = new MoneyJarNode( { decorationType: decorationType } );
    controllerNode.addChild( moneyJarNode );

    // This assumes that numberLinePoints only has one active numberLinePoint at a time. When a point is removed the
    // property will have a value of null.
    const currentNumberLinePointValueProperty = new Property( pointController.numberLinePoints[ 0 ]?.valueProperty || null );

    // {Property<number|null>}
    // As points are added and removed from the numberLine, this DynamicProperty listens to the valueProperty
    // of the active point. There will never be more than one point on the numberLine for this ControllerNode.
    const pointValueProperty = new DynamicProperty( currentNumberLinePointValueProperty );

    pointController.numberLinePoints.addItemAddedListener( point => {
      assert && assert(
        pointController.numberLinePoints.length === 1,
        'BankPointControllerNode should only have one numberLinePoint'
      );
      currentNumberLinePointValueProperty.set( point.valueProperty );
    } );

    // Handle removal of the controlled point from the number line.
    pointController.numberLinePoints.addItemRemovedListener( () => {
      currentNumberLinePointValueProperty.set( null );
    } );

    const moneyAmountNode = new Text( new PatternStringProperty( moneyAmountStringProperty, {
      currencyUnit: currencyUnitsStringProperty,
      value: pointValueProperty
    }, {
      maps: {
        value: value => Math.abs( value )
      }
    } ), {
      font: new PhetFont( 48 ),
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5,
      maxWidth: 100
    } );

    const moneyAmountHBox = new HBox( {
      children: [
        new Text( '-', {
          font: new PhetFont( 48 ),
          fill: 'white',
          stroke: 'black',
          lineWidth: 1.5,
          maxWidth: 12,
          visibleProperty: new DerivedProperty( [ pointValueProperty ], value => value < 0 )
        } ),
        moneyAmountNode
      ]
    } );
    const moneyAmountTextWrapper = new Node( { children: [ moneyAmountHBox ] } );

    controllerNode.addChild( moneyAmountTextWrapper );

    // dilates the touch area for the controllerNode
    controllerNode.touchArea = controllerNode.bounds.dilated( TOUCH_DILATION );

    options = merge( { node: controllerNode }, options );

    super( pointController, options );

    // Add the readout that will display the absolute value in a phrase
    const absoluteValueBalanceVisibleProperty = new BooleanProperty( false );
    const absoluteValueDebtAmountVisibleProperty = new BooleanProperty( false );
    const absoluteValueBalanceTextColorProperty = new ColorProperty( NLIColors.bankAbsoluteValueMoneyTextColor );

    const absoluteValueBalanceText = new Text(
      new PatternStringProperty( balanceAmountStringProperty, {
        value: pointValueProperty
      } ),
      {
        font: new PhetFont( 18 ),
        maxWidth: 250,
        fill: absoluteValueBalanceTextColorProperty,
        visibleProperty: absoluteValueBalanceVisibleProperty
      } );
    const absoluteValueDebtAmountText = new Text(
      new PatternStringProperty( debtAmountStringProperty, { value: pointValueProperty }, {
        maps: {
          value: value => Math.abs( value )
        }
      } ),
      {
        font: new PhetFont( 18 ),
        maxWidth: 250,
        fill: NLIColors.bankAbsoluteValueDebtTextColor,
        visibleProperty: absoluteValueDebtAmountVisibleProperty
      } );

    const absoluteValueFlowBox = new FlowBox( { children: [ absoluteValueBalanceText, absoluteValueDebtAmountText ] } );
    const absoluteValueBackground = new BackgroundNode( absoluteValueFlowBox, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( absoluteValueBackground );

    // Get a reference to the number line (there is only one for this scene).
    const numberLine = pointController.numberLines[ 0 ];

    // Control visibility of the absolute value readout.
    numberLine.showAbsoluteValuesProperty.linkAttribute( absoluteValueBackground, 'visible' );

    // Update the position of the absolute value readout (i.e. the text node that says things like, "balance of $2".
    const updateAbsoluteValueReadoutPosition = () => {
      if ( decorationType === MoneyJarDecoration.FLOWERS ) {
        absoluteValueBackground.centerX = controllerNode.centerX;
        absoluteValueBackground.top = controllerNode.y +
                                      moneyJarNode.height / 2 * controllerNode.getScaleVector().y +
                                      READOUT_DISTANCE_FROM_IMAGE;
      }
      else {
        absoluteValueBackground.centerX = controllerNode.centerX;
        absoluteValueBackground.bottom = controllerNode.y -
                                         moneyJarNode.height / 2 * controllerNode.getScaleVector().y -
                                         READOUT_DISTANCE_FROM_IMAGE;
      }
    };

    // Update the node's appearance as its position changes.
    const valueRange = numberLine.displayedRangeProperty.value;

    // The base width of the money jar node, before scaling. This may change if the money jar artwork changes, and adjustments
    // may have to be made. If other elements are added to the controllerNode that will affect the max or min width of the
    // controllerNode, this will have to be adjusted.
    //https://github.com/phetsims/number-line-integers/issues/125
    const unscaledWidth = moneyJarNode.width;

    // Center labels as user interactions or translations change label/money jar bounds
    ManualConstraint.create( this, [ moneyAmountTextWrapper, moneyJarNode, absoluteValueBackground ], ( textProxy, moneyBoxProxy ) => {
      textProxy.center = moneyBoxProxy.center;
      updateAbsoluteValueReadoutPosition();
    } );
    const updateController = () => {

      if ( pointController.numberLinePoints.length > 0 ) {

        // state checking
        assert && assert(
          pointController.numberLinePoints.length === 1,
          'point controllers in the bank scene should never control multiple points'
        );

        // variables needed to make the updates
        const numberLinePoint = pointController.numberLinePoints.get( 0 );
        const currentBalance = numberLinePoint.valueProperty.value;

        // Scale the size.
        const desiredWidth = MIN_WIDTH + ( Math.abs( currentBalance ) / valueRange.max ) * ( MAX_WIDTH - MIN_WIDTH );
        controllerNode.setScaleMagnitude( desiredWidth / unscaledWidth );

        // Update the color of the point and the node's fill.
        let fill = NLIColors.bankEmptyFillColor;
        if ( currentBalance < 0 ) {
          fill = Color.interpolateRGBA(
            NLIColors.bankLeastNegativeFillColor,
            NLIColors.bankMostNegativeFillColor,
            currentBalance / valueRange.min
          );
        }
        else if ( currentBalance > 0 ) {
          fill = Color.interpolateRGBA(
            NLIColors.bankLeastPositiveFillColor,
            NLIColors.bankMostPositiveFillColor,
            currentBalance / valueRange.max
          );
        }
        moneyJarNode.fill = fill;

        // Update the absolute value readout.
        const value = numberLinePoint.valueProperty.value;
        absoluteValueBalanceVisibleProperty.value = value >= 0;
        absoluteValueDebtAmountVisibleProperty.value = value < 0;

        if ( value >= 0 ) {
          absoluteValueBalanceTextColorProperty.value = value === 0 ? NLIColors.bankZeroFillColor : NLIColors.bankAbsoluteValueMoneyTextColor;
        }
        updateAbsoluteValueReadoutPosition();
      }
    };
    pointController.positionProperty.link( updateController );

    // immediately called so that absolute value texts are positioned correctly
    updateController();

    // Add the layer where the coin animations will occur.
    const coinAnimationLayer = new Node();
    controllerNode.addChild( coinAnimationLayer );

    // Add the coins now so that they don't have to be added on the fly during the animation.
    _.times( NUMBER_OF_COINS_TO_PRE_CREATE, () => {
      coinAnimationLayer.addChild( new CoinNode( { centerX: COIN_NODE_X_POSITION, visible: false } ) );
    } );

    // Add a clipping area so that the coins look like they are going in and out.  This must be manually updated if
    // the artwork for the money jar changes.  Since the clipping area is intended to make the coins visible when
    // they are outside the bank but invisible inside, this must be drawn as a set of two shapes, one inside the
    // other, with the inner one drawn with the opposite winding order.
    const coinClipArea = Shape.rectangle( -100, -150, 200, 300 );
    coinClipArea.moveTo( -20, -69 );
    coinClipArea.lineTo( -20, 78 );
    coinClipArea.lineTo( 20, 78 );
    coinClipArea.lineTo( 20, -69 );
    coinClipArea.close();
    coinAnimationLayer.clipArea = coinClipArea;

    // List of the active animations for coin motions.
    let activeAnimations = [];

    // Watch for when the balance changes due to interaction with the account balance buttons.
    balanceChangedByButtonEmitter.addListener( balanceChange => {
      assert && assert( Math.abs( balanceChange ) === 1, 'balance changes from the button should always be 1 or -1' );
      const isDeposit = balanceChange > 0;

      // Look for a non-visible coin node on the animation layer and only create one if nothing is available.  This
      // way of caching the previously created coin nodes helps to improve performance, see
      // https://github.com/phetsims/number-line-integers/issues/69.
      const coinNodes = coinAnimationLayer.getChildren();
      let coinNode = _.find( coinNodes, testCoinNode => !testCoinNode.visible );
      if ( !coinNode ) {

        // There aren't any invisible, previously created coin nodes available, so add a new one.
        coinNode = new CoinNode( { centerX: COIN_NODE_X_POSITION, visible: false } );
        coinAnimationLayer.addChild( coinNode );
      }

      const startY = isDeposit ? COIN_DEPOSIT_ANIMATION_START_Y : COIN_WITHDRAWAL_ANIMATION_START_Y;
      const endY = isDeposit ? COIN_DEPOSIT_ANIMATION_END_Y : COIN_WITHDRAWAL_ANIMATION_END_Y;
      if ( isDeposit ) {
        coinNode.moveToBack();
      }
      else {
        coinNode.moveToFront();
      }
      coinNode.visible = true;
      const coinMotionAnimation = new Animation( {
        duration: COIN_ANIMATION_DURATION,
        easing: Easing.CUBIC_IN_OUT,
        setValue: value => { coinNode.centerY = value; },
        from: startY,
        to: endY
      } );
      coinMotionAnimation.endedEmitter.addListener( () => {
        activeAnimations = _.without( activeAnimations, coinMotionAnimation );

        // Just hide the coin node so that we can reuse it later if needed.
        coinNode.visible = false;
      } );
      activeAnimations.push( coinMotionAnimation );
      coinMotionAnimation.start();
    } );

    this.visibleProperty.lazyLink( visible => {

      // Cancel any in-progress user interactions when this goes invisible.  This helps to prevent multi-touch issues,
      // see https://github.com/phetsims/number-line-integers/issues/106.
      if ( !visible ) {
        this.interruptSubtreeInput();
      }
    } );
  }
}

class CoinNode extends Circle {

  /**
   * @param {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( { stroke: Color.black, fill: NLIColors.coinColor }, options );
    super( COIN_RADIUS, options );

    // Add the currency marking.
    const currencyText = new Text( currencyUnitsStringProperty, {
      font: new PhetFont( 18 ),
      maxWidth: 15
    } );
    this.addChild( currencyText );

    ManualConstraint.create( this, [ currencyText ], currencyTextProxy => {
      currencyTextProxy.center = Vector2.ZERO;
    } );
  }
}

numberLineIntegers.register( 'BankPointControllerNode', BankPointControllerNode );
export default BankPointControllerNode;