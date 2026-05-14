// Copyright 2018-2025, University of Colorado Boulder

/**
 * ScreenView for the Intro Screen of Energy Skate Park.
 * Enhanced with tutorial guidance and positive feedback system.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author AI Education Project Team
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import EnergySkateParkFullTrackSetModel from '../../common/model/EnergySkateParkFullTrackSetModel.js';
import FeedbackManager from '../../common/model/FeedbackManager.js';
import EnergySkateParkScreenSummaryContent from '../../common/view/EnergySkateParkScreenSummaryContent.js';
import EnergySkateParkTrackSetScreenView from '../../common/view/EnergySkateParkTrackSetScreenView.js';
import TutorialOverlayNode, { type TutorialStep } from '../../common/view/TutorialOverlayNode.js';
import energySkatePark from '../../energySkatePark.js';
import { introFeedbackRules } from './IntroFeedbackRules.js';

export default class IntroScreenView extends EnergySkateParkTrackSetScreenView {

  private readonly feedbackManager: FeedbackManager;
  private readonly tutorialOverlay: TutorialOverlayNode;

  public constructor(model: EnergySkateParkFullTrackSetModel, tandem: Tandem) {
    super(model, tandem, {
      screenSummaryContent: new EnergySkateParkScreenSummaryContent(model, 'intro'),
      controlPanelOptions: {
        showMassControls: true,
        gravityControlsOptions: {
          includeGravityNumberControl: false,
          includeGravitySlider: true
        },
        visibilityControlsOptions: {
          showStickToTrackCheckbox: true,
          showSkaterPathCheckbox: true
        }
      }
    });

    // ── Feedback Manager ──────────────────────────────────────────
    this.feedbackManager = new FeedbackManager({
      tandem: tandem.createTandem('feedbackManager'),
      layoutBounds: this.layoutBounds
    });

    // Register all Intro feedback rules
    introFeedbackRules.forEach(rule => this.feedbackManager.registerRule(rule));

    // Mount the toast node to this view
    this.feedbackManager.setParentNode(this);

    // Trigger feedback updates on every skater update
    model.skater.updatedEmitter.addListener(() => {
      this.feedbackManager.update(model);
    });

    // Reset feedback when model resets
    model.resetEmitter.addListener(() => {
      this.feedbackManager.reset();
    });

    // ── Tutorial Overlay ─────────────────────────────────────────
    this.tutorialOverlay = new TutorialOverlayNode({
      layoutBounds: this.layoutBounds,
      visibleBoundsProperty: this.visibleBoundsProperty,
      steps: this.getIntroTutorialSteps(),
      onComplete: () => {
        // Enable feedback after tutorial completes
        this.feedbackManager.setEnabled(true);
        setTimeout(() => {
          this.feedbackManager.showFirstFeedback(model);
        }, 400);
      }
    });
    this.addChild(this.tutorialOverlay);

    // Always show tutorial on every page load
    this.feedbackManager.setEnabled(false);
    setTimeout(() => {
      this.tutorialOverlay.restart();
    }, 2000);
  }

  /**
   * Define the 5-step tutorial for the Intro screen.
   * All target nodes must be real, mounted, and not null to avoid empty highlight boxes.
   *
   *  1. Welcome — 全屏介绍（center, no target）
   *  2. Pie chart legend — 观察能量分布图
   *  3. Control panel — 速度/柱状图指标开关
   *  4. Control panel lower — 调整质量/重力
   *  5. Track & skater — 拖动滑板、试玩轨道
   */
  private getIntroTutorialSteps(): TutorialStep[] {
    return [
      {
        // Step 1: Welcome — full-screen overlay (no target highlight)
        target: null,
        title: '欢迎来到能量滑板公园！',
        content: '这里你可以研究能量转换的规律。\n把滑板拖到轨道高处再放开，\n观察动能、势能、热能\n之间如何相互转换！',
        position: 'center'
      },
      {
        // Step 2: Pie chart legend — auto-enable pieChart so the legend is visible during this step
        target: this.pieChartLegend,
        title: '能量分布图',
        content: '这里实时显示三种能量的比例：\n🔵 动能（运动中的能量）\n🔴 势能（高度带来的能量）\n🟠 热能（摩擦产生的热量）',
        position: 'right',
        onShow: () => {
          // Temporarily enable pie chart so legend becomes visible and meaningful
          const m = (this as any).model;
          if (m && m.pieChartVisibleProperty) {
            m.pieChartVisibleProperty.value = true;
          }
        }
      },
      {
        // Step 3: Visibility controls — speed / pie chart checkboxes
        target: () => this.controlPanel.visibilityControlsNode,
        title: '打开速度与柱状图指标',
        content: '在右侧面板顶部勾选「速度」或「柱状图」，\n屏幕上就会显示速度表盘和能量柱状图，\n实时监测滑板状态！',
        position: 'left',
        onShow: () => {
          // Auto-enable speedometer so user can see the effect
          if ((this as any).model && (this as any).model.speedometerVisibleProperty) {
            (this as any).model.speedometerVisibleProperty.value = true;
          }
        }
      },
      {
        // Step 4: Experiment settings — gravity & mass sliders
        target: () => this.controlPanel.experimentSettingsNode,
        title: '调整重力与质量',
        content: '拖动「重力」和「质量」滑块，\n观察能量曲线和滑板运动如何变化。\n还可以切换星球环境，体验月球或木星的重力！',
        position: 'left'
      },
      {
        // Step 5: Track layer — switch track shape
        target: this.trackLayer,
        title: '切换轨道形状',
        content: '屏幕底部有多种轨道可以选择。\n点击切换轨道形状，每种轨道都会带来不同的能量体验！',
        position: 'top'
      }
    ];
  }
}

energySkatePark.register('IntroScreenView', IntroScreenView);
