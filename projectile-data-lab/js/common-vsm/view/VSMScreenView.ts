// Copyright 2023-2025, University of Colorado Boulder

/**
 * ScreenView for the Variability, Sources and Measures (VSM) screens on the Projectile Data Lab sim.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLPreferences from '../../common/PDLPreferences.js';
import PDLQueryParameters from '../../common/PDLQueryParameters.js';
import FieldSignNode from '../../common/view/FieldSignNode.js';
import HistogramAccordionBox, { histogramAccordionBoxTandemName } from '../../common/view/HistogramAccordionBox.js';
import HistogramNode from '../../common/view/HistogramNode.js';
import PDLScreenView, { PDLScreenViewOptions } from '../../common/view/PDLScreenView.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import VSMField from '../model/VSMField.js';
import VSMModel from '../model/VSMModel.js';
import AngleToolNode from './AngleToolNode.js';
import FieldRadioButtonGroup from './FieldRadioButtonGroup.js';
import InteractiveToolPanel from './InteractiveToolPanel.js';
import PDLStopwatchNode from './PDLStopwatchNode.js';
import ProjectileSelectorNode from './ProjectileSelectorNode.js';
import SpeedToolNode from './SpeedToolNode.js';
import StaticToolPanel from './StaticToolPanel.js';
import VSMCanvasNode from './VSMCanvasNode.js';
import VSMFieldSignNode from './VSMFieldSignNode.js';
import VSMLaunchPanel from './VSMLaunchPanel.js';

type SelfOptions = EmptySelfOptions;
export type VSMScreenViewOptions = SelfOptions & PDLScreenViewOptions;

export default abstract class VSMScreenView<T extends VSMField> extends PDLScreenView<T> {
  private readonly fieldRadioButtonGroup: FieldRadioButtonGroup<T>;
  protected readonly accordionBox: HistogramAccordionBox;
  protected readonly fieldSignNode: FieldSignNode;
  protected readonly toolsLayer: Node = new Node();
  private readonly projectileSelectorNode: ProjectileSelectorNode;
  private readonly topRightUIContainer: VBox;
  private readonly measuringTapeNode: MeasuringTapeNode;
  private readonly stopwatchNode: StopwatchNode;

  protected constructor( model: VSMModel<T>,
                         protected readonly launchPanel: VSMLaunchPanel,
                         staticToolPanel: StaticToolPanel,
                         interactiveToolPanel: InteractiveToolPanel,
                         // Closure that creates the HistogramNode. We need to access 'this' to be the combo box parent
                         // hence must create it lazily.
                         createHistogramNode: ( node: Node ) => HistogramNode,
                         providedOptions: VSMScreenViewOptions ) {

    const options = optionize<VSMScreenViewOptions, SelfOptions, PDLScreenViewOptions>()( {}, providedOptions );

    const launchButtonEnabledProperty = new DerivedProperty( [ model.totalProjectileCountProperty ],
      totalProjectileCount => {
        return totalProjectileCount < PDLQueryParameters.maxProjectilesVSMField;
      } );

    super(
      model,
      ProjectileDataLabStrings.singleStringProperty,
      ProjectileDataLabStrings.continuousStringProperty,
      launchButtonEnabledProperty,
      options
    );

    const originPosition = this.modelViewTransform.modelToViewPosition( Vector2.ZERO );

    const projectileCanvas = new VSMCanvasNode( model.fieldProperty, model.isPathsVisibleProperty,
      this.modelViewTransform, {
        canvasBounds: this.canvasBounds
      } );
    this.projectileLayer.addChild( projectileCanvas );

    this.accordionBox = new HistogramAccordionBox(
      createHistogramNode( this ), {
        top: PDLConstants.SCREEN_VIEW_Y_MARGIN,
        left: launchPanel.right + PDLConstants.INTER_PANEL_SPACING,
        tandem: options.tandem.createTandem( histogramAccordionBoxTandemName )
      } );

    this.topRightUIContainer = new VBox( {
      stretch: true,
      right: this.layoutBounds.right - PDLConstants.SCREEN_VIEW_X_MARGIN,
      top: this.layoutBounds.top + PDLConstants.SCREEN_VIEW_Y_MARGIN,
      spacing: PDLConstants.INTER_PANEL_SPACING,
      children: [ staticToolPanel, interactiveToolPanel, this.timeControlNode ],
      preferredWidth: this.layoutBounds.right - this.accordionBox.right - PDLConstants.INTER_PANEL_SPACING - PDLConstants.SCREEN_VIEW_X_MARGIN
    } );

    this.projectileSelectorNode = new ProjectileSelectorNode(
      model.fieldProperty,
      model.selectedProjectileNumberProperty,
      model.totalProjectileCountProperty,
      model.numberOfLandedProjectilesProperty,
      model.selectedProjectileProperty, {
        tandem: options.tandem.createTandem( 'projectileSelectorNode' ),
        visiblePropertyOptions: {
          phetioFeatured: true
        },
        enabledPropertyOptions: {
          phetioFeatured: false
        }
      }
    );

    // tools

    this.measuringTapeNode = new MeasuringTapeNode( new Property( { name: 'm', multiplier: 1 } ), {
      visibleProperty: model.isMeasuringTapeVisibleProperty,
      modelViewTransform: this.modelViewTransform,
      dragBounds: new Bounds2(
        0, 0, 100, this.modelViewTransform.modelToViewY( PDLConstants.SCREEN_VIEW_Y_MARGIN ) ),
      basePositionProperty: model.measuringTapeBasePositionProperty,
      tipPositionProperty: model.measuringTapeTipPositionProperty,
      lineColor: new Color( 255, 255, 50 ),
      crosshairLineWidth: 1.8,
      tapeLineWidth: 1.8,
      isBaseCrosshairRotating: false,
      isTipCrosshairRotating: false,
      textColor: 'black',
      textBackgroundColor: 'white',
      textBackgroundCornerRadius: 5,
      textBackgroundXMargin: 3,
      textBackgroundYMargin: 2,
      textPosition: new Vector2( 0, -50 ),
      textMaxWidth: 80,
      significantFigures: 1,
      textFont: PDLConstants.MEASURING_TAPE_FONT,
      tandem: options.tandem.createTandem( 'measuringTapeNode' ),
      phetioDocumentation: 'The node for the measuring tape',
      phetioFeatured: true,
      phetioFeaturedMeasuredDistanceProperty: true
    } );

    const dragBoundsProperty = new Property( new Bounds2( 0, 0, 100, 100 ) );

    // Allow the measuring tape to be dragged within the visible bounds of the screen, so that outliers can be measured.
    this.visibleBoundsProperty.link( visibleBounds => {
      const viewBounds = visibleBounds.erodedXY( PDLConstants.SCREEN_VIEW_X_MARGIN, PDLConstants.SCREEN_VIEW_Y_MARGIN );
      const modelBounds = this.modelViewTransform.viewToModelBounds( viewBounds );

      // Don't allow dragging left of x=0, or below y=0
      this.measuringTapeNode.setDragBounds( new Bounds2( 0, 0, modelBounds.maxX, modelBounds.maxY ) );

      dragBoundsProperty.value = viewBounds;
    } );

    const stopwatchNodeTandem = options.tandem.createTandem( 'stopwatchNode' );
    this.stopwatchNode = new PDLStopwatchNode( model.stopwatch, () => model.launchProjectile(), {
      isIcon: false,
      tandem: stopwatchNodeTandem,
      dragBoundsProperty: dragBoundsProperty,
      launchButtonEnabledProperty: launchButtonEnabledProperty
    } );

    const isLauncherRaisedProperty = new DerivedProperty( [ model.launcherHeightProperty ], height => height > 0 );

    // Create the heat map tools
    const speedToolNode = new SpeedToolNode(
      model.latestLaunchSpeedProperty,
      isLauncherRaisedProperty, {
        visibleProperty: model.isLaunchSpeedVisibleProperty,
        x: originPosition.x, y: originPosition.y
      } );

    const angleToolNode = new AngleToolNode(
      model.latestLaunchAngleProperty,
      isLauncherRaisedProperty, {
        visibleProperty: model.isLaunchAngleVisibleProperty,
        x: originPosition.x, y: originPosition.y
      } );

    model.fields.forEach( field => {

      // When one projectile is launched, update the heat map tools
      field.projectileLaunchedEmitter.addListener( projectile => {
        if ( model.fieldProperty.value === field ) {

          speedToolNode.updateHeatMapWithData( projectile.launchSpeed );
          angleToolNode.updateHeatMapWithData( projectile.launchAngle );

          // When launching many projectiles at once in the auto-generate mode, suppress the individual launch animations
          // to improve performance
          if ( !PDLPreferences.autoGenerateDataProperty.value ) {
            this.launcherNode.playLaunchAnimation( projectile.launchAngle );
          }
        }
      } );

      // If the projectiles are cleared, clear the heat map tools
      field.projectilesClearedEmitter.addListener( () => {
        speedToolNode.clear();
        angleToolNode.clear();
      } );
    } );

    const syncHeatMapToolNodes = () => {

      // Sets to initial conditions (remains at initial conditions if there are no projectiles)
      speedToolNode.clear();
      angleToolNode.clear();

      const projectiles = model.fieldProperty.value.getAllProjectiles();
      projectiles.forEach( projectile => {
        speedToolNode.updateHeatMapWithData( projectile.launchSpeed );
        angleToolNode.updateHeatMapWithData( projectile.launchAngle );
      } );
    };

    // When the field changes, restore the entire state of the heat maps.
    model.fieldProperty.link( syncHeatMapToolNodes );

    phetioStateSetEmitter.addListener( syncHeatMapToolNodes );

    model.launcherHeightProperty.link( launcherHeight => {
      const launcherY = this.modelViewTransform.modelToViewY( launcherHeight );
      speedToolNode.y = launcherY;
      angleToolNode.y = launcherY;
    } );

    this.fieldRadioButtonGroup = new FieldRadioButtonGroup( model.fieldProperty, model.fields, {
      tandem: options.tandem.createTandem( 'fieldRadioButtonGroup' )
    } );

    this.fieldSignNode = new VSMFieldSignNode(
      model.fields,
      model.fieldProperty,
      this.projectileSelectorNode
    );

    this.positionFieldSignNode();

    this.behindProjectilesLayer.addChild( this.fieldSignNode );

    this.toolsLayer.addChild( angleToolNode );
    this.toolsLayer.addChild( speedToolNode );
    this.toolsLayer.addChild( this.measuringTapeNode );
    this.toolsLayer.addChild( this.stopwatchNode );

    this.addChild( this.fieldRadioButtonGroup );
    this.addChild( this.accordionBox );
    this.addChild( this.launchPanel );
    this.addChild( this.topRightUIContainer );
    this.addChild( this.toolsLayer );

    // Position the field selector radio button group
    this.fieldRadioButtonGroup.bottom = this.layoutBounds.bottom - PDLConstants.SCREEN_VIEW_Y_MARGIN - 5;
    this.fieldRadioButtonGroup.left = this.layoutBounds.centerX - 60;

    model.totalProjectileCountProperty.link( totalProjectileCount => {

      // If it is the last projectile, set isContinuousLaunching to false, so that:
      // * pressing clear won't resume launching
      // * the icon will show as a launch icon rather than a stop icon
      if ( totalProjectileCount === PDLQueryParameters.maxProjectilesVSMField ) {
        model.isContinuousLaunchingProperty.value = false;
      }
    } );

    // Allow the top content to go above the dev bounds, but not too far
    this.visibleBoundsProperty.link( visibleBounds => {
      const minY = PDLConstants.ABOVE_DEV_BOUNDS_TOP;
      const topY = Math.max( visibleBounds.top, minY );
      this.launchPanel.top = topY + PDLConstants.SCREEN_VIEW_Y_MARGIN;
      this.accordionBox.top = topY + PDLConstants.SCREEN_VIEW_Y_MARGIN;
      this.topRightUIContainer.top = topY + PDLConstants.SCREEN_VIEW_Y_MARGIN;
    } );

    // Position the 'No air resistance' text
    // NOTE: This is duplicated in VSMScreenView and SamplingScreenView, so if you change it here, make sure to change it there too
    ManualConstraint.create( this, [ this.noAirResistanceText, this.launchPanel ], ( noAirResistanceTextProxy, launchPanelProxy ) => {
      // TODO: Replace isFinite() check with better support for Panel with invisible content, https://github.com/phetsims/projectile-data-lab/issues/363
      if ( launchPanelProxy.bounds.isFinite() ) {
        noAirResistanceTextProxy.centerX = launchPanelProxy.centerX;
        noAirResistanceTextProxy.top = launchPanelProxy.bottom + 6;
      }
    } );

    // Keyboard order
    this.setVSMPDOMOrder( staticToolPanel, interactiveToolPanel );
  }

  protected override reset(): void {
    super.reset();

    this.accordionBox.reset();
  }

  /**
   * Set the keyboard order for the VSM screen.
   */
  protected setVSMPDOMOrder(
    staticToolPanel: StaticToolPanel,
    interactiveToolPanel: InteractiveToolPanel,
    intervalToolNode?: Node ): void {

    this.pdomPlayAreaNode.pdomOrder = [

      // Experiment setup
      this.launchPanel,

      // Launch controls
      this.launchButton,
      this.singleOrContinuousRadioButtonGroup,

      // Play area tools
      this.measuringTapeNode,
      this.stopwatchNode,

      // Field sign
      this.fieldSignNode,

      // Histogram
      this.accordionBox,

      // Field management
      this.fieldRadioButtonGroup,

      // Erase
      this.eraserButton,

      ...( intervalToolNode ? [ intervalToolNode ] : [] )
    ];

    this.pdomControlAreaNode.pdomOrder = [

      // Global tools
      staticToolPanel,
      interactiveToolPanel,

      this.timeControlNode,

      // Reset all
      this.resetAllButton
    ];
  }
}

projectileDataLab.register( 'VSMScreenView', VSMScreenView );