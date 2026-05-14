// Copyright 2025, University of Colorado Boulder

/**
 * FeedbackToastNode displays positive feedback messages during gameplay.
 * Supports three types: success (green), discovery (blue), and encouragement (orange).
 *
 * @author AI Education Project Team
 */

import optionize from '../../../../phet-core/js/optionize.js';
import type EmptySelfOptions from '../../../../phet-core/js/types/EmptySelfOptions.js';
import type PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';

export type FeedbackType = 'success' | 'discovery' | 'encouragement';

type SelfOptions = {
  message?: string;
  type?: FeedbackType;
  autoHideDelay?: number; // milliseconds
  position?: 'top' | 'bottom'; // Position preference
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

  public constructor( layoutBounds: Bounds2, providedOptions?: FeedbackToastNodeOptions ) {

    const options = optionize<FeedbackToastNodeOptions, EmptySelfOptions>()( {
      message: '',
      type: 'discovery',
      autoHideDelay: 4500, // 4.5 seconds default
      visible: false,
      opacity: 0,
      position: 'top'
    }, providedOptions );

    super( {
      tandem: Tandem.OPT_OUT,
      visible: options.visible,
      opacity: options.opacity
    } );

    this.defaultAutoHideDelay = options.autoHideDelay;
    this.layoutBounds = layoutBounds;
    this.position = options.position || 'top';

    // Create background
    this.backgroundNode = new Rectangle( 0, 0, 300, 60, {
      fill: FEEDBACK_COLORS.discovery.background,
      stroke: FEEDBACK_COLORS.discovery.border,
      lineWidth: 2,
      cornerRadius: 12
    } );

    // Create icon
    this.iconNode = new Text( FEEDBACK_COLORS.discovery.icon, {
      font: new PhetFont( { size: 24, family: 'Apple Color Emoji, Noto Color Emoji, Segoe UI Emoji' } ),
      fill: 'white'
    } );

    // Create message text
    this.messageNode = new Text( options.message || '', {
      font: new PhetFont( { size: 16, weight: 'normal' } ),
      fill: 'white',
      maxWidth: 240
    } );

    // Content container with icon and message
    this.contentNode = new HBox( {
      children: [ this.iconNode, this.messageNode ],
      spacing: 12,
      align: 'center'
    } );

    // Add children
    this.addChild( this.backgroundNode );
    this.addChild( this.contentNode );

    // Center content in background
    this.contentNode.center = this.backgroundNode.center;

    // Position at top center of layout bounds
    this.updatePosition();
  }

  /**
   * Update the position of the toast (top center or bottom center with margin)
   */
  private updatePosition(): void {
    this.centerX = this.layoutBounds.centerX;

    if ( this.position === 'top' ) {
      this.top = this.layoutBounds.top + 20;
    } else {
      this.bottom = this.layoutBounds.bottom - 20;
    }
  }

  /**
   * Set the position preference
   */
  public setPosition( position: 'top' | 'bottom' ): void {
    this.position = position;
    this.updatePosition();
  }

  /**
   * Show a feedback message
   */
  public show( message: string, type: FeedbackType ): void {
    // Update content
    this.messageNode.string = message;
    this.messageNode.fill = 'white'; // Ensure text color is set
    this.currentType = type;

    // Update colors based on type
    const colors = FEEDBACK_COLORS[ type ];
    this.backgroundNode.fill = colors.background;
    this.backgroundNode.stroke = colors.border;
    this.iconNode.text = colors.icon;
    this.iconNode.fill = 'white'; // Ensure icon color is set

    // Resize background to fit content
    const contentWidth = this.contentNode.width + 40;
    const contentHeight = this.contentNode.height + 30;
    this.backgroundNode.setRectBounds( new Bounds2( 0, 0, contentWidth, contentHeight ) );

    // Recenter content
    this.contentNode.center = this.backgroundNode.center;

    // Show with animation
    this.visible = true;
    this.animateOpacity( 1, 300 );

    // Clear any existing auto-hide timer
    if ( this.autoHideTimer !== null ) {
      clearTimeout( this.autoHideTimer );
    }

    // Set new auto-hide timer
    this.autoHideTimer = setTimeout( () => {
      this.hide();
    }, this.defaultAutoHideDelay );
  }

  /**
   * Hide the toast with fade-out animation
   */
  public hide(): void {
    this.animateOpacity( 0, 300, () => {
      this.visible = false;
    });

    // Clear timer
    if ( this.autoHideTimer !== null ) {
      clearTimeout( this.autoHideTimer );
      this.autoHideTimer = null;
    }
  }

  /**
   * Animate opacity change
   */
  private animateOpacity( targetOpacity: number, duration: number, onComplete?: () => void ): void {
    const startTime = Date.now();
    const startOpacity = this.opacity;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min( elapsed / duration, 1 );

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow( 1 - progress, 3 );
      this.opacity = startOpacity + ( targetOpacity - startOpacity ) * easedProgress;

      if ( progress < 1 ) {
        requestAnimationFrame( animate );
      } else {
        onComplete && onComplete();
      }
    };

    requestAnimationFrame( animate );
  }

  /**
   * Force hide immediately without animation
   */
  public forceHide(): void {
    this.opacity = 0;
    this.visible = false;

    if ( this.autoHideTimer !== null ) {
      clearTimeout( this.autoHideTimer );
      this.autoHideTimer = null;
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if ( this.autoHideTimer !== null ) {
      clearTimeout( this.autoHideTimer );
    }
    super.dispose();
  }
}

forcesAndMotionBasics.register( 'FeedbackToastNode', FeedbackToastNode );
export default FeedbackToastNode;
