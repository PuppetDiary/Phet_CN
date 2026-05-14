// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Graphs screen of Energy Skate Park.
 * Monitors energy graph visibility and provides positive feedback.
 *
 * @author AI Education Project Team
 */

import type { FeedbackRule } from '../../common/model/FeedbackManager.js';

export const graphsFeedbackRules: FeedbackRule[] = [

    // 1. Graph appears (skater starts moving with graph visible)
    {
        id: 'esp-graphs-first-curve',
        check: (model: any) => model.skater.speedProperty.value > 0.3 && !model.pausedProperty.value,
        message: '图线出现了！观察能量随时间的变化曲线。',
        type: 'discovery',
        priority: 10
    },

    // 2. Skater reaches peak and comes back down (energy conservation visible)
    {
        id: 'esp-graphs-high-speed',
        check: (model: any) => model.skater.speedProperty.value > 5,
        message: '看图线的峰值！势能完全转化为动能的瞬间！',
        type: 'success',
        priority: 8
    },

    // 3. Encourage switching energy type display
    {
        id: 'esp-graphs-explore-types',
        check: (model: any) => model.skater.speedProperty.value > 0.5 && model.skater.trackProperty.value !== null,
        message: '试试切换左边的能量类型，看看每种能量的曲线形状！',
        type: 'discovery',
        priority: 6
    },

    // 4. Encourage pausing to examine the graph
    {
        id: 'esp-graphs-pause-examine',
        check: (model: any) => !model.pausedProperty.value && model.skater.speedProperty.value > 1,
        message: '试试暂停（空格键）来仔细观察图表上的数值！',
        type: 'encouragement',
        priority: 4
    }
];
