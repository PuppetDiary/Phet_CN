// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Measure screen of Energy Skate Park.
 * Monitors data sampling behavior and provides positive feedback.
 *
 * @author AI Education Project Team
 */

import type { FeedbackRule } from '../../common/model/FeedbackManager.js';

export const measureFeedbackRules: FeedbackRule[] = [

    // 1. User collected first data sample
    {
        id: 'esp-measure-first-sample',
        check: (model: any) => model.dataSamples && model.dataSamples.length > 0,
        message: '太棒了！你记录了第一个数据点，继续让滑板运动，收集更多数据！',
        type: 'discovery',
        priority: 10
    },

    // 2. User collected multiple samples - starting to see patterns
    {
        id: 'esp-measure-five-samples',
        check: (model: any) => model.dataSamples && model.dataSamples.length >= 5,
        message: '已收集5个数据点！观察能量随时间的变化规律了吗？',
        type: 'success',
        priority: 8
    },

    // 3. Skater moves fast while sampling
    {
        id: 'esp-measure-high-speed-sample',
        check: (model: any) => {
            const speed = model.skater.speedProperty.value;
            const hasSamples = model.dataSamples && model.dataSamples.length > 0;
            return speed > 4 && hasSamples;
        },
        message: '速度很快！注意观察高速时的能量分布。',
        type: 'discovery',
        priority: 6
    },

    // 4. Encourage exploring the measuring tools
    {
        id: 'esp-measure-use-tools',
        check: (model: any) => model.skater.speedProperty.value < 0.1,
        message: '试试使用卷尺或秒表，精确测量滑板的运动！',
        type: 'encouragement',
        priority: 3
    }
];
