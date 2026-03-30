// Copyright 2025, University of Colorado Boulder

/**
 * GameCardTooltipNode displays a tooltip with game introduction when hovering over a game card on the home screen.
 *
 * @author AI Education Project Team
 */

import optionize from '../../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import type PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import { Path } from '../../../../scenery/js/nodes/Path.js';
import Shape from '../../../../kite/js/Shape.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';

type SelfOptions = {
  title?: string;
  description?: string;
  targetNode?: Node | null;
};

export type GameCardTooltipNodeOptions = SelfOptions;

class GameCardTooltipNode extends Node {

  private readonly backgroundNode: Rectangle;
  private readonly titleNode: RichText;
  private readonly descriptionNode: RichText;
  private readonly arrowNode: Path;
  private readonly contentNode: Node;

  // Animation-related properties
  private targetOpacity: number = 0;
  private animationFrame: number | null = null;

  public constructor( providedOptions?: GameCardTooltipNodeOptions ) {

    const options = optionize<GameCardTooltipNodeOptions, SelfOptions>()( {
      title: '',
      description: '',
      targetNode: null,
      visible: false,
      opacity: 0
    }, providedOptions );

    super( {
      tandem: Tandem.OPT_OUT
    } );

    // Create background with dark theme
    this.backgroundNode = new Rectangle( 0, 0, 280, 120, {
      fill: 'rgba(26, 26, 46, 0.95)',
      stroke: 'rgba(0, 242, 255, 0.3)',
      lineWidth: 1,
      cornerRadius: 8
    } );

    // Create title text
    this.titleNode = new RichText( options.title || '', {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      fill: '#00f2ff',
      maxWidth: 250
    } );

    // Create description text
    this.descriptionNode = new RichText( options.description || '', {
      font: new PhetFont( 13 ),
      fill: '#cbd5e1',
      maxWidth: 250,
      lineSpacing: 6
    } );

    // Create arrow pointer (will be positioned dynamically)
    this.arrowNode = new Path( new Shape(), {
      fill: 'rgba(26, 26, 46, 0.95)',
      stroke: 'rgba(0, 242, 255, 0.3)',
      lineWidth: 1
    } );

    // Content container for title and description
    this.contentNode = new Node( {
      children: [ this.titleNode, this.descriptionNode ]
    } );

    // Add all children
    this.addChild( this.backgroundNode );
    this.addChild( this.contentNode );
    this.addChild( this.arrowNode );

    // Layout content
    this.layoutContent();
  }

  /**
   * Layout the content nodes within the tooltip
   */
  private layoutContent(): void {
    const margin = 15;
    const spacing = 8;

    // Position title
    this.titleNode.leftTop = new Vector2( margin, margin );

    // Position description below title
    this.descriptionNode.leftTop = new Vector2( margin, this.titleNode.bottom + spacing );

    // Resize background to fit content
    const contentWidth = Math.max(
      this.titleNode.width,
      this.descriptionNode.width
    ) + margin * 2;
    const contentHeight = this.descriptionNode.bottom + margin;

    this.backgroundNode.setRectBounds( new Bounds2( 0, 0, contentWidth, contentHeight ) );
  }

  /**
   * Update the tooltip content
   */
  public setContent( title: string, description: string ): void {
    this.titleNode.string = title;
    this.descriptionNode.string = description;
    this.layoutContent();
  }

  /**
   * Position the tooltip relative to a target node, with intelligent boundary detection
   */
  public positionRelativeTo( targetNode: Node, layoutBounds: Bounds2 ): void {
    const targetGlobalBounds = targetNode.globalBounds;
    const tooltipWidth = this.backgroundNode.width;
    const tooltipHeight = this.backgroundNode.height;

    // Default position: above the target node
    let x = targetGlobalBounds.centerX - tooltipWidth / 2;
    let y = targetGlobalBounds.top - tooltipHeight - 10;

    // Adjust horizontal position if it would exceed left or right bounds
    if ( x < 10 ) {
      x = 10;
    } else if ( x + tooltipWidth > layoutBounds.width - 10 ) {
      x = layoutBounds.width - tooltipWidth - 10;
    }

    // Adjust vertical position if it would exceed top bounds
    if ( y < 10 ) {
      // Position below the target instead
      y = targetGlobalBounds.bottom + 15;

      // Update arrow to point up
      this.updateArrow( targetGlobalBounds.centerX - x, y, 'up' );
    } else {
      // Update arrow to point down
      this.updateArrow( targetGlobalBounds.centerX - x, y + tooltipHeight, 'down' );
    }

    // Convert to local coordinates
    const parentPoint = this.parent!.globalToLocalPoint( new Vector2( x, y ) );
    this.setPosition( parentPoint.x, parentPoint.y );
  }

  /**
   * Update the arrow shape and position
   */
  private updateArrow( x: number, y: number, direction: 'up' | 'down' ): void {
    const arrowWidth = 12;
    const arrowHeight = 8;
    const centerX = this.backgroundNode.width / 2;

    let arrowShape: Shape;
    if ( direction === 'down' ) {
      // Arrow at bottom pointing down
      arrowShape = new Shape()
        .moveTo( centerX - arrowWidth / 2, 0 )
        .lineTo( centerX + arrowWidth / 2, 0 )
        .lineTo( centerX, arrowHeight )
        .close();
      this.arrowNode.moveTo( 0, this.backgroundNode.height );
    } else {
      // Arrow at top pointing up
      arrowShape = new Shape()
        .moveTo( centerX - arrowWidth / 2, arrowHeight )
        .lineTo( centerX + arrowWidth / 2, arrowHeight )
        .lineTo( centerX, 0 )
        .close();
      this.arrowNode.moveTo( 0, 0 );
    }

    this.arrowNode.shape = arrowShape;
  }

  /**
   * Show the tooltip with fade-in animation
   */
  public show(): void {
    this.visible = true;
    this.targetOpacity = 1;
    this.startAnimation();
  }

  /**
   * Hide the tooltip with fade-out animation
   */
  public hide(): void {
    this.targetOpacity = 0;
    this.startAnimation();
  }

  /**
   * Start the fade animation
   */
  private startAnimation(): void {
    if ( this.animationFrame !== null ) {
      return; // Animation already in progress
    }

    const animate = () => {
      const diff = this.targetOpacity - this.opacity;
      if ( Math.abs( diff ) < 0.05 ) {
        this.opacity = this.targetOpacity;
        if ( this.targetOpacity === 0 ) {
          this.visible = false;
        }
        this.animationFrame = null;
      } else {
        this.opacity += diff * 0.2; // Smooth easing
        this.animationFrame = requestAnimationFrame( animate );
      }
    };

    this.animationFrame = requestAnimationFrame( animate );
  }
}

forcesAndMotionBasics.register( 'GameCardTooltipNode', GameCardTooltipNode );
export default GameCardTooltipNode;
