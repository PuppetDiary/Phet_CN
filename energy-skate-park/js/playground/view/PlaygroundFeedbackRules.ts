// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Playground screen of Energy Skate Park.
 * Monitors track creation and skater behavior to encourage exploration.
 *
 * @author AI Education Project Team
 */

import type { FeedbackRule } from '../../common/model/FeedbackManager.js';

export const playgroundFeedbackRules: FeedbackRule[] = [

    // 1. Skater gets on a custom-built track
    {
        id: 'esp-playground-on-track',
        check: (model: any) => model.skater.trackProperty.value !== null,
        message: '太棒了！滑板上轨道了，观察能量如何随位置变化！',
        type: 'discovery',
        priority: 10
    },

    // 2. Skater reaches high speed on custom track
    {
        id: 'esp-playground-high-speed',
        check: (model: any) => model.skater.speedProperty.value > 5,
        message: '速度很快！你设计的轨道让能量转换非常高效！',
        type: 'success',
        priority: 8
    },

    // 3. Multiple tracks present in the scene
    {
        id: 'esp-playground-multiple-tracks',
        check: (model: any) => {
            const physicalTracks = model.getPhysicalTracks ? model.getPhysicalTracks() : [];
            return physicalTracks.length > 1;
        },
        message: '创建了多条轨道！试试把它们连接起来，打造复杂的轨道！',
        type: 'discovery',
        priority: 7
    },

    // 4. Encourage using gravity controls
    {
        id: 'esp-playground-try-gravity',
        check: (model: any) => model.skater.speedProperty.value < 0.1 && model.skater.trackProperty.value !== null,
        message: '试试改变重力大小，看看在月球或木星上能量会如何变化！',
        type: 'encouragement',
        priority: 3
    }
];
