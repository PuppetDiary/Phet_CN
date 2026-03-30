// Copyright 2025, University of Colorado Boulder

/**
 * TutorialOverlayNode provides step-by-step interactive tutorials for first-time users.
 * Features:
 * - Four-panel cutout backdrop (target area remains clearly visible)
 * - Highlight border box around target elements
 * - Content box with title, description, progress dots
 * - Previous/Next/Skip navigation buttons (TextPushButton-style, stable Chinese rendering)
 * - Intelligent boundary detection for content positioning
 *
 * Ported from forces-and-motion-basics, adapted for energy-skate-park.
 * @author AI Education Project Team
 */

import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import energySkatePark from '../../energySkatePark.js';
import type TProperty from '../../../../axon/js/TProperty.js';

/**
 * Tutorial step data structure
 */
export interface TutorialStep {
    /**
     * Node to highlight, a getter, or null for a full-screen (no-cutout) overlay.
     */
    target: Node | (() => Node | null) | null;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    onShow?: () => void;
    onHide?: () => void;
}

type SelfOptions = {
    steps?: TutorialStep[];
    onComplete?: () => void;
    layoutBounds?: Bounds2;
    // Optional: when provided, the backdrop will dynamically track the actual visible screen area
    visibleBoundsProperty?: TProperty<Bounds2>;
};

export type TutorialOverlayNodeOptions = SelfOptions;

class TutorialOverlayNode extends Node {

    // Full-screen semi-transparent backdrop (covers entire screen)
    private readonly backdrop: Rectangle;

    // Orange highlight border around the target (rendered above backdrop)
    private readonly highlightBox: Rectangle;

    private readonly contentBox: Node;
    private readonly titleText: Text;
    private readonly contentText: RichText;
    private readonly previousButton: TextPushButton;
    private readonly nextButton: TextPushButton;
    private readonly completeButton: TextPushButton;
    private readonly skipButton: TextPushButton;
    private readonly buttonContainer: HBox;
    private readonly progressContainer: HBox;
    private readonly contentBackground: Rectangle;
    private readonly contentVBox: VBox;
    private readonly verticalPadding: number = 18;

    private steps: TutorialStep[];
    private currentStepIndex: number = 0;
    private onCompleteCallback?: () => void;
    private layoutBounds: Bounds2;

    private readonly highlightPadding: number = 10;
    private readonly contentBoxWidth: number = 340;

    public constructor(providedOptions?: TutorialOverlayNodeOptions) {

        const options = optionize<TutorialOverlayNodeOptions, EmptySelfOptions>()({
            steps: [],
            onComplete: undefined,
            layoutBounds: new Bounds2(0, 0, 1024, 618)
        }, providedOptions);

        super({
            tandem: Tandem.OPT_OUT,
            pickable: true
        });

        this.steps = options.steps!;
        this.onCompleteCallback = options.onComplete;
        this.layoutBounds = options.layoutBounds!;

        // Full-screen semi-transparent backdrop: use an oversized rectangle so it covers
        // the entire viewport including floating panels on wider screens.
        const MASK_EXTENT = 10000;
        this.backdrop = new Rectangle(-MASK_EXTENT, -MASK_EXTENT, MASK_EXTENT * 2, MASK_EXTENT * 2, {
            fill: 'rgba(0, 0, 0, 0.72)',
            pickable: true
        });
        this.addChild(this.backdrop);

        // Note: visibleBoundsProperty is accepted but no longer used for backdrop sizing
        // (kept in options for API compatibility)

        // Highlight border box rendered above the backdrop
        this.highlightBox = new Rectangle(0, 0, 100, 100, {
            stroke: '#f0a500',
            lineWidth: 3,
            cornerRadius: 8,
            fill: 'rgba(0, 0, 0, 0)', // transparent interior — target remains fully visible
            pickable: false
        });
        this.highlightBox.visible = false;
        this.addChild(this.highlightBox);

        // ── Content card ─────────────────────────────────────────────
        const contentBackground = new Rectangle(0, 0, this.contentBoxWidth, 160, {
            fill: 'rgba(255, 255, 255, 0.98)',
            stroke: 'rgba(0, 150, 199, 0.25)',
            lineWidth: 1.5,
            cornerRadius: 16
        });

        this.titleText = new Text('', {
            font: new PhetFont({ size: 17, weight: 'bold' }),
            fill: '#1a365d',
            maxWidth: this.contentBoxWidth - 36
        });

        this.contentText = new RichText('', {
            font: new PhetFont(13.5),
            fill: '#4a5568',
            align: 'left',
            lineWrap: this.contentBoxWidth - 36,
            maxWidth: this.contentBoxWidth - 36
        });

        // ── Buttons — use TextPushButton for reliable Chinese rendering ──
        this.previousButton = new TextPushButton('上一步', {
            font: new PhetFont({ size: 13 }),
            baseColor: 'rgba(100, 116, 139, 0.15)',
            textFill: '#64748b',
            xMargin: 14,
            yMargin: 7,
            cornerRadius: 14,
            tandem: Tandem.OPT_OUT,
            cursor: 'pointer',
            listener: () => this.previousStep()
        });

        this.nextButton = new TextPushButton('下一步', {
            font: new PhetFont({ size: 14, weight: 'bold' }),
            baseColor: '#0096c7',
            textFill: 'white',
            xMargin: 18,
            yMargin: 9,
            cornerRadius: 16,
            tandem: Tandem.OPT_OUT,
            cursor: 'pointer',
            listener: () => this.nextStep()
        });

        this.completeButton = new TextPushButton('完成', {
            font: new PhetFont({ size: 14, weight: 'bold' }),
            baseColor: '#0096c7',
            textFill: 'white',
            xMargin: 18,
            yMargin: 9,
            cornerRadius: 16,
            tandem: Tandem.OPT_OUT,
            cursor: 'pointer',
            listener: () => this.complete()
        });
        this.completeButton.visible = false;

        this.skipButton = new TextPushButton('跳过', {
            font: new PhetFont({ size: 13 }),
            baseColor: 'rgba(100, 116, 139, 0.15)',
            textFill: '#64748b',
            xMargin: 14,
            yMargin: 7,
            cornerRadius: 14,
            tandem: Tandem.OPT_OUT,
            cursor: 'pointer',
            listener: () => this.complete()
        });

        this.buttonContainer = new HBox({
            children: [this.previousButton, this.skipButton, this.nextButton, this.completeButton],
            spacing: 10,
            align: 'center'
        });

        // ── Progress dots ─────────────────────────────────────────────
        this.progressContainer = new HBox({
            children: [],
            spacing: 7,
            align: 'center'
        });

        const textContainer = new VBox({
            children: [this.titleText, this.contentText],
            spacing: 10,
            align: 'left',
            stretch: false,
            maxWidth: this.contentBoxWidth - 40
        });

        this.contentVBox = new VBox({
            children: [textContainer, this.progressContainer, this.buttonContainer],
            spacing: 16,
            align: 'center',
            stretch: false
        });

        this.contentBox = new Node({
            children: [contentBackground, this.contentVBox]
        });
        this.contentBackground = contentBackground;

        const horizontalPadding = 20;
        this.contentVBox.leftTop = new Vector2(horizontalPadding, this.verticalPadding);
        this.refreshContentBoxSize();

        this.addChild(this.contentBox);

        this.visible = false;
    }

    /**
     * Show a specific step by index.
     */
    private showStep(index: number): void {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }
        if (!this.parent) {
            return;
        }

        // Call onHide for the previous step
        if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
            const prevStep = this.steps[this.currentStepIndex];
            if (prevStep.onHide) {
                prevStep.onHide();
            }
        }

        this.currentStepIndex = index;
        const step = this.steps[index];
        const target = typeof step.target === 'function' ? step.target() : step.target;

        if (target) {
            this.positionHighlightBox(target);
            this.positionContentBox(target, step.position || 'bottom');
        } else {
            // No target: full-screen backdrop, no highlight cutout, center the dialog
            this.highlightBox.visible = false;
            this.contentBox.center = this.layoutBounds.center;
        }

        this.titleText.string = step.title;
        this.contentText.string = step.content;

        const isFirstStep = index === 0;
        const isLastStep = index === this.steps.length - 1;

        this.previousButton.visible = !isFirstStep;
        // Last step: show "完成" button, hide "下一步" and "跳过"
        this.nextButton.visible = !isLastStep;
        this.completeButton.visible = isLastStep;
        this.skipButton.visible = !isLastStep;

        // Update progress dots
        this.updateProgressDots();

        // Resize background to fit content (buttons may have changed visibility)
        this.refreshContentBoxSize();

        if (step.onShow) {
            step.onShow();
        }
    }

    /**
     * Recalculate and apply the content card's background size.
     * Must be called after any change that mutates button visibility.
     */
    private refreshContentBoxSize(): void {
        const newHeight = this.contentVBox.height + this.verticalPadding * 2;
        this.contentBackground.setRectBounds(new Bounds2(0, 0, this.contentBoxWidth, newHeight));
    }

    /**
     * Build progress dots matching the number of steps.
     */
    private updateProgressDots(): void {
        const dots: Circle[] = [];
        for (let i = 0; i < this.steps.length; i++) {
            dots.push(new Circle(i === this.currentStepIndex ? 5 : 3.5, {
                fill: i === this.currentStepIndex ? '#0096c7' : 'rgba(0, 150, 199, 0.35)'
            }));
        }
        this.progressContainer.children = dots;
    }

    /**
     * Position the highlight box around a target node.
     * Uses parent.globalToLocalPoint — exactly as forces-and-motion-basics does.
     */
    private positionHighlightBox(target: Node): void {
        const targetBounds = target.globalBounds;
        const parent = this.parent!;

        // Convert global bounds to local coordinates using parent.globalToLocalPoint
        const topLeft = parent.globalToLocalPoint(new Vector2(targetBounds.minX, targetBounds.minY));
        const bottomRight = parent.globalToLocalPoint(new Vector2(targetBounds.maxX, targetBounds.maxY));

        this.highlightBox.setRectBounds(new Bounds2(
            topLeft.x - this.highlightPadding,
            topLeft.y - this.highlightPadding,
            bottomRight.x + this.highlightPadding,
            bottomRight.y + this.highlightPadding
        ));

        this.highlightBox.visible = true;
    }

    /**
     * Position the content box relative to a target node.
     * Exactly mirrors forces-and-motion-basics implementation using parent.globalToLocalPoint.
     */
    private positionContentBox(target: Node, preferredPosition: string): void {
        const targetBounds = target.globalBounds;
        const parent = this.parent!;
        const contentWidth = this.contentBoxWidth;
        const contentHeight = this.contentBox.height;

        // Get screen/layout bounds for boundary checking
        const layoutWidth = this.layoutBounds.width;
        const layoutHeight = this.layoutBounds.height;
        const padding = 40;

        let x: number;
        let y: number;

        // For center position, just center in the layout bounds
        if (preferredPosition === 'center') {
            x = (layoutWidth - contentWidth) / 2;
            y = (layoutHeight - contentHeight) / 2;
        } else {
            // Calculate position based on preferred direction
            switch (preferredPosition) {
                case 'top':
                    x = targetBounds.centerX - contentWidth / 2;
                    y = targetBounds.minY - contentHeight - padding;
                    break;

                case 'bottom':
                    x = targetBounds.centerX - contentWidth / 2;
                    y = targetBounds.maxY + padding;
                    break;

                case 'left':
                    x = targetBounds.minX - contentWidth - padding;
                    y = targetBounds.centerY - contentHeight / 2;
                    break;

                case 'right':
                    x = targetBounds.maxX + padding;
                    y = targetBounds.centerY - contentHeight / 2;
                    break;

                default:
                    x = targetBounds.centerX - contentWidth / 2;
                    y = targetBounds.maxY + padding;
            }

            // Boundary checks - ensure the content box stays within screen
            x = Math.max(padding, Math.min(x, layoutWidth - contentWidth - padding));
            y = Math.max(padding, Math.min(y, layoutHeight - contentHeight - padding));
        }

        // Convert global coordinates to local coordinates and position
        const localPoint = parent.globalToLocalPoint(new Vector2(x, y));
        this.contentBox.x = localPoint.x;
        this.contentBox.y = localPoint.y;
    }


    private nextStep(): void {
        this.showStep(this.currentStepIndex + 1);
    }

    private previousStep(): void {
        if (this.currentStepIndex > 0) {
            this.showStep(this.currentStepIndex - 1);
        }
    }

    private complete(): void {
        if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
            const currentStep = this.steps[this.currentStepIndex];
            if (currentStep.onHide) {
                currentStep.onHide();
            }
        }
        this.visible = false;
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    public markAsSeen(storageKey: string): void {
        localStorage.setItem(storageKey, 'true');
    }

    public restart(): void {
        this.currentStepIndex = 0;
        this.visible = true;
        const attemptShow = () => {
            if (this.parent) {
                this.showStep(0);
            } else {
                setTimeout(attemptShow, 50);
            }
        };
        setTimeout(attemptShow, 100);
    }

    public setSteps(steps: TutorialStep[]): void {
        this.steps = steps;
        if (steps.length > 0 && this.visible) {
            this.showStep(0);
        }
    }
}

energySkatePark.register('TutorialOverlayNode', TutorialOverlayNode);
export default TutorialOverlayNode;
