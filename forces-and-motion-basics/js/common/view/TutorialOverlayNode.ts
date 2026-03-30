// Copyright 2025, University of Colorado Boulder

/**
 * TutorialOverlayNode provides step-by-step interactive tutorials for first-time users.
 * Features:
 * - Semi-transparent backdrop
 * - Highlight box for target elements
 * - Content box with title and description
 * - Previous/Next/Skip navigation buttons
 * - Intelligent boundary detection for content positioning
 *
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
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';

/**
 * Tutorial step data structure
 */
export interface TutorialStep {
  target: Node | (() => Node | null);
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  onShow?: () => void;  // Called when this step is shown
  onHide?: () => void;  // Called when this step is hidden (moving to next or completing)
}

type SelfOptions = {
  steps?: TutorialStep[];
  onComplete?: () => void;
  layoutBounds?: Bounds2;
};

export type TutorialOverlayNodeOptions = SelfOptions;

class TutorialOverlayNode extends Node {

  private readonly backdrop: Rectangle;
  private readonly highlightBox: Rectangle;
  private readonly contentBox: Node;
  private readonly titleText: Text;
  private readonly contentText: RichText;
  private readonly previousButton: RoundPushButton;
  private readonly previousButtonText: Text;
  private readonly nextButton: RoundPushButton;
  private readonly nextButtonText: Text;
  private readonly skipButton: RoundPushButton;
  private readonly buttonContainer: Node;

  private steps: TutorialStep[];
  private currentStepIndex: number = 0;
  private onCompleteCallback?: () => void;
  private layoutBounds: Bounds2;

  private readonly highlightPadding: number = 8;
  private readonly contentBoxWidth: number = 320;

  public constructor( providedOptions?: TutorialOverlayNodeOptions ) {

    const options = optionize<TutorialOverlayNodeOptions, EmptySelfOptions>()( {
      steps: [],
      onComplete: null,
      layoutBounds: Bounds2.EVERYTHING
    }, providedOptions );

    super( {
      tandem: Tandem.OPT_OUT,
      pickable: true // Allow clicks to pass through to backdrop
    } );

    this.steps = options.steps!; // Has default value [], so always defined
    this.onCompleteCallback = options.onComplete;
    this.layoutBounds = options.layoutBounds!;

    // Create semi-transparent backdrop
    this.backdrop = new Rectangle( 0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: 'rgba(0, 0, 0, 0.7)',
      pickable: true // Capture clicks on backdrop
    } );
    this.addChild( this.backdrop );

    // Create highlight box (will be positioned dynamically) with improved design
    this.highlightBox = new Rectangle( 0, 0, 100, 100, {
      stroke: 'rgba(0, 150, 199, 0.8)',
      lineWidth: 3,
      cornerRadius: 10,
      pickable: false
    } );
    this.highlightBox.visible = false; // Hidden until positioned
    this.addChild( this.highlightBox );

    // Create content box with improved design
    const contentBackground = new Rectangle( 0, 0, this.contentBoxWidth, 150, {
      fill: 'rgba(255, 255, 255, 0.98)',
      stroke: 'rgba(0, 150, 199, 0.3)',
      lineWidth: 1,
      cornerRadius: 16
    } );

    // Title text with improved styling
    this.titleText = new Text( '', {
      font: new PhetFont( { size: 18, weight: 'bold' } ),
      fill: '#1a365d',
      maxWidth: this.contentBoxWidth - 30
    } );

    // Content text - use RichText for proper word wrapping (14px as requested)
    this.contentText = new RichText( '', {
      font: new PhetFont( 14 ),
      fill: '#4a5568',
      align: 'left',
      lineWrap: this.contentBoxWidth - 30, // Use lineWrap for text wrapping
      maxWidth: this.contentBoxWidth - 30
    } );

    // Previous button with improved styling
    this.previousButtonText = new Text( '上一步', {
      font: new PhetFont( { size: 13 } ),
      fill: '#64748b'
    } );
    this.previousButton = new RoundPushButton( {
      content: this.previousButtonText,
      baseColor: 'transparent',
      listener: () => this.previousStep(),
      tandem: Tandem.OPT_OUT,
      cursor: 'pointer'
    } );

    // Next button with PhET blue color
    this.nextButtonText = new Text( '下一步', {
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      fill: 'white'
    } );
    this.nextButton = new RoundPushButton( {
      content: this.nextButtonText,
      baseColor: '#0096c7', // PhET blue
      listener: () => this.nextStep(),
      tandem: Tandem.OPT_OUT,
      cursor: 'pointer'
    } );

    // Skip button
    this.skipButton = new RoundPushButton( {
      content: new Text( '跳过', {
        font: new PhetFont( { size: 13 } ),
        fill: '#64748b'
      } ),
      baseColor: 'transparent',
      listener: () => this.complete(),
      tandem: Tandem.OPT_OUT,
      cursor: 'pointer'
    } );

    // Button container - centered horizontally
    this.buttonContainer = new HBox( {
      children: [ this.previousButton, this.skipButton, this.nextButton ],
      spacing: 12,
      align: 'center'
    } );

    // Content container (title + text) - left aligned, fixed width
    const textContainer = new VBox( {
      children: [ this.titleText, this.contentText ],
      spacing: 12,
      align: 'left',
      stretch: false,
      maxWidth: this.contentBoxWidth - 40 // Fixed width for proper centering
    } );

    // Main content box container - text left aligned, buttons centered
    const contentVBox = new VBox( {
      children: [ textContainer, this.buttonContainer ],
      spacing: 20,
      align: 'center',
      stretch: false
    } );

    this.contentBox = new Node( {
      children: [ contentBackground, contentVBox ]
    } );

    // Position content in background with proper padding
    const horizontalPadding = 20;
    const verticalPadding = 20;
    contentVBox.leftTop = new Vector2( horizontalPadding, verticalPadding );
    contentBackground.setRectBounds( new Bounds2( 0, 0, this.contentBoxWidth, contentVBox.height + verticalPadding * 2 ) );

    this.addChild( this.contentBox );

    // Add click listener to backdrop to advance
    this.backdrop.addInputListener( {
      click: () => this.nextStep()
    } );

    // Don't show tutorial immediately - wait for restart() to be called
    // This ensures the node has been added to the parent before positioning
    this.visible = false;
  }

  /**
   * Show a specific tutorial step
   */
  private showStep( index: number ): void {
    if ( index >= this.steps.length ) {
      this.complete();
      return;
    }

    // Check if node has been added to parent yet
    if ( !this.parent ) {
      // Not ready yet, will be called again after added to parent
      return;
    }

    // Call onHide for previous step if exists
    if ( this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length ) {
      const prevStep = this.steps[ this.currentStepIndex ];
      if ( prevStep.onHide ) {
        prevStep.onHide();
      }
    }

    this.currentStepIndex = index;
    const step = this.steps[ index ];

    // Get target node
    const target = typeof step.target === 'function' ? step.target() : step.target;

    if ( target ) {
      // Position highlight box around target
      this.positionHighlightBox( target );

      // Position content box
      this.positionContentBox( target, step.position || 'bottom' );
    } else {
      // No target, center content
      this.highlightBox.visible = false;
      this.contentBox.center = this.layoutBounds.center;
    }

    // Update content
    this.titleText.string = step.title;
    this.contentText.string = step.content;

    // Update button visibility and enabled state
    const isFirstStep = index === 0;
    const isLastStep = index === this.steps.length - 1;

    // Previous button - hidden on first step
    this.previousButton.visible = !isFirstStep;
    this.previousButton.enabled = !isFirstStep;

    // Next button - always visible
    this.nextButton.visible = true;

    // Skip button - hidden on last step
    this.skipButton.visible = !isLastStep;

    // Update button text for last step
    if ( isLastStep ) {
      this.nextButtonText.string = '完成';
    } else {
      this.nextButtonText.string = '下一步';
    }

    // Buttons are now automatically centered by VBox layout

    // Call onShow for current step after positioning
    if ( step.onShow ) {
      step.onShow();
    }
  }

  /**
   * Position the highlight box around a target node
   */
  private positionHighlightBox( target: Node ): void {
    const targetBounds = target.globalBounds;
    const parent = this.parent!;

    // Convert global bounds to local coordinates using globalToLocalPoint
    const topLeft = parent.globalToLocalPoint( new Vector2( targetBounds.minX, targetBounds.minY ) );
    const bottomRight = parent.globalToLocalPoint( new Vector2( targetBounds.maxX, targetBounds.maxY ) );

    this.highlightBox.setRectBounds( new Bounds2(
      topLeft.x - this.highlightPadding,
      topLeft.y - this.highlightPadding,
      bottomRight.x + this.highlightPadding,
      bottomRight.y + this.highlightPadding
    ) );

    this.highlightBox.visible = true;
  }

  /**
   * Position the content box relative to a target node with intelligent boundary detection
   */
  private positionContentBox( target: Node, preferredPosition: string ): void {
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
    if ( preferredPosition === 'center' ) {
      x = ( layoutWidth - contentWidth ) / 2;
      y = ( layoutHeight - contentHeight ) / 2;
    } else {
      // Calculate position based on preferred direction
      switch ( preferredPosition ) {
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
      x = Math.max( padding, Math.min( x, layoutWidth - contentWidth - padding ) );
      y = Math.max( padding, Math.min( y, layoutHeight - contentHeight - padding ) );
    }

    // Convert global coordinates to local coordinates and position
    const localPoint = parent.globalToLocalPoint( new Vector2( x, y ) );
    this.contentBox.x = localPoint.x;
    this.contentBox.y = localPoint.y;
  }

  /**
   * Advance to the next step
   */
  private nextStep(): void {
    this.showStep( this.currentStepIndex + 1 );
  }

  /**
   * Go back to the previous step
   */
  private previousStep(): void {
    if ( this.currentStepIndex > 0 ) {
      this.showStep( this.currentStepIndex - 1 );
    }
  }

  /**
   * Complete the tutorial
   */
  private complete(): void {
    // Call onHide for current step before completing
    if ( this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length ) {
      const currentStep = this.steps[ this.currentStepIndex ];
      if ( currentStep.onHide ) {
        currentStep.onHide();
      }
    }

    this.visible = false;
    if ( this.onCompleteCallback ) {
      this.onCompleteCallback();
    }
  }

  /**
   * Mark tutorial as seen in local storage
   */
  public markAsSeen( storageKey: string ): void {
    localStorage.setItem( storageKey, 'true' );
  }

  /**
   * Restart the tutorial from the beginning
   */
  public restart(): void {
    this.currentStepIndex = 0;
    this.visible = true;

    // Use setTimeout to ensure node has been added to parent before positioning
    // Also retry if parent is not available yet
    const attemptShow = () => {
      if ( this.parent ) {
        this.showStep( 0 );
      } else {
        setTimeout( attemptShow, 50 );
      }
    };

    setTimeout( attemptShow, 100 );
  }

  /**
   * Update steps dynamically
   */
  public setSteps( steps: TutorialStep[] ): void {
    this.steps = steps;
    if ( steps.length > 0 && this.visible ) {
      this.showStep( 0 );
    }
  }
}

forcesAndMotionBasics.register( 'TutorialOverlayNode', TutorialOverlayNode );
export default TutorialOverlayNode;
