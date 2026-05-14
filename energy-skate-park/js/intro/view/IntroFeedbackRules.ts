// Copyright 2025, University of Colorado Boulder

/**
 * Feedback rules for the Intro screen of Energy Skate Park.
 * Monitors skater state and provides positive feedback to guide learning.
 *
 * @author AI Education Project Team
 */

import type { FeedbackRule } from '../../common/model/FeedbackManager.js';

/**
 * Intro screen feedback rules.
 * Model type is EnergySkateParkFullTrackSetModel (or any EnergySkateParkModel).
 */
export const introFeedbackRules: FeedbackRule[] = [

    // 1. Skater gets on the track for the first time
    {
        id: 'esp-intro-on-track',
        check: (model: any) => model.skater.trackProperty.value !== null,
        message: '太棒了！滑板已上轨道，观察左边能量柱状图的变化吧！',
        type: 'discovery',
        priority: 10
    },

    // 2. Skater reaches high speed (kinetic energy very visible)
    {
        id: 'esp-intro-speed-high',
        check: (model: any) => model.skater.speedProperty.value > 5,
        message: '速度真快！势能正在转化为动能，能量守恒！',
        type: 'success',
        priority: 8
    },

    // 3. Encourage user to notice the energy bar graph
    {
        id: 'esp-intro-energy-bar',
        check: (model: any) => model.skater.speedProperty.value > 0.5 && !model.pausedProperty.value,
        message: '注意观察能量柱状图，它实时显示动能、势能和热能的分布！',
        type: 'discovery',
        priority: 6
    },

    // 4. User switched to a different scene/track
    {
        id: 'esp-intro-scene-changed',
        check: (model: any) => model.sceneProperty?.value > 0,
        message: '换了新轨道！不同轨道形状会带来不同的能量转换，继续探索！',
        type: 'discovery',
        priority: 5
    },

    // 5. Encouragement if skater barely moves for a while
    {
        id: 'esp-intro-explore',
        check: (model: any) => {
            const speed = model.skater.speedProperty.value;
            const onTrack = model.skater.trackProperty.value !== null;
            // Static for a while but not at beginning
            return speed < 0.1 && !onTrack;
        },
        message: '把滑板拖到轨道高处放开，看看会发生什么？',
        type: 'encouragement',
        priority: 3
    }
];
