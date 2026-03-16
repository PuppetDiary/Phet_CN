// Copyright 2023-2025, University of Colorado Boulder

/**
 * ScreenView for the Projectile Data Lab
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import Field from '../model/Field.js';
import PDLModel from '../model/PDLModel.js';
import { SingleOrContinuous } from '../model/SingleOrContinuous.js';
import PDLColors from '../PDLColors.js';
import PDLConstants from '../PDLConstants.js';
import PDLPreferences from '../PDLPreferences.js';
import FieldNode from './FieldNode.js';
import FieldOverlayNode from './FieldOverlayNode.js';
import FieldSignNode from './FieldSignNode.js';
import HistogramAccordionBox from './HistogramAccordionBox.js';
import LaunchButton from './LaunchButton.js';
import LauncherNode from './LauncherNode.js';
import { PDLLaunchPanel } from './PDLLaunchPanel.js';
import PDLText from './PDLText.js';

type SelfOptions = {
  createLauncherNode: ( modelViewTransform: ModelViewTransform2 ) => LauncherNode;
};
export type PDLScreenViewOptions = SelfOptions & WithRequired<ScreenViewOptions, 'tandem'>;

export default abstract class PDLScreenView<T extends Field> extends ScreenView {

  protected readonly modelViewTransform;

  // These are the bounds of the canvas that the projectile paths are drawn on. It is larger than the layout bounds so that
  // the projectile paths are not clipped if they go beyond the field, and the screen is wider than dev bounds.
  protected readonly canvasBounds: Bounds2;

  protected readonly behindProjectilesLayer = new Node();
  protected readonly projectileLayer = new Node();

  protected readonly launcherNode: LauncherNode;

  protected abstract readonly launchPanel: PDLLaunchPanel;
  protected abstract readonly accordionBox: HistogramAccordionBox;
  protected abstract readonly fieldSignNode: FieldSignNode;

  private readonly bottomUIContainer: HBox;

  protected readonly launchButton: RectangularPushButton;
  protected readonly singleOrContinuousRadioButtonGroup: VerticalAquaRadioButtonGroup<SingleOrContinuous>;
  protected readonly timeControlNode: TimeControlNode;
  protected readonly eraserButton: RectangularPushButton;
  protected readonly resetAllButton: ResetAllButton;

  protected readonly noAirResistanceText: PDLText;
  private readonly eraseResetContainer: HBox;

  protected constructor( model: PDLModel<T>,
                         singleStringProperty: TReadOnlyProperty<string>,
                         continuousStringProperty: TReadOnlyProperty<string>,
                         launchButtonEnabledProperty: TReadOnlyProperty<boolean>,
                         options: PDLScreenViewOptions ) {
    super( options );

    const fieldX = this.layoutBounds.centerX + PDLConstants.FIELD_CENTER_OFFSET_X;
    const fieldY = PDLConstants.FIELD_CENTER_Y;
    const originX = fieldX - 0.5 * PDLConstants.FIELD_WIDTH;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ), new Vector2( originX, fieldY ), PDLConstants.PIXELS_TO_DISTANCE );

    this.launcherNode = options.createLauncherNode( this.modelViewTransform );

    // Expand the canvas bounds so that the projectile paths are not clipped if they go beyond the field
    const canvasMarginRight = this.modelViewTransform.modelToViewDeltaX( PDLConstants.MAX_FIELD_DISTANCE / 2 );
    this.canvasBounds = ScreenView.DEFAULT_LAYOUT_BOUNDS.dilatedX( canvasMarginRight / 2 )
      .shiftedX( canvasMarginRight / 2 );

    const background = new Rectangle( 0, 0, 1, 1 );

    this.visibleBoundsProperty.link( visibleBounds => {
      background.setRect( visibleBounds.left, visibleBounds.top, visibleBounds.width, visibleBounds.height );

      const gradient = new LinearGradient( visibleBounds.centerX, visibleBounds.top, visibleBounds.centerX, visibleBounds.bottom );
      gradient.addColorStop( 0, PDLColors.skyTopColorStopProperty );
      gradient.addColorStop( 1, PDLColors.skyBottomColorStopProperty );
      background.fill = gradient;
    } );

    this.bottomUIContainer = new HBox( {
      spacing: PDLConstants.INTER_PANEL_SPACING,
      bottom: this.layoutBounds.bottom - PDLConstants.SCREEN_VIEW_Y_MARGIN
    } );

    this.noAirResistanceText = new PDLText( ProjectileDataLabStrings.noAirResistanceStringProperty, {
      font: PDLConstants.NO_AIR_RESISTANCE_FONT,
      maxWidth: 160
    } );

    // Create the eraser button
    this.eraserButton = new EraserButton( {
      iconWidth: 28,
      listener: () => model.clearCurrentField(),
      tandem: options.tandem.createTandem( 'eraserButton' ),
      phetioFeatured: true,
      minimumWidth: 100
    } );

    this.resetAllButton = new ResetAllButton( {
      tandem: options.tandem.createTandem( 'resetAllButton' ),
      listener: () => {
        model.reset();
        this.reset();
      },
      phetioFeatured: true
    } );

    this.eraseResetContainer = new HBox( {
      spacing: 15,
      stretch: true,
      children: [ this.eraserButton, this.resetAllButton ]
    } );

    ManualConstraint.create( this, [ this.eraseResetContainer ], eraseResetContainerProxy => {
      eraseResetContainerProxy.right = this.layoutBounds.maxX - PDLConstants.SCREEN_VIEW_X_MARGIN;
      eraseResetContainerProxy.bottom = this.layoutBounds.maxY - PDLConstants.SCREEN_VIEW_Y_MARGIN;
    } );

    const fieldBack = new FieldNode( model.fieldProperty, model.histogram.binWidthProperty, {
      x: fieldX,
      y: fieldY
    } );
    const fieldFront = new FieldNode( model.fieldProperty, model.histogram.binWidthProperty, {
      isBottomHalf: true,
      x: fieldX,
      y: fieldY
    } );
    const fieldOverlayBack = new FieldOverlayNode( this.modelViewTransform, { isLeftSide: false } );
    const fieldOverlayFront = new FieldOverlayNode( this.modelViewTransform, { isLeftSide: true } );
    fieldOverlayBack.x = fieldX;
    fieldOverlayBack.y = fieldY;
    fieldOverlayFront.x = fieldX;
    fieldOverlayFront.y = fieldY;

    // Create the launch button
    this.launchButton = new LaunchButton( model.isContinuousLaunchingProperty,
      model.singleOrContinuousProperty, () => model.launchButtonPressed(), {
        left: this.layoutBounds.centerX + PDLConstants.FIELD_CENTER_OFFSET_X - 0.45 * PDLConstants.FIELD_WIDTH,
        bottom: this.layoutBounds.maxY - PDLConstants.SCREEN_VIEW_Y_MARGIN,
        tandem: options.tandem.createTandem( 'launchButton' ),
        phetioEnabledPropertyInstrumented: false,
        enabledProperty: DerivedProperty.or( [ launchButtonEnabledProperty, PDLPreferences.autoGenerateDataProperty ] ),
        innerContent: 'Launch'
      } );

    Multilink.multilink( [ model.isContinuousLaunchingProperty, model.singleOrContinuousProperty ], ( isContinuousLaunching, singleOrContinuous ) => {
      this.launchButton.innerContent = singleOrContinuous === 'single' ? 'Launch' :
                                       isContinuousLaunching ? 'Stop Launching' : 'Start Launching';
    } );

    const radioButtonLabelMaxWidth = 110;
    const singleOrContinuousRadioButtonGroupTandem = options.tandem.createTandem( 'singleOrContinuousRadioButtonGroup' );

    this.singleOrContinuousRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.singleOrContinuousProperty, [ {
      value: 'single' as const,
      createNode: () => new PDLText( singleStringProperty, {
        font: PDLConstants.LAUNCH_MODE_FONT,
        maxWidth: radioButtonLabelMaxWidth
      } ),
      tandemName: 'singleLaunchRadioButton'
    }, {
      value: 'continuous' as const,
      createNode: () => new PDLText( continuousStringProperty, {
        font: PDLConstants.LAUNCH_MODE_FONT,
        maxWidth: radioButtonLabelMaxWidth
      } ),
      tandemName: 'continuousLaunchRadioButton'
    } ], {
      left: this.launchButton.right + 15,
      centerY: this.launchButton.centerY,
      spacing: 10,
      visibleProperty: new GatedVisibleProperty( DerivedProperty.not( PDLPreferences.autoGenerateDataProperty ), singleOrContinuousRadioButtonGroupTandem ),
      tandem: singleOrContinuousRadioButtonGroupTandem,
      phetioFeatured: true,
      radioButtonOptions: {
        radius: 8
      }
    } );

    const timeControlNodeTandem = options.tandem.createTandem( 'timeControlNode' );

    this.timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      tandem: timeControlNodeTandem,
      visibleProperty: new GatedVisibleProperty( DerivedProperty.not( PDLPreferences.autoGenerateDataProperty ), timeControlNodeTandem ),
      phetioFeatured: true,
      playPauseStepButtonOptions: {
        includeStepForwardButton: false
      },
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: model.timeSpeedValues,
      flowBoxSpacing: 18,
      speedRadioButtonGroupOptions: {
        labelOptions: {
          maxWidth: 75
        }
      },
      layoutOptions: {
        topMargin: PDLConstants.TIME_CONTROL_MARGIN_TOP
      }
    } );

    this.addChild( background );
    this.addChild( fieldBack );
    this.addChild( fieldOverlayBack );
    this.addChild( this.behindProjectilesLayer );
    this.addChild( this.projectileLayer );
    this.addChild( this.launcherNode );
    this.addChild( fieldFront );
    this.addChild( fieldOverlayFront );
    this.addChild( this.launchButton );
    this.addChild( this.singleOrContinuousRadioButtonGroup );
    this.addChild( this.noAirResistanceText );
    this.addChild( this.eraseResetContainer );
  }

  /**
   * Floating layout that keeps the ground near the ground, and accordion box near the question bar
   */
  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds, {
      verticalAlign: 'bottom'
    } );
  }

  protected positionFieldSignNode(): void {
    ManualConstraint.create( this, [ this.fieldSignNode ], fieldSignNodeProxy => {

      // The feet of the field sign should roughly be halfway between the dotted line and the back of the field. So this
      // is the distance above the center line in model units
      fieldSignNodeProxy.bottom = this.modelViewTransform.modelToViewY( 1.4 );

      // The field sign is right aligned with the top right corner of the field
      fieldSignNodeProxy.right = this.modelViewTransform.modelToViewX( PDLConstants.MAX_FIELD_DISTANCE );
    } );
  }

  /**
   * Resets the view.
   */
  protected reset(): void {
    this.accordionBox.reset();
  }
}

projectileDataLab.register( 'PDLScreenView', PDLScreenView );