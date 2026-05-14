// Copyright 2025, University of Colorado Boulder

/**
 * FeedbackManager manages positive feedback messages during gameplay.
 * Features:
 * - Rule-based feedback triggering
 * - Multi-layer cooldown mechanism (rule-level, global, type-based)
 * - Priority-based rule selection
 * - Integration with FeedbackToastNode for display
 *
 * @author AI Education Project Team
 */

import Multilink from '../../../../axon/js/Multilink.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import FeedbackToastNode, { FeedbackType } from '../view/FeedbackToastNode.js';

/**
 * Feedback rule interface
 */
export interface FeedbackRule {
  id: string;
  check: ( model: any ) => boolean;
  message: string | ( ( model: any ) => string );
  type: FeedbackType;
  priority: number;
}

type FeedbackManagerOptions = {
  tandem: Tandem;
  layoutBounds: Bounds2;
};

/**
 * Type-specific cooldown durations (in milliseconds)
 */
const TYPE_COOLDOWNS: Record<FeedbackType, number> = {
  success: 5000,      // 5 seconds for success messages
  discovery: 4000,   // 4 seconds for discovery messages
  encouragement: 8000 // 8 seconds for encouragement messages
};

class FeedbackManager extends PhetioObject {

  // Registered feedback rules
  private feedbackRules: FeedbackRule[] = [];

  // Track triggered rules to prevent duplicates
  private triggeredRules: Set<string> = new Set();

  // Global cooldown tracking
  private lastFeedbackTime: number = 0;
  private readonly GLOBAL_COOLDOWN: number = 3000; // 3 seconds

  // Type-specific cooldown tracking
  private typeCooldowns: Map<FeedbackType, number> = new Map();

  // Toast node for displaying feedback
  private feedbackToast: FeedbackToastNode;

  // Whether the manager is enabled
  public readonly enabledProperty: BooleanProperty;

  // Parent node for adding the toast
  private parentNode: Node | null = null;

  public constructor( providedOptions: FeedbackManagerOptions ) {

    super( {
      tandem: providedOptions.tandem,
      phetioType: IOType.ObjectIO,
      phetioState: false
    } );

    this.feedbackToast = new FeedbackToastNode( providedOptions.layoutBounds );
    this.enabledProperty = new BooleanProperty( true, {
      tandem: providedOptions.tandem.createTandem( 'enabledProperty' ),
      phetioFeatured: true
    } );
  }

  /**
   * Set the parent node for the feedback toast
   */
  public setParentNode( node: Node ): void {
    this.parentNode = node;
    if ( !node.hasChild( this.feedbackToast ) ) {
      node.addChild( this.feedbackToast );
    }
  }

  /**
   * Register a feedback rule
   */
  public registerRule( rule: FeedbackRule ): void {
    // Check if rule already exists
    const existingIndex = this.feedbackRules.findIndex( r => r.id === rule.id );
    if ( existingIndex === -1 ) {
      this.feedbackRules.push( rule );
      // Sort by priority (higher priority first)
      this.feedbackRules.sort( ( a, b ) => b.priority - a.priority );
    }
  }

  /**
   * Unregister a feedback rule
   */
  public unregisterRule( ruleId: string ): void {
    this.feedbackRules = this.feedbackRules.filter( r => r.id !== ruleId );
    this.triggeredRules.delete( ruleId );
  }

  /**
   * Check if feedback can be shown based on all cooldown mechanisms
   */
  private canShowFeedback( rule: FeedbackRule ): boolean {
    // Check if manager is enabled
    if ( !this.enabledProperty.value ) {
      return false;
    }

    // Check if rule was already triggered
    if ( this.triggeredRules.has( rule.id ) ) {
      return false;
    }

    const now = Date.now();

    // Check global cooldown
    if ( now - this.lastFeedbackTime < this.GLOBAL_COOLDOWN ) {
      return false;
    }

    // Check type-specific cooldown
    const lastTypeTime = this.typeCooldowns.get( rule.type ) || 0;
    const typeCooldown = TYPE_COOLDOWNS[ rule.type ];
    if ( now - lastTypeTime < typeCooldown ) {
      return false;
    }

    return true;
  }

  /**
   * Show feedback message
   */
  public showFeedback( rule: FeedbackRule, model?: any ): void {
    if ( !this.canShowFeedback( rule ) ) {
      return;
    }

    // Get message (supports dynamic messages)
    const message = typeof rule.message === 'function'
      ? rule.message( model )
      : rule.message;

    // Show the toast
    this.feedbackToast.show( message, rule.type );

    // Update tracking
    this.triggeredRules.add( rule.id );
    this.lastFeedbackTime = Date.now();
    this.typeCooldowns.set( rule.type, Date.now() );
  }

  /**
   * Update feedback based on current model state
   * Called during each frame or when model changes
   */
  public update( model: any ): void {
    if ( !this.enabledProperty.value ) {
      return;
    }

    // Filter and sort rules
    const availableRules = this.feedbackRules
      .filter( rule => !this.triggeredRules.has( rule.id ) )
      .filter( rule => rule.check( model ) )
      .sort( ( a, b ) => b.priority - a.priority );

    // Trigger the highest priority rule that can be shown
    for ( const rule of availableRules ) {
      if ( this.canShowFeedback( rule ) ) {
        this.showFeedback( rule, model );
        break; // Only show one feedback per update
      }
    }
  }

  /**
   * Reset all tracking state
   */
  public reset(): void {
    this.triggeredRules.clear();
    this.typeCooldowns.clear();
    this.lastFeedbackTime = 0;
    this.feedbackToast.forceHide();
  }

  /**
   * Reset only cooldown timers, keeping triggered rules
   * Use this when you want to allow immediate feedback after disabling/re-enabling
   */
  public resetCooldowns(): void {
    this.typeCooldowns.clear();
    this.lastFeedbackTime = 0;
  }

  /**
   * Reset a specific rule (allow it to trigger again)
   */
  public resetRule( ruleId: string ): void {
    this.triggeredRules.delete( ruleId );
  }

  /**
   * Check if a specific rule has been triggered
   */
  public hasTriggered( ruleId: string ): boolean {
    return this.triggeredRules.has( ruleId );
  }

  /**
   * Get the number of triggered rules
   */
  public getTriggeredCount(): number {
    return this.triggeredRules.size;
  }

  /**
   * Get the number of registered rules
   */
  public getRuleCount(): number {
    return this.feedbackRules.length;
  }

  /**
   * Enable or disable the feedback manager
   */
  public setEnabled( enabled: boolean ): void {
    this.enabledProperty.value = enabled;
    if ( !enabled ) {
      this.feedbackToast.forceHide();
    }
  }

  /**
   * Show the first matching feedback immediately, bypassing cooldown checks
   * Use this when you want to force display a message after enabling the manager
   */
  public showFirstFeedback( model?: any ): void {
    if ( !this.enabledProperty.value ) {
      return;
    }

    // Clear triggered rules to ensure we can show a message after tutorial
    this.triggeredRules.clear();

    // Find the highest priority rule that matches and hasn't been triggered
    const availableRules = this.feedbackRules
      .filter( rule => !this.triggeredRules.has( rule.id ) )
      .filter( rule => !model || rule.check( model ) )
      .sort( ( a, b ) => b.priority - a.priority );

    if ( availableRules.length > 0 ) {
      const rule = availableRules[ 0 ];

      // Get message
      const message = typeof rule.message === 'function'
        ? rule.message( model )
        : rule.message;

      // Show the toast directly, bypassing canShowFeedback
      this.feedbackToast.show( message, rule.type );

      // Update tracking
      this.triggeredRules.add( rule.id );
      this.lastFeedbackTime = Date.now();
      this.typeCooldowns.set( rule.type, Date.now() );
    }
  }

  /**
   * Set the position of the feedback toast
   */
  public setToastPosition( position: 'top' | 'bottom' ): void {
    this.feedbackToast.setPosition( position );
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.feedbackToast.dispose();
    this.enabledProperty.dispose();
    super.dispose();
  }

  /**
   * PhET-iO methods
   */
  public static readonly FeedbackManagerIO = new IOType<FeedbackManager, FeedbackManager>( 'FeedbackManagerIO', {
    valueType: FeedbackManager,
    methods: {
      reset: {
        returnType: VoidIO,
        parameterTypes: [],
        implementation: this.reset,
        documentation: 'Reset all feedback tracking state',
        invocableForReadOnlyElements: false
      },
      setEnabled: {
        returnType: VoidIO,
        parameterTypes: [ Boolean ],
        implementation: this.setEnabled,
        documentation: 'Enable or disable the feedback manager',
        invocableForReadOnlyElements: false
      }
    }
  } );
}

forcesAndMotionBasics.register( 'FeedbackManager', FeedbackManager );
export default FeedbackManager;
