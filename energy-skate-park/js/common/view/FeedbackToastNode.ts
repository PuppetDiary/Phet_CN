// Copyright 2025, University of Colorado Boulder

/**
 * FeedbackToastNode displays positive feedback messages during gameplay.
 * Supports three types: success (green), discovery (blue), and encouragement (orange).
 *
 * Ported from forces-and-motion-basics, adapted for energy-skate-park.
 * @author AI Education Project Team
 */

import optionize from '../../../../phet-core/js/optionize.js';
import type EmptySelfOptions from '../../../../phet-core/js/types/EmptySelfOptions.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energySkatePark from '../../energySkatePark.js';

export type FeedbackType = 'success' | 'discovery' | 'encouragement';

type SelfOptions = {
    message?: string;
    type?: FeedbackType;
    autoHideDelay?: number;
    position?: 'top' | 'bottom';
};

export type FeedbackToastNodeOptions = SelfOptions;

/**
 * Color schemes for different feedback types
 */
const FEEDBACK_COLORS = {
    success: {
        background: 'rgba(76, 175, 80, 0.95)',
        border: 'rgba(76, 175, 80, 0.6)',
        icon: '✓'
    },
    discovery: {
        background: 'rgba(33, 150, 243, 0.95)',
        border: 'rgba(33, 150, 243, 0.6)',
        icon: '💡'
    },
    encouragement: {
        background: 'rgba(255, 152, 0, 0.95)',
        border: 'rgba(255, 152, 0, 0.6)',
        icon: '⭐'
    }
};

class FeedbackToastNode extends Node {

    private readonly backgroundNode: Rectangle;
    private readonly iconNode: Text;
    private readonly messageNode: Text;
    private readonly contentNode: HBox;

    private currentType: FeedbackType = 'discovery';
    private autoHideTimer: number | null = null;
    private readonly defaultAutoHideDelay: number;
    private position: 'top' | 'bottom' = 'top';
    private readonly layoutBounds: Bounds2;

    public constructor(layoutBounds: Bounds2, providedOptions?: FeedbackToastNodeOptions) {

        const options = optionize<FeedbackToastNodeOptions, EmptySelfOptions>()({
            message: '',
            type: 'discovery',
            autoHideDelay: 4500,
            visible: false,
            opacity: 0,
            position: 'top'
        }, providedOptions);

        super({
            tandem: Tandem.OPT_OUT,
            visible: options.visible,
            opacity: options.opacity
        });

        this.defaultAutoHideDelay = options.autoHideDelay;
        this.layoutBounds = layoutBounds;
        this.position = options.position || 'top';

        this.backgroundNode = new Rectangle(0, 0, 300, 60, {
            fill: FEEDBACK_COLORS.discovery.background,
            stroke: FEEDBACK_COLORS.discovery.border,
            lineWidth: 2,
            cornerRadius: 12
        });

        this.iconNode = new Text(FEEDBACK_COLORS.discovery.icon, {
            font: new PhetFont({ size: 18, family: 'Apple Color Emoji, Noto Color Emoji, Segoe UI Emoji, sans-serif' }),
            fill: 'white'
        });

        this.messageNode = new Text(options.message || '', {
            font: new PhetFont({ size: 15, weight: 'normal', family: 'PhetFont, sans-serif' }),
            fill: 'white',
            maxWidth: 260
        });

        this.contentNode = new HBox({
            children: [this.iconNode, this.messageNode],
            spacing: 12,
            align: 'center'
        });

        this.addChild(this.backgroundNode);
        this.addChild(this.contentNode);
        this.contentNode.center = this.backgroundNode.center;
        this.updatePosition();
    }

    private updatePosition(): void {
        this.centerX = this.layoutBounds.centerX;
        if (this.position === 'top') {
            this.top = this.layoutBounds.top + 20;
        } else {
            this.bottom = this.layoutBounds.bottom - 20;
        }
    }

    public setPosition(position: 'top' | 'bottom'): void {
        this.position = position;
        this.updatePosition();
    }

    public show(message: string, type: FeedbackType): void {
        this.messageNode.string = message;
        this.messageNode.fill = 'white';
        this.currentType = type;

        const colors = FEEDBACK_COLORS[type];
        this.backgroundNode.fill = colors.background;
        this.backgroundNode.stroke = colors.border;
        this.iconNode.text = colors.icon;
        this.iconNode.fill = 'white';

        const contentWidth = this.contentNode.width + 40;
        const contentHeight = this.contentNode.height + 30;
        this.backgroundNode.setRectBounds(new Bounds2(0, 0, contentWidth, contentHeight));
        this.contentNode.center = this.backgroundNode.center;

        this.visible = true;
        this.animateOpacity(1, 300);

        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer);
        }
        this.autoHideTimer = setTimeout(() => {
            this.hide();
        }, this.defaultAutoHideDelay) as unknown as number;
    }

    public hide(): void {
        this.animateOpacity(0, 300, () => {
            this.visible = false;
        });
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }

    private animateOpacity(targetOpacity: number, duration: number, onComplete?: () => void): void {
        const startTime = Date.now();
        const startOpacity = this.opacity;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            this.opacity = startOpacity + (targetOpacity - startOpacity) * easedProgress;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                onComplete && onComplete();
            }
        };
        requestAnimationFrame(animate);
    }

    public forceHide(): void {
        this.opacity = 0;
        this.visible = false;
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }

    public override dispose(): void {
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer);
        }
        super.dispose();
    }
}

energySkatePark.register('FeedbackToastNode', FeedbackToastNode);
export default FeedbackToastNode;
