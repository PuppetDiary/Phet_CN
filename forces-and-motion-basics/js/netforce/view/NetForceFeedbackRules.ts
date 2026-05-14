// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Net Force (tug-of-war) game.
 *
 * @author AI Education Project Team
 */

import type NetForceModel from '../../model/NetForceModel.js';
import { FeedbackRule } from '../../../common/model/FeedbackManager.js';
import ForcesAndMotionBasicsFluent from '../../ForcesAndMotionBasicsFluent.js';

/**
 * Feedback rules for the Net Force screen
 */
export const netForceFeedbackRules: FeedbackRule[] = [
  {
    id: 'game-start-welcome',
    check: ( model: NetForceModel ) => {
      // Show when game hasn't started yet - this is the main condition
      if ( model.isRunningProperty.value ) {
        return false;
      }

      // Show based on number of pullers
      const pullerCount = model.numberPullersAttachedProperty.value;

      // No pullers - basic welcome
      if ( pullerCount === 0 ) {
        return true;
      }

      // One puller - encourage adding more
      if ( pullerCount === 1 ) {
        return true;
      }

      return false;
    },
    message: ( model: NetForceModel ) => {
      const pullerCount = model.numberPullersAttachedProperty.value;
      if ( pullerCount === 0 ) {
        return '从工具箱拖动拔河队员到绳子上，开始比赛！';
      } else {
        return '很好！再拖一个队员到绳子上，让比赛更激烈！';
      }
    },
    type: 'discovery',
    priority: 0
  },
  {
    id: 'ready-to-start',
    check: ( model: NetForceModel ) => {
      // Show when 2+ pullers are attached but game hasn't started yet
      return !model.isRunningProperty.value && model.numberPullersAttachedProperty.value >= 2;
    },
    message: () => `队员准备好了！点击 ${ForcesAndMotionBasicsFluent.goStringProperty.value} 按钮开始拔河比赛！`,
    type: 'discovery',
    priority: 2
  },
  {
    id: 'balanced-forces',
    check: ( model: NetForceModel ) => {
      return model.isRunningProperty.value &&
             Math.abs( model.netForceProperty.value ) < 10 &&
             model.speedProperty.value < 0.5;
    },
    message: '力平衡了！小车几乎不动，你发现了吗？',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'larger-force-faster',
    check: ( model: NetForceModel ) => {
      return model.isRunningProperty.value &&
             Math.abs( model.netForceProperty.value ) > 100 &&
             model.speedProperty.value > 3;
    },
    message: '观察得真仔细！拉力越大，物体速度越快。',
    type: 'success',
    priority: 4
  },
  {
    id: 'one-sided-force',
    check: ( model: NetForceModel ) => {
      const hasLeftPullers = model.numberBluePullersAttachedProperty.value > 0;
      const hasRightPullers = model.numberRedPullersAttachedProperty.value > 0;
      return model.isRunningProperty.value &&
             ( hasLeftPullers || hasRightPullers ) &&
             !( hasLeftPullers && hasRightPullers );
    },
    message: '只有一边有力！小车会向那边加速。',
    type: 'discovery',
    priority: 2
  },
  {
    id: 'competitive-game',
    check: ( model: NetForceModel ) => {
      return model.numberBluePullersAttachedProperty.value >= 2 &&
             model.numberRedPullersAttachedProperty.value >= 2;
    },
    message: '激烈的比赛！两边的力量都很强。',
    type: 'discovery',
    priority: 3
  },
  {
    id: 'game-won',
    check: ( model: NetForceModel ) => {
      return model.stateProperty.value === 'completed';
    },
    message: '拔河获胜啦！你完美掌握了力的合成与平衡技巧。',
    type: 'success',
    priority: 10
  },
  {
    id: 'close-game',
    check: ( model: NetForceModel ) => {
      return model.isRunningProperty.value &&
             Math.abs( model.netForceProperty.value ) < 30 &&
             Math.abs( model.netForceProperty.value ) > 10 &&
             model.speedProperty.value > 1;
    },
    message: '势均力敌！双方力量很接近。',
    type: 'discovery',
    priority: 3
  }
];
