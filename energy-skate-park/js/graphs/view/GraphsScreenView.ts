// Copyright 2018-2026, University of Colorado Boulder

/**
 * View for the graphs screen in Energy Skate Park.
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
import GraphsConstants from '../GraphsConstants.js';
import GraphsModel from '../model/GraphsModel.js';
import EnergyGraphAccordionBox from './EnergyGraphAccordionBox.js';
import { graphsFeedbackRules } from './GraphsFeedbackRules.js';



export default class GraphsScreenView extends EnergySkateParkTrackSetScreenView {

  // For layout
  private readonly graphAccordionBox: EnergyGraphAccordionBox;
  private readonly feedbackManager: FeedbackManager;
  private readonly tutorialOverlay: TutorialOverlayNode;

  public constructor(model: GraphsModel, tandem: Tandem) {

    // parent layer for ComboBox, would use "this" but it is not available until after super
    const comboBoxParent = new Node();

    super(model, tandem, {
      screenSummaryContent: new EnergySkateParkScreenSummaryContent(model, 'graphs'),
      drawSkaterPath: false,
      showBarGraph: false,
      controlPanelOptions: {
        visibilityControlsOptions: {
          showPieChartCheckbox: false,
          showGridCheckbox: false,
          showSpeedCheckbox: true,
          showStickToTrackCheckbox: true
        },
        gravityControlsOptions: {
          includeGravityComboBox: true
        }
      }
    });

    this.addChild(comboBoxParent);

    this.graphAccordionBox = new EnergyGraphAccordionBox(model, this.modelViewTransform, tandem.createTandem('graphAccordionBox'), this);
    this.addToBottomLayer(this.graphAccordionBox);

    // Put graph accordion box before speedometer, see https://github.com/phetsims/energy-skate-park/issues/447
    this.pdomPlayAreaNode.pdomOrder = [
      ...(this.pdomPlayAreaNode.pdomOrder!).filter(node => node !== this.speedometerNode),
      this.graphAccordionBox,
      this.graphAccordionBox.variableSwitch,
      this.graphAccordionBox.eraserButton,
      this.speedometerNode
    ];

    // ── Feedback Manager ──────────────────────────────────────────
    this.feedbackManager = new FeedbackManager({
      tandem: tandem.createTandem('feedbackManager'),
      layoutBounds: this.layoutBounds
    });
    graphsFeedbackRules.forEach(rule => this.feedbackManager.registerRule(rule));
    this.feedbackManager.setParentNode(this);
    model.skater.updatedEmitter.addListener(() => { this.feedbackManager.update(model); });
    model.resetEmitter.addListener(() => { this.feedbackManager.reset(); });

    // ── Tutorial Overlay (4 steps) ────────────────────────────────
    this.tutorialOverlay = new TutorialOverlayNode({
      layoutBounds: this.layoutBounds,
      visibleBoundsProperty: this.visibleBoundsProperty,
      steps: this.getGraphsTutorialSteps(),
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
   * 4-step tutorial for the Graphs screen.
   * All targets must be real, mounted nodes.
   *
   *  1. Welcome — full-screen intro (no cutout)
   *  2. Energy graph accordion box — 观察能量时间曲线
   *  3. Variable switch / eraser on graph — 切换/清除曲线
   *  4. Control panel — 调整重力/速度
   */
  private getGraphsTutorialSteps(): TutorialStep[] {
    return [
      {
        target: null,
        title: '图表屏幕',
        content: '在这里你可以看到能量随时间变化的曲线图。\n把滑板拖到轨道高处放开，\n观察图表的实时变化！',
        position: 'center'
      },
      {
        // Energy graph accordion box (stable node in bottom layer)
        target: this.graphAccordionBox,
        title: '能量时间曲线图',
        content: '这张图实时绘制动能、势能和热能随时间的变化曲线。\n滑板运动时，曲线会实时更新——\n观察总能量是否守恒！',
        position: 'top'
      },
      {
        // Variable switch: use graphAccordionBox.variableSwitch if available, else fall back to graphAccordionBox
        target: () => this.graphAccordionBox.variableSwitch || this.graphAccordionBox,
        title: '切换能量类型',
        content: '通过这个开关可以选择在图表中显示哪种能量：\n· 能量 vs 时间\n· 能量 vs 位置\n对比不同模式下的能量曲线形态！',
        position: 'top'
      },
      {
        target: this.controlPanel,
        title: '控制面板',
        content: '调整重力大小或切换星球环境，\n观察曲线如何随参数变化而改变。\n还可以开启速度表盘实时监测速度！',
        position: 'left'
      }
    ];
  }


  /**
   * Special layout for the energy-skate-park, contents can float to the available bounds.
   */
  public override layout(viewBounds: Bounds2): void {
    super.layout(viewBounds);

    // the graph within the accordion box needs to line up with the right edge of the track and grid lines so that
    // skater positions on track align perfectly with positions along the graph
    this.graphAccordionBox.right = this.modelViewTransform.modelToViewX(5) + this.graphAccordionBox.getContentRight();
    this.graphAccordionBox.top = this.controlPanel.top;

    // special layout for the speedometer in this screen
    this.speedometerNode.left = this.graphAccordionBox.left;
    this.speedometerNode.top = this.modelViewTransform.modelToViewY(GraphsConstants.TRACK_HEIGHT);
  }
}

energySkatePark.register('GraphsScreenView', GraphsScreenView);