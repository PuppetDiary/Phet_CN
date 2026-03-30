// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Motion and Friction screens.
 *
 * @author AI Education Project Team
 */

import type MotionModel from '../../model/MotionModel.js';
import { FeedbackRule } from '../../../common/model/FeedbackManager.js';

/**
 * Feedback rules for the Motion screen
 */
export const motionFeedbackRules: FeedbackRule[] = [
  {
    id: 'game-start-welcome',
    check: ( model: MotionModel ) => {
      // Show when no objects are on the skateboard
      return model.stackedItems.length === 0;
    },
    message: '拖动小人推一下箱子，开始游戏吧！',
    type: 'discovery',
    priority: 0  // Highest priority to show first
  },
  {
    id: 'first-object-placed-push-hint',
    check: ( model: MotionModel ) => {
      // Show after placing first object, but before pushing
      return model.stackedItems.length >= 1 && Math.abs( model.appliedForceProperty.value ) < 10;
    },
    message: '太好了！现在试着推一下箱子，看看会发生什么？',
    type: 'discovery',
    priority: 1
  },
  {
    id: 'force-creates-motion',
    check: ( model: MotionModel ) => {
      return Math.abs( model.appliedForceProperty.value ) > 50 &&
             Math.abs( model.velocityProperty.value ) > 0.5;
    },
    message: '箱子动起来了！力让物体产生运动！',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'try-different-objects',
    check: ( model: MotionModel ) => {
      return model.stackedItems.length >= 2;
    },
    message: '试试把不同物体放在滑板上，看看质量如何影响运动？',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'constant-force-constant-accel',
    check: ( model: MotionModel ) => {
      const force = Math.abs( model.appliedForceProperty.value );
      const accel = Math.abs( model.accelerationProperty.value );
      return force > 50 && accel > 0.5 && accel < 3;
    },
    message: '速度越来越快！恒定的力产生恒定的加速度！',
    type: 'discovery',
    priority: 4
  },
  {
    id: 'no-force-motion',
    check: ( model: MotionModel ) => {
      return model.appliedForceProperty.value === 0 &&
             Math.abs( model.velocityProperty.value ) > 0.5;
    },
    message: '没有力作用，物体保持匀速运动。',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'reversed-force',
    check: ( model: MotionModel ) => {
      const velocity = model.velocityProperty.value;
      const force = model.appliedForceProperty.value;
      return Math.abs( force ) > 50 &&
             Math.abs( velocity ) > 1 &&
             ( ( velocity > 0 && force < 0 ) || ( velocity < 0 && force > 0 ) );
    },
    message: '力与运动方向相反，物体在减速！',
    type: 'discovery',
    priority: 3
  }
];

/**
 * Feedback rules for the Friction screen
 */
export const frictionFeedbackRules: FeedbackRule[] = [
  {
    id: 'game-start-welcome',
    check: ( model: MotionModel ) => {
      // Show welcome message when just starting
      const velocity = Math.abs( model.velocityProperty.value );
      const force = Math.abs( model.appliedForceProperty.value );
      return velocity < 0.01 && force < 10;
    },
    message: '先调整摩擦力滑块，然后推箱子看看效果！',
    type: 'discovery',
    priority: 0  // Highest priority to show first
  },
  {
    id: 'high-friction-needs-more-force',
    check: ( model: MotionModel ) => {
      const friction = model.frictionCoefficientProperty.value;
      const appliedForce = Math.abs( model.appliedForceProperty.value );
      const velocity = Math.abs( model.velocityProperty.value );

      return friction > 0.3 && appliedForce < 50 && velocity < 0.01;
    },
    message: '摩擦力很大！需要更大的力才能让箱子动起来！',
    type: 'discovery',
    priority: 1
  },
  {
    id: 'static-friction-resisting',
    check: ( model: MotionModel ) => {
      const appliedForce = Math.abs( model.appliedForceProperty.value );
      const velocity = Math.abs( model.velocityProperty.value );
      const frictionCoeff = model.frictionCoefficientProperty.value;

      // Only show if force is not at maximum (max is 500N)
      // User can still push more, so the hint is meaningful
      return velocity < 0.01 &&
             appliedForce > 50 &&
             appliedForce < 450 &&  // Don't show if already at max force (500N)
             frictionCoeff > 0.2;
    },
    message: ( model: MotionModel ) => {
      const coeff = model.frictionCoefficientProperty.value;
      return `摩擦力在抵抗你的推力！加大推力试试！`;
    },
    type: 'discovery',
    priority: 2
  },
  {
    id: 'friction-breakthrough',
    check: ( model: MotionModel ) => {
      const appliedForce = Math.abs( model.appliedForceProperty.value );
      const velocity = Math.abs( model.velocityProperty.value );
      const frictionCoeff = model.frictionCoefficientProperty.value;

      // Detect when object starts moving after being stationary
      return velocity > 0.1 && appliedForce > 50 && frictionCoeff > 0.1;
    },
    message: '突破了！箱子开始运动了！',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'friction-slows-down',
    check: ( model: MotionModel ) => {
      const speed = Math.abs( model.velocityProperty.value );
      const friction = model.frictionCoefficientProperty.value;

      return speed > 0 && speed < 2 && friction > 0.3;
    },
    message: '摩擦力让物体减速了！调节摩擦力看看效果。',
    type: 'discovery',
    priority: 4
  },
  {
    id: 'no-friction-motion',
    check: ( model: MotionModel ) => {
      return model.frictionCoefficientProperty.value === 0 &&
             Math.abs( model.velocityProperty.value ) > 1;
    },
    message: '没有摩擦力！物体会一直运动下去。',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'friction-adjustment-discovery',
    check: ( model: MotionModel ) => {
      // Triggered when user actively adjusts friction
      const friction = model.frictionCoefficientProperty.value;
      const speed = Math.abs( model.velocityProperty.value );
      return speed > 0.5 && friction > 0.1 && friction < 0.5;
    },
    message: '精准调节摩擦力，成功发现运动小规律！',
    type: 'success',
    priority: 4
  },
  {
    id: 'mass-affects-acceleration',
    check: ( model: MotionModel ) => {
      if ( model.stackedItems.length === 0 ) return false;

      const mass = model.getStackMass();
      const accel = Math.abs( model.accelerationProperty.value );

      return mass > 100 && accel < 1 && Math.abs( model.appliedForceProperty.value ) > 100;
    },
    message: '质量越大，加速度越小！你发现 F=ma 的规律了吗？',
    type: 'discovery',
    priority: 4
  }
];

/**
 * Encouragement rules (when user is stuck or not making progress)
 */
export const encouragementRules: FeedbackRule[] = [
  {
    id: 'keep-exploring',
    check: ( model: MotionModel ) => {
      return model.timeProperty.value > 10 && Math.abs( model.velocityProperty.value ) < 0.5;
    },
    message: '再试一试，调整操作方式，你一定会有新发现！',
    type: 'encouragement',
    priority: 5  // Lower priority than welcome message
  },
  {
    id: 'try-different-objects',
    check: ( model: MotionModel ) => {
      return model.stackedItems.length === 1 && model.timeProperty.value > 15;
    },
    message: '试试添加更多物体，看看质量如何影响运动？',
    type: 'encouragement',
    priority: 5  // Lower priority than welcome message
  },
  {
    id: 'try-more-force',
    check: ( model: MotionModel ) => {
      // Only show if user hasn't applied much force AND velocity is low
      // Don't show if object is already moving fast (user has already experimented)
      const appliedForce = Math.abs( model.appliedForceProperty.value );
      const velocity = Math.abs( model.velocityProperty.value );
      return appliedForce < 50 &&
             velocity < 20 &&  // Don't show if already moving fast
             model.timeProperty.value > 10;
    },
    message: '试试加大推力，看看会发生什么？',
    type: 'encouragement',
    priority: 5  // Lower priority than welcome message
  },
  {
    id: 'adjust-friction',
    check: ( model: MotionModel ) => {
      // Only for friction screen
      if ( model.screen !== 'friction' ) return false;
      return model.frictionCoefficientProperty.value < 0.2 && model.timeProperty.value > 12;
    },
    message: '试试调节摩擦力，观察它如何影响运动？',
    type: 'encouragement',
    priority: 5  // Lower priority than welcome message
  }
];
