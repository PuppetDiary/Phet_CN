// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Acceleration screen.
 *
 * @author AI Education Project Team
 */

import type MotionModel from '../../model/MotionModel.js';
import { FeedbackRule } from '../../../common/model/FeedbackManager.js';

/**
 * Feedback rules for the Acceleration screen
 */
export const accelerationFeedbackRules: FeedbackRule[] = [
  {
    id: 'game-start-welcome',
    check: ( model: MotionModel ) => {
      // Show welcome message when just starting
      const velocity = Math.abs( model.velocityProperty.value );
      const force = Math.abs( model.appliedForceProperty.value );
      return velocity < 0.01 && force < 10;
    },
    message: '拖动小人推一下箱子，看看加速度计的变化！',
    type: 'discovery',
    priority: 0  // Highest priority to show first
  },
  {
    id: 'accelerometer-active',
    check: ( model: MotionModel ) => {
      return model.showAccelerationProperty.value &&
             Math.abs( model.accelerationProperty.value ) > 0.1;
    },
    message: '加速度计在变化！这就是加速度！',
    type: 'discovery',
    priority: 1
  },
  {
    id: 'force-creates-acceleration',
    check: ( model: MotionModel ) => {
      return Math.abs( model.appliedForceProperty.value ) > 50 &&
             Math.abs( model.velocityProperty.value ) > 0.5 &&
             Math.abs( model.accelerationProperty.value ) > 0.5;
    },
    message: '有力作用就有加速度！箱子加速运动了！',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'constant-force-constant-accel',
    check: ( model: MotionModel ) => {
      const force = Math.abs( model.appliedForceProperty.value );
      const accel = Math.abs( model.accelerationProperty.value );

      return force > 50 && accel > 0.5 && accel < 3;
    },
    message: '恒定的力产生恒定的加速度，速度越来越快！',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'larger-mass-smaller-accel',
    check: ( model: MotionModel ) => {
      if ( model.stackedItems.length < 2 ) return false;

      const mass = model.getStackMass();
      const accel = Math.abs( model.accelerationProperty.value );
      const force = Math.abs( model.appliedForceProperty.value );

      return mass > 100 && accel < 1 && force > 100;
    },
    message: '质量越大，加速度越小！你发现 F=ma 的规律了吗？',
    type: 'discovery',
    priority: 4
  },
  {
    id: 'zero-force-zero-accel',
    check: ( model: MotionModel ) => {
      return model.appliedForceProperty.value === 0 &&
             Math.abs( model.accelerationProperty.value ) < 0.1 &&
             Math.abs( model.velocityProperty.value ) > 0;
    },
    message: '没有力就没有加速度，物体保持匀速运动。',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'high-acceleration',
    check: ( model: MotionModel ) => {
      return Math.abs( model.accelerationProperty.value ) > 3;
    },
    message: '加速度很大！物体在快速加速。',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'newtons-second-law-discovery',
    check: ( model: MotionModel ) => {
      if ( model.stackedItems.length === 0 ) return false;

      const mass = model.getStackMass();
      const force = Math.abs( model.appliedForceProperty.value );
      const accel = Math.abs( model.accelerationProperty.value );

      // Check if user has observed multiple scenarios
      return force > 50 && accel > 0.5 && model.timeProperty.value > 5;
    },
    message: '这就是牛顿第二定律！力越大加速度越大，质量越大加速度越小。',
    type: 'success',
    priority: 5
  }
];
