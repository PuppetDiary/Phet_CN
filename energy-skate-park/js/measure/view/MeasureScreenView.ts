// Copyright 2018-2026, University of Colorado Boulder

/**
 * The ScreenView for the "Measure" Screen.
 * Enhanced with tutorial guidance (4 steps) and positive feedback.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author AI Education Project Team
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FeedbackManager from '../../common/model/FeedbackManager.js';
import EnergySkateParkScreenSummaryContent from '../../common/view/EnergySkateParkScreenSummaryContent.js';
import EnergySkateParkTrackSetScreenView from '../../common/view/EnergySkateParkTrackSetScreenView.js';
import TutorialOverlayNode, { type TutorialStep } from '../../common/view/TutorialOverlayNode.js';
import energySkatePark from '../../energySkatePark.js';
import MeasureModel from '../model/MeasureModel.js';
import InspectedSampleHaloNode from './InspectedSampleHaloNode.js';
import { measureFeedbackRules } from './MeasureFeedbackRules.js';
import SkaterPathSensorNode from './SkaterPathSensorNode.js';



export default class MeasureScreenView extends EnergySkateParkTrackSetScreenView {

  // For layout
  private readonly pathSensor: SkaterPathSensorNode;
  private readonly measureModel: MeasureModel;
  private readonly feedbackManager: FeedbackManager;
  private readonly tutorialOverlay: TutorialOverlayNode;

  public constructor(model: MeasureModel, tandem: Tandem) {

    // parent layer for ComboBox, would use this but it is not available until after super
    const comboBoxParent = new Node();

    super(model, tandem, {
      screenSummaryContent: new EnergySkateParkScreenSummaryContent(model, 'measure'),
      showBarGraph: false,
      showSkaterPath: true,
      controlPanelOptions: {
        visibilityControlsOptions: {
          showStickToTrackCheckbox: true
        },
        gravityControlsOptions: {
          includeGravityComboBox: true
        }
      }
    });
    this.measureModel = model;

    this.addChild(comboBoxParent);

    const inspectedSampleHaloNode = new InspectedSampleHaloNode(model.dataSamples, this.modelViewTransform);
    this.topLayer.addChild(inspectedSampleHaloNode);

    this.pathSensor = new SkaterPathSensorNode(model.dataSamples, model.sensorProbePositionProperty, model.sensorBodyPositionProperty, model.availableModelBoundsProperty, this.modelViewTransform, this.controlPanel, {
      tandem: tandem.createTandem('pathSensor')
    });

    this.topLayer.addChild(this.pathSensor);

    // Insert the path sensor probe into pdomOrder between control points (trackLayer) and referenceHeightLine
    const playAreaOrder = this.pdomPlayAreaNode.pdomOrder!;
    const referenceHeightIndex = playAreaOrder.indexOf(this.referenceHeightLine);
    playAreaOrder.splice(referenceHeightIndex, 0, this.pathSensor);
    this.pdomPlayAreaNode.pdomOrder = playAreaOrder;

    // ── Feedback Manager ──────────────────────────────────────────
    this.feedbackManager = new FeedbackManager({
      tandem: tandem.createTandem('feedbackManager'),
      layoutBounds: this.layoutBounds
    });
    measureFeedbackRules.forEach(rule => this.feedbackManager.registerRule(rule));
    this.feedbackManager.setParentNode(this);
    model.skater.updatedEmitter.addListener(() => { this.feedbackManager.update(model); });
    model.resetEmitter.addListener(() => { this.feedbackManager.reset(); });

    // ── Tutorial Overlay (4 steps) ────────────────────────────────
    this.tutorialOverlay = new TutorialOverlayNode({
      layoutBounds: this.layoutBounds,
      visibleBoundsProperty: this.visibleBoundsProperty,
      steps: this.getMeasureTutorialSteps(),
      onComplete: () => {
        this.feedbackManager.setEnabled(true);
      }
    });
    this.addChild(this.tutorialOverlay);
    // Always show tutorial on every page load
    this.feedbackManager.setEnabled(false);
    setTimeout(() => { this.tutorialOverlay.restart(); }, 2000);
  }

  /**
   * 4-step tutorial for the Measure screen.
   * All targets are real, mounted nodes (no dynamic getters that may return null).
   *
   *  1. Welcome — full-screen intro (no cutout)
   *  2. Pie chart legend — 认识能量类型
   *  3. Path sensor — 使用传感器探针记录数据
   *  4. Control panel — 切换重力星球
   */
  private getMeasureTutorialSteps(): TutorialStep[] {
    return [
      {
        target: null,
        title: '测量屏幕',
        content: '在这里你可以收集滑板运动的数据。\n把滑板拖到轨道高处放开，\n观察它如何运动。',
        position: 'center'
      },
      {
        // Pie chart legend — stable node in top-left; auto-enable pie chart during this step
        target: this.pieChartLegend,
        title: '能量分布图',
        content: '这里实时显示动能、势能和热能的比例。\n把滑板放到轨道上滑行，\n观察三种能量之间如何相互转化。',
        position: 'right',
        onShow: () => {
          const m = (this as any).measureModel;
          if (m && m.pieChartVisibleProperty) {
            m.pieChartVisibleProperty.value = true;
          }
        }
      },
      {
        // Path sensor probe — records energy data at a specific point
        target: this.pathSensor,
        title: '数据传感器',
        content: '拖动传感器探针放置到轨道上，\n可以记录该位置的速度、动能、势能等能量数据。\n点击记录下来的能量点可查看详细信息。',
        position: 'right'
      },
      {
        // Control panel — gravity combo box for switching planets
        target: this.controlPanel,
        title: '切换重力环境',
        content: '通过下拉菜单选择不同的星球环境（月球、木星……），\n观察重力变化对能量分布的影响！',
        position: 'left'
      }
    ];
  }


  /**
   * Custom floating layout for this screen, dependent on available view bounds.
   */
  public override layout(viewBounds: Bounds2): void {
    super.layout(viewBounds);

    // in the measure screen the legend is in the top left of the screen
    this.pieChartLegend.mutate({ top: this.controlPanel.top, left: this.fixedLeft! });

    // position the body relative to the pie chart legend, this sets the origin of the body (top left)
    this.measureModel.sensorBodyPositionProperty.set(this.modelViewTransform.viewToModelXY(this.fixedLeft!, this.pieChartLegend.bottom + 10));
  }
}

energySkatePark.register('MeasureScreenView', MeasureScreenView);