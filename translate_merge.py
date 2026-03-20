#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Merge missing English keys into Chinese JSON translation files.
Handles both flat (dot-notation) and nested ZH file structures.
"""
import json, os, copy

BASE = r"D:\Yongji_Wu\projects\Phet"

projects = [
    "energy-forms-and-changes",
    "energy-skate-park-basics",
    "energy-skate-park",
    "faradays-law",
    "forces-and-motion-basics",
    "friction",
    "graphing-quadratics",
    "gravity-and-orbits",
    "gravity-force-lab-basics",
    "gravity-force-lab",
]

def flatten_to_leaf_paths(d, prefix="", result=None):
    """Flatten dict to {dot_path: entry} format.
    A leaf is any dict that has "value" as a key (optionally with other simple fields).
    Handles both EN format (only "value") and ZH format ("value" + "history").
    """
    if result is None:
        result = {}
    if isinstance(d, dict):
        for k, v in d.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict) and "value" in v:
                # Leaf entry: has a "value" key (EN: only value; ZH: value+history)
                result[new_prefix] = v
            else:
                flatten_to_leaf_paths(v, new_prefix, result)
    return result

def unflatten(flat_dict):
    """Convert {dot_path: entry} back to nested dict."""
    result = {}
    for dot_path, entry in flat_dict.items():
        parts = dot_path.split(".")
        current = result
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = entry
    return result

def set_flat_entry(data, dot_path, entry):
    """Set a flat dot-path entry in nested dict, creating intermediate structures."""
    parts = dot_path.split(".")
    current = data
    for part in parts[:-1]:
        if part not in current:
            current[part] = {}
        current = current[part]
    current[parts[-1]] = entry

TRANSLATIONS = {
    # energy-forms-and-changes a11y
    "a11y.systemsScreenSummaryDescription.value":
        "这是一个互动模拟器。它会随着你的操作而变化。它有一个游戏区和一个控制区。在游戏区，"
        "构建一个包含能量生产者、转换器和消费者的能量系统。调整能量产生并观察系统中的能量流动。"
        "用能量符号检查能量的形式和转换。在控制面板中，使用播放、暂停和步进按钮或重置模拟器。",
    "a11y.systemsScreenInteractionHint.value":
        "调整能量生产者以开始观察。",
    "a11y.energySystem.value":
        "能量系统",
    "a11y.energySystemHelpText.value":
        "能量系统包含一个{{producer}}、一个转换器和一个{{user}}。",
    "a11y.waterFaucet.value":
        "水龙头",
    "a11y.sun.value":
        "太阳",
    "a11y.teaKettle.value":
        "茶壶",
    "a11y.cyclist.value":
        "骑行者",
    "a11y.electricalGenerator.value":
        "轮式发电机",
    "a11y.solarPanel.value":
        "太阳能电池板",
    "a11y.beakerOfWater.value":
        "加热元件上的水杯",
    "a11y.incandescentLightBulb.value":
        "白炽灯泡",
    "a11y.fluorescentLightBulb.value":
        "荧光灯",

    # energy-skate-park-basics a11y
    "a11y.screenButtons.friction.accessibleHelpText.value":
        "尝试在轨道上添加摩擦力。",

    # energy-skate-park a11y
    "a11y.noDataParagraph.value":
        "暂无数据可显示。抓住滑板者开始体验。",
    "a11y.screenSummary.playArea.intro.value":
        "在你的滑板场，滑板者可以沿着轨道移动。你可以探索能量的图形表示并测量速度。",
    "a11y.screenSummary.playArea.measure.value":
        "在你的滑板场，滑板者可以沿着可调节的轨道移动。你可以探索能量的图形表示并测量速度。"
        "此外，能量传感器可以沿滑板者的路径测量能量、速度和高度。",
    "a11y.screenSummary.playArea.graphs.value":
        "在你的滑板场，滑板者可以沿着可调节的轨道移动。你可以探索能量的图形表示并测量速度。"
        "此外，能量图可以将能量绘制为位置或时间的函数。",
    "a11y.screenSummary.playArea.friction.value":
        "在你的滑板场，滑板者可以沿着具有可调节摩擦力的轨道移动。"
        "你可以探索能量的图形表示并测量速度。",
    "a11y.screenSummary.playArea.playground.value":
        "在你的滑板场，滑板者可以沿着自定义建造的轨道移动。"
        "你可以探索能量的图形表示并测量速度。",
    "a11y.screenSummary.controlArea.withTrackSelection.value":
        "你可以选择轨道形状、调整实验设置并启用测量工具。"
        "有一个按钮可以暂停模拟器以便更仔细地分析能量和速度。重置模拟器以重新开始。",
    "a11y.screenSummary.controlArea.withoutTrackSelection.value":
        "你可以调整实验设置并启用测量工具。有一个按钮可以暂停模拟器以便更仔细地分析能量和速度。"
        "重置模拟器以重新开始。",
    "a11y.screenSummary.currentDetails.skaterPhrase.value":
        "当前，滑板者{ $onTrack -> [on] 在 *[off] 不在 }轨道上，"
        "{ $motion -> [inMotion] 在运动中 *[atRest] 静止 }。",
    "a11y.screenSummary.currentDetails.frictionPhrase.value":
        "轨道表面{ $hasFriction -> [true] 有摩擦力 *[false] 无摩擦 }。",
    "a11y.screenSummary.currentDetails.noTrackBuilt.value":
        "当前，尚未建造轨道。",
    "a11y.screenSummary.interactionHint.hasTrack.value":
        "将滑板者放到轨道上以开始探索。",
    "a11y.screenSummary.interactionHint.noTrack.value":
        "添加轨道以开始构建你自己的滑板场。",
    "a11y.controlPanel.experimentSettingsHeading.value":
        "实验设置",
    "a11y.keyboardHelpDialog.connectTrackEndpoints.showOptions.value":
        "显示选项",
    "a11y.keyboardHelpDialog.connectTrackEndpoints.moveThroughOptions.value":
        "切换选项",
    "a11y.keyboardHelpDialog.connectTrackEndpoints.selectOption.value":
        "选择选项",
    "a11y.keyboardHelpDialog.connectTrackEndpoints.cancel.value":
        "取消",
    "a11y.skaterNode.accessibleName.value":
        "滑板者",
    "a11y.skaterNode.firstGrabContextResponse.value":
        "按J键加T键将滑板者附着到最近的轨道。按空格键释放。",
    "a11y.skaterNode.snapToTrackContextResponse.value":
        "滑板者在轨道上。",
    "a11y.skaterNode.detachFromTrackContextResponse.value":
        "滑板者离开轨道。",
    "a11y.skaterNode.offScreenContextResponse.value":
        "滑板者离开屏幕。请返回滑板者。",
    "a11y.referenceHeightLine.accessibleHeading.value":
        "参考高度",
    "a11y.referenceHeightLine.accessibleName.value":
        "参考高度线",
    "a11y.referenceHeightLine.accessibleHelpText.value":
        "设置高度为零的垂直位置。",
    "a11y.referenceHeightLine.aboveGroundPattern.value":
        "离地面 { $distance } 米",
    "a11y.referenceHeightLine.atGroundLevel.value":
        "在地面高度",
    "a11y.toolboxPanel.accessibleHeading.value":
        "工具箱",
    "a11y.toolboxPanel.stopwatch.accessibleName.value":
        "添加秒表",
    "a11y.toolboxPanel.measuringTape.accessibleName.value":
        "添加卷尺",
    "a11y.stopwatchNode.accessibleHeading.value":
        "秒表",
    "a11y.measuringTapeNode.accessibleHeading.value":
        "卷尺",
    "a11y.trackToolboxPanel.accessibleName.value":
        "添加轨道",
    "a11y.yourSkatePark.accessibleHeading.value":
        "你的滑板场",
    "a11y.yourSkatePark.accessibleHelpText.value":
        "根据需要添加轨道片段。然后使用连接选项连接轨道。所有物体都可以用方向键移动。"
        "查看键盘快捷键了解更多快捷方式。",
    "a11y.yourSkatePark.trackPhraseFixed.value":
        "轨道形状为 { $trackShape }。",
    "a11y.yourSkatePark.trackPhraseAdjustable.value":
        "轨道形状为 { $trackShape }，有 { $numberControlPoints -> [one] { $numberControlPoints } 个可调控制点 "
        "*[other] { $numberControlPoints } 个可调控制点 }。",
    "a11y.yourSkatePark.playgroundTrackPhraseMultiple.value":
        "你的自定义轨道有 { $numberTracks } 条轨道，"
        "{ $numberControlPoints -> [one] { $numberControlPoints } 个可调控制点 "
        "*[other] { $numberControlPoints } 个可调控制点 }。",
    "a11y.yourSkatePark.playgroundTrackPhraseSingle.value":
        "你的自定义轨道有1条轨道，"
        "{ $numberControlPoints -> [one] { $numberControlPoints } 个可调控制点 "
        "*[other] { $numberControlPoints } 个可调控制点 }。",
    "a11y.yourSkatePark.playgroundTrackPhraseNone.value":
        "暂无轨道。",
    "a11y.yourSkatePark.trackAndSkaterParagraph.value":
        "{ $trackPhrase } { $skaterPhrase }",
    "a11y.yourSkatePark.skaterOnTrack.value":
        "滑板者在轨道上。",
    "a11y.yourSkatePark.skaterOnTrackWithIndex.value":
        "滑板者在轨道 { $index } 上。",
    "a11y.yourSkatePark.skaterOffTrack.value":
        "滑板者不在轨道上。",
    "a11y.trackNode.accessibleHeadingWithIndex.value":
        "轨道 { $index }",
    "a11y.trackNode.accessibleHeading.value":
        "轨道",
    "a11y.trackNode.accessibleHelpText.value":
        "移动控制点以改变轨道形状。",
    "a11y.controlPointNode.accessibleName.value":
        "控制点 { $index }",
    "a11y.controlPointNode.accessibleObjectResponse.value":
        "位于 { $xCoordinate } { $yCoordinate } 米",
    "a11y.eraseTracksButton.accessibleName.value":
        "清除轨道",
    "a11y.eraseTracksButton.accessibleContextResponse.value":
        "所有轨道已从你的滑板场中移除。",
    "a11y.grabSkaterButton.accessibleHelpText.value":
        "寻找滑板者并抓住它。抓住后，使用键盘快捷键附着到轨道或沿轨道移动。",
    "a11y.energyReadoutPattern.value":
        "能量（焦耳）：动能 {$kinetic}，势能 {$potential}，热能 {$thermal}，总能量 {$total}。",
    "a11y.energySensorNode.accessibleHeading.value":
        "能量传感器",
    "a11y.energySensorNode.accessibleName.value":
        "能量传感器探头",
    "a11y.energySensorNode.accessibleHelpText.value":
        "沿滑板者的路径移动探头以测量速度、高度和能量。"
        "当滑板者转身时路径会消失。暂停以分析数值。",
    "a11y.energySensorNode.nothingToMeasure.value":
        "暂无可测量内容。",
    "a11y.energySensorNode.movedOffSamples.value":
        "传感器已移出采样点。",
    "a11y.energySensorNode.sampleReadoutPattern.value":
        "高度 {$height} 米。速度 {$speed} 米每秒。",
    "a11y.pieChart.accessibleHeading.value":
        "饼图",
    "a11y.pieChart.accessibleHelpText.value":
        "饼图实时显示滑板者的能量。暂停以分析数值。",
    "a11y.pieChart.positiveEnergyParagraph.value":
        "饼图中：{$energiesList}。",
    "a11y.pieChart.negativeEnergyParagraph.value":
        "饼图：总能量100%。",
    "a11y.pieChart.kineticPercentPattern.value":
        "动能 {$percent}%",
    "a11y.pieChart.potentialPercentPattern.value":
        "势能 {$percent}%",
    "a11y.pieChart.thermalPercentPattern.value":
        "热能 {$percent}%",
    "a11y.pieChart.legendHeading.value":
        "能量图例",
    "a11y.pieChart.legendKinetic.value":
        "动能：绿色",
    "a11y.pieChart.legendPotential.value":
        "势能：蓝色",
    "a11y.pieChart.legendThermal.value":
        "热能：红色",
    "a11y.pieChart.legendTotal.value":
        "总能量：金色",
    "a11y.speedometer.accessibleHeading.value":
        "速度计",
    "a11y.speedometer.accessibleParagraph.value":
        "滑板者的速度为 { $speed } 米每秒。",
    "a11y.energyGraph.accessibleHelpTextCollapsed.value":
        "探索滑板者能量作为位置或时间函数的图像。",
    "a11y.energyGraph.graphDescriptionParagraph.value":
        "能量图将能量绘制为 {$variable} 的函数。能量以焦耳为单位，{$variable} 以 {$units} 为单位。"
        "当前，图中显示 {$checkedEnergiesList} 能量。",
    "a11y.energyGraph.variablePosition.value":
        "位置",
    "a11y.energyGraph.variableTime.value":
        "时间",
    "a11y.energyGraph.unitsMeters.value":
        "米",
    "a11y.energyGraph.unitsSeconds.value":
        "秒",
    "a11y.energyGraph.energyKinetic.value":
        "动能",
    "a11y.energyGraph.energyPotential.value":
        "势能",
    "a11y.energyGraph.energyThermal.value":
        "热能",
    "a11y.energyGraph.energyTotal.value":
        "总能量",
    "a11y.energyGraph.energyNone.value":
        "无",
    "a11y.energyGraph.checkboxGroupParagraph.value":
        "选择在能量图中显示的能量类型。",
    "a11y.energyGraph.kineticCheckbox.accessibleContextResponseChecked.value":
        "动能数据已显示在能量图中。",
    "a11y.energyGraph.kineticCheckbox.accessibleContextResponseUnchecked.value":
        "动能数据已从能量图中移除。",
    "a11y.energyGraph.potentialCheckbox.accessibleContextResponseChecked.value":
        "势能已显示在能量图中。",
    "a11y.energyGraph.potentialCheckbox.accessibleContextResponseUnchecked.value":
        "势能数据已从能量图中移除。",
    "a11y.energyGraph.thermalCheckbox.accessibleContextResponseChecked.value":
        "热能已显示在能量图中。",
    "a11y.energyGraph.thermalCheckbox.accessibleContextResponseUnchecked.value":
        "热能数据已从能量图中移除。",
    "a11y.energyGraph.totalCheckbox.accessibleContextResponseChecked.value":
        "总能量已显示在能量图中。",
    "a11y.energyGraph.totalCheckbox.accessibleContextResponseUnchecked.value":
        "总能量数据已从能量图中移除。",
    "a11y.energyGraph.graphCursor.accessibleName.value":
        "图形光标",
    "a11y.energyGraph.graphCursor.accessibleHelpText.value":
        "拖动时间并回顾滑板者数据。按空格键暂停或播放。",
    "a11y.energyGraph.graphCursor.movementResponse.value":
        "当前时间 {$sampleTime} 秒。",
    "a11y.energyGraph.zoomButtonGroup.zoomIn.accessibleName.value":
        "放大能量轴",
    "a11y.energyGraph.zoomButtonGroup.zoomIn.accessibleHelpText.value":
        "仅调整能量轴的视觉比例。",
    "a11y.energyGraph.zoomButtonGroup.zoomOut.accessibleName.value":
        "缩小能量轴",
    "a11y.energyGraph.zoomButtonGroup.zoomOut.accessibleHelpText.value":
        "仅调整能量轴的视觉比例。",
    "a11y.energyGraph.zoomButtonGroup.zoomLevelResponse.value":
        "能量范围现在是 {$min} 到 {$max} 焦耳。",
    "a11y.energyGraph.variableSwitch.accessibleHelpText.value":
        "将滑板者能量绘制为位置或时间的函数。",
    "a11y.energyGraph.eraserButton.accessibleName.value":
        "清除能量图数据",
    "a11y.energyGraph.eraserButton.positionResponse.value":
        "能量图中的数据已清除。",
    "a11y.energyGraph.eraserButton.timeResponse.value":
        "能量图中的数据已清除。时间重置为0秒。",
    "a11y.energyBarGraphAccordionBox.accessibleName.value":
        "能量柱状图",
    "a11y.energyBarGraphAccordionBox.accessibleHelpTextExpanded.value":
        "柱状图实时显示滑板者的能量。暂停以分析数值。",
    "a11y.energyBarGraphAccordionBox.clearThermalButton.accessibleName.value":
        "清除热能",
    "a11y.energyBarGraphAccordionBox.clearThermalButton.accessibleHelpText.value":
        "清除系统中积累的热能。",
    "a11y.energyBarGraphAccordionBox.clearThermalButton.accessibleContextResponse.value":
        "热能已设置为零。",
    "a11y.energyBarGraphAccordionBox.zoomButtonGroup.zoomIn.accessibleName.value":
        "放大",
    "a11y.energyBarGraphAccordionBox.zoomButtonGroup.zoomIn.accessibleHelpText.value":
        "调整柱状图的视觉比例。",
    "a11y.energyBarGraphAccordionBox.zoomButtonGroup.zoomOut.accessibleName.value":
        "缩小",
    "a11y.energyBarGraphAccordionBox.zoomButtonGroup.zoomOut.accessibleHelpText.value":
        "调整柱状图的视觉比例。",
    "a11y.energyBarGraphAccordionBox.zoomButtonGroup.zoomLevelResponse.value":
        "缩放级别 { $level } / { $max }。",
    "a11y.pieChartCheckbox.accessibleHelpText.value":
        "显示或隐藏滑板者能量的饼图表示。",
    "a11y.pieChartCheckbox.accessibleContextResponseChecked.value":
        "饼图已添加到游戏区。",
    "a11y.pieChartCheckbox.accessibleContextResponseUnchecked.value":
        "饼图已隐藏。",
    "a11y.speedCheckbox.accessibleHelpText.value":
        "探索是否显示速度测量。",
    "a11y.speedCheckbox.accessibleContextResponseChecked.value":
        "速度计已添加到游戏区。",
    "a11y.speedCheckbox.accessibleContextResponseUnchecked.value":
        "速度计已隐藏。",
    "a11y.pathCheckbox.accessibleHelpText.value":
        "探索是否沿滑板者的路径在等时间间隔绘制点。",
    "a11y.pathCheckbox.accessibleContextResponseChecked.value":
        "路径点已按等时间间隔绘制。",
    "a11y.pathCheckbox.accessibleContextResponseUnchecked.value":
        "路径点已隐藏。",
    "a11y.stickToTrackCheckbox.accessibleContextResponseChecked.value":
        "粘附轨道模式已启用。",
    "a11y.stickToTrackCheckbox.accessibleContextResponseUnchecked.value":
        "粘附轨道模式已关闭。",
    "a11y.sceneSelectionRadioButtonGroup.accessibleName.value":
        "轨道选择",
    "a11y.sceneSelectionRadioButtonGroup.parabolaRadioButton.accessibleName.value":
        "抛物线",
    "a11y.sceneSelectionRadioButtonGroup.rampRadioButton.accessibleName.value":
        "斜坡",
    "a11y.sceneSelectionRadioButtonGroup.doubleWellRadioButton.accessibleName.value":
        "双凹",
    "a11y.sceneSelectionRadioButtonGroup.loopRadioButton.accessibleName.value":
        "环形",
    "a11y.frictionSlider.accessibleHelpText.value":
        "设置摩擦系数，范围从无到最大。",
    "a11y.gravitySlider.accessibleHelpText.value":
        "设置重力加速度，范围从小到大。",
    "a11y.gravityControl.accessibleHelpText.value":
        "设置重力加速度。",
    "a11y.gravityControl.accessibleValuePattern.value":
        "{$value} { $units -> [metersPerSecondSquared] 米每二次方秒 "
        "*[newtonsPerKilogram] 牛顿每千克 }",
    "a11y.gravityComboBox.accessibleName.value":
        "重力参考",
    "a11y.gravityComboBox.accessibleHelpText.value":
        "将重力加速度设置为匹配所选参考值。",
    "a11y.gravityComboBox.accessibleContextResponse.value":
        "重力现在为 {$gravityValue}。",
    "a11y.massSlider.accessibleHelpText.value":
        "设置滑板者质量，范围从小到大。",
    "a11y.massControl.accessibleHelpText.value":
        "设置滑板者质量。",
    "a11y.massControl.accessibleValuePattern.value":
        "{$value} 千克",
    "a11y.skaterSetOneControls.accessibleName.value":
        "滑板者选择",
    "a11y.skaterSetOneControls.accessibleHelpText.value":
        "选择滑板者形象。",
    "a11y.skaterSetOneControls.skater1RadioButton.accessibleName.value":
        "滑板者 1",
    "a11y.skaterSetOneControls.skater2RadioButton.accessibleName.value":
        "滑板者 2",
    "a11y.skaterSetOneControls.skater3RadioButton.accessibleName.value":
        "滑板者 3",
    "a11y.skaterSetOneControls.skater4RadioButton.accessibleName.value":
        "滑板者 4",
    "a11y.skaterSetOneControls.skater5RadioButton.accessibleName.value":
        "滑板者 5",
    "a11y.skaterSetOneControls.skater6RadioButton.accessibleName.value":
        "滑板者 6",
    "a11y.skaterSetOneControls.animal1RadioButton.accessibleName.value":
        "动物 1",
    "a11y.skaterSetOneControls.animal2RadioButton.accessibleName.value":
        "动物 2",
    "a11y.gridCheckbox.accessibleHelpText.value":
        "显示或隐藏滑板轨道后面的网格线以测量高度。",
    "a11y.gridCheckbox.accessibleContextResponseChecked.value":
        "网格线已显示。",
    "a11y.gridCheckbox.accessibleContextResponseUnchecked.value":
        "网格线已隐藏。",
    "a11y.referenceHeightCheckbox.accessibleHelpText.value":
        "探索是否使用可调节的参考高度。",
    "a11y.referenceHeightCheckbox.accessibleContextResponseChecked.value":
        "参考高度已添加到游戏区。",
    "a11y.referenceHeightCheckbox.accessibleContextResponseUnchecked.value":
        "参考高度已隐藏。",
    "a11y.restartSkaterButton.accessibleHelpText.value":
        "将滑板者返回到最近的起始位置并重复实验。",
    "a11y.returnSkaterToPreviousStartingPositionButton.accessibleName.value":
        "将滑板者返回起始位置",
    "a11y.returnSkaterToPreviousStartingPositionButton.accessibleHelpText.value":
        "将滑板者返回到最近的起始位置并重复实验。",
    "a11y.returnSkaterToPreviousStartingPositionButton.accessibleContextResponse.value":
        "滑板者已返回起始位置。",
    "a11y.returnSkaterToGroundButton.accessibleName.value":
        "将滑板者返回地面",
    "a11y.returnSkaterToGroundButton.accessibleContextResponse.value":
        "滑板者在地面上。",
    "a11y.screenButtons.intro.accessibleHelpText.value":
        "探索不同的轨道和滑板者，观察能量的变化。",
    "a11y.screenButtons.measure.accessibleHelpText.value":
        "测量并比较滑板者在轨道不同位置的能量。",
    "a11y.screenButtons.graphs.accessibleHelpText.value":
        "分析滑板者能量作为位置或时间函数的图像。",
    "a11y.screenButtons.playground.accessibleHelpText.value":
        "为滑板者建造你自己的自定义轨道、斜坡和跳跃台。",
    "a11y.preferences.metersPerSecondSquaredRadioButton.value":
        "米每二次方秒",
    "a11y.preferences.newtonsPerKilogramRadioButton.value":
        "牛顿每千克",

    # faradays-law a11y
    "a11y.summaryDescription.value":
        "游戏区有一个灯泡电路和一个可移动的条形磁铁。有控制按钮可以改变连接到电路的元件、"
        "翻转条形磁铁，以及重置模拟器。",
    "a11y.moveMagnetToPlay.value":
        "使用方向键、W A S D键或1 2 3键移动磁铁进行体验。",
    "a11y.lightBulbCircuitLabel.value":
        "灯泡电路",
    "a11y.barMagnet.value":
        "条形磁铁",
    "a11y.inTheCircuit.value":
        "电路中有：",
    "a11y.flipMagnet.value":
        "翻转磁铁",
    "a11y.flipPoles.value":
        "翻转北极和南极。",
    "a11y.singleCoilDescription.value":
        "线圈侧放，开口在左侧和右侧。",
    "a11y.doubleCoilDescription.value":
        "线圈侧放，开口在左侧和右侧。",
    "a11y.voltmeter.value":
        "电压表",
    "a11y.lightBulb.value":
        "灯泡",
    "a11y.voltmeterDescription.value":
        "使用或不连接电压表到灯泡电路进行体验",
    "a11y.circuitFourCoilOnly.value":
        "电路中有灯泡和4匝线圈。",
    "a11y.circuitFourCoilAndVoltmeter.value":
        "电路中有灯泡、4匝线圈和电压表。",
    "a11y.circuitDescriptionPattern.value":
        "{{circuitContents}} {{coilDescription}}",
    "a11y.aLightbulb.value":
        "一个灯泡",
    "a11y.aVoltMeter.value":
        "一个电压表",
    "a11y.aCoilPattern.value":
        "一个 {{coil}}",
    "a11y.theCoilPattern.value":
        "{{coil}}",
    "a11y.fourLoopCoil.value":
        "4匝线圈",
    "a11y.theFourLoopCoil.value":
        "4匝线圈",
    "a11y.twoLoopCoil.value":
        "2匝线圈",
    "a11y.theTwoLoopCoil.value":
        "2匝线圈",
    "a11y.fieldStrengthPassingPattern.value":
        " {{fieldStrength}} 磁场穿过。",
    "a11y.fieldStrengthPassingCoilPattern.value":
        "{{strength}} 磁场穿过 {{coil}}。",
    "a11y.fieldStrengthPassingBothCoilsPattern.value":
        "{{strength}} 磁场穿过4匝和2匝线圈。",
    "a11y.circuitNowHasPattern.value":
        "电路现在有 {{coil}}。",
    "a11y.oneCoil.value":
        "一个线圈",
    "a11y.twoCoils.value":
        "两个不同的线圈",
    "a11y.numberOneCoil.value":
        "1个线圈",
    "a11y.numberTwoCoil.value":
        "2个线圈",
    "a11y.poleOnThePattern.value":
        "{{pole}} 极在磁铁的 {{side}}",
    "a11y.north.value":
        "北",
    "a11y.south.value":
        "南",
    "a11y.fieldLines.value":
        "磁场线",
    "a11y.fieldLinesDescriptionPattern.value":
        "磁场线从磁铁北端的 {{northSide}} 侧绕到南端的 {{southSide}} 侧。",
    "a11y.fieldLinesDescriptionUpdated.value":
        "磁场线描述已更新。",
    "a11y.fourLoopOnlyFieldStrengthPattern.value":
        "根据磁铁的位置，{{fieldStrength}} 磁场正在穿过4匝线圈。",
    "a11y.fieldStrengthIs.value":
        "磁铁磁场强度为：",
    "a11y.fieldStrengthPattern.value":
        "{{fieldStrength}} 于 {{coil}}",
    "a11y.slowly.value":
        "缓慢地",
    "a11y.normally.value":
        "正常地",
    "a11y.quickly.value":
        "快速地",
    "a11y.magnetSlidingAlertPattern.value":
        "磁铁正在 {{direction}} 滑动。按空格键停止。",
    "a11y.slidingStopped.value":
        "滑动已停止。",
    "a11y.left.value":
        "左侧",
    "a11y.right.value":
        "右侧",
    "a11y.magnetAtPositionPattern.value":
        "磁铁在 {{position}}。",
    "a11y.barMagnetPositionPattern.value":
        "条形磁铁在 {{areaPosition}}",
    "a11y.barMagnetIs.value":
        "条形磁铁在：",
    "a11y.positionOfPlayAreaPattern.value":
        "在游戏区的 {{position}}。",
    "a11y.barMagnetHelpText.value":
        "使用 W A S D 键向四个方向移动磁铁。使用 1 2 3 键左右滑动磁铁。",
    "a11y.magnetPositionAlertPattern.value":
        "磁铁在游戏区的 {{position}}。",
    "a11y.magnetPositionExtraAlertPattern.value":
        "磁铁在游戏区的 {{position}}。W A S D 和 1 2 3 键移动磁铁。",
    "a11y.slidingStoppedLinesInvisibleMagnetPositionPattern.value":
        "滑动已停止。{{magnetPosition}} {{coilProximity}}",
    "a11y.slidingStoppedLinesVisibleMagnetPositionPattern.value":
        "滑动已停止。{{magnetPosition}} {{coilProximity}} 磁场线描述已更新。",
    "a11y.touchingSideOfCoilPattern.value":
        "接触 {{coil}} 的 {{side}}。",
    "a11y.magnetPositionProximityPattern.value":
        "{{magnetPosition}} {{coilProximity}}",
    "a11y.topLeft.value":
        "左上",
    "a11y.topCenter.value":
        "上中",
    "a11y.topRight.value":
        "右上",
    "a11y.middleLeft.value":
        "左中",
    "a11y.center.value":
        "中心",
    "a11y.middleRight.value":
        "右中",
    "a11y.bottomLeft.value":
        "左下",
    "a11y.bottomCenter.value":
        "下中",
    "a11y.bottomRight.value":
        "右下",
    "a11y.edge.value":
        "边缘",
    "a11y.slidingAndPositionFourCoilPattern.value":
        "{{slidingAndPositionPhrase}} {{fourCoil}}",
    "a11y.slidingStoppedPositionPattern.value":
        "{{slidingStopped}} {{magnetPosition}}",
    "a11y.fourCoilTwoCoilFieldLinesPattern.value":
        "{{fourCoil}} {{twoCoilFieldLines}}",
    "a11y.twoCoilFieldLinesPattern.value":
        "{{twoCoil}} {{fieldLines}}",
    "a11y.slidingStoppedPositionFourCoilTwoCoilFieldLinesPattern.value":
        "{{slidingAndPositionPhrase}} {{fourCoil}} {{twoCoilFieldLines}}",
    "a11y.in.value":
        "在",
    "a11y.farFrom.value":
        "远离",
    "a11y.closeTo.value":
        "接近",
    "a11y.veryCloseTo.value":
        "非常接近",
    "a11y.exitingCoilPattern.value":
        "离开 {{coil}}",
    "a11y.noCoilPattern.value":
        "线圈不再在 {{direction}}",
    "a11y.coilToDirectionPattern.value":
        "{{coil}} 在 {{direction}}",
    "a11y.proximityToFourCoilPattern.value":
        "{{proximity}} 4匝线圈",
    "a11y.proximityToTwoCoilPattern.value":
        "{{proximity}} 2匝线圈",
    "a11y.bumpingCoilPattern.value":
        "碰撞 {{coil}} 线圈",
    "a11y.minimal.value":
        "最小",
    "a11y.veryWeak.value":
        "非常弱",
    "a11y.weak.value":
        "弱",
    "a11y.strong.value":
        "强",
    "a11y.veryStrong.value":
        "非常强",
    "a11y.fieldLinesVisibilityPattern.value":
        "磁场线{{visibility}}。",
    "a11y.hidden.value":
        "已隐藏",
    "a11y.visible.value":
        "可见",
    "a11y.voltmeterAlertPattern.value":
        "电压表{{attachmentState}}电路。",
    "a11y.connected.value":
        "已连接",
    "a11y.removed.value":
        "已断开",
    "a11y.flippingMagnetPattern.value":
        "磁铁已翻转。北极在 {{northSide}}。南极在 {{southSide}}。",
    "a11y.circuitMode.value":
        "电路模式",
    "a11y.fieldLinesDescription.value":
        "添加或移除磁场线。",
    "a11y.twoItemPattern.value":
        "{{first}} 和 {{second}}",
    "a11y.threeItemPattern.value":
        "{{first}}、{{second}} 和 {{third}}",
    "a11y.fourItemPattern.value":
        "{{first}}、{{second}}、{{third}} 和 {{fourth}}",
    "a11y.twoWordsPattern.value":
        "{{first}} {{second}}",
    "a11y.threeWordsPattern.value":
        "{{first}} {{second}} {{third}}",
    "a11y.twoWordsCommaPattern.value":
        "{{first}}、{{second}}",
    "a11y.a.value":
        "一个",
    "a11y.and.value":
        "和",

    # forces-and-motion-basics keyboardHelpDialog
    "keyboardHelpDialog.fromAnywhereInScreen.value":
        "在屏幕的任何位置",
    "keyboardHelpDialog.startGame.value":
        "开始拔河游戏",
    "keyboardHelpDialog.pauseGame.value":
        "暂停拔河游戏",
    "keyboardHelpDialog.returnCartToCenter.value":
        "将小车返回中心",
    "keyboardHelpDialog.pullerNavigation.value":
        "拉力者导航",
    "keyboardHelpDialog.selectPuller.value":
        "选择拉力者",
    "keyboardHelpDialog.grabPuller.value":
        "抓住选定的拉力者",
    "keyboardHelpDialog.moveGrabbedPuller.value":
        "移动已抓取的拉力者",
    "keyboardHelpDialog.dropPuller.value":
        "放下拉力者",
    "keyboardHelpDialog.objectNavigation.value":
        "物体导航",
    "keyboardHelpDialog.selectObject.value":
        "选择物体",
    "keyboardHelpDialog.grabObject.value":
        "抓住选定的物体",
    "keyboardHelpDialog.moveGrabbedObject.value":
        "移动已抓取的物体",
    "keyboardHelpDialog.dropObject.value":
        "放下物体",
    "keyboardHelpDialog.adjustAppliedForce.value":
        "调整推力",
    "keyboardHelpDialog.zeroAppliedForce.value":
        "将推力设为零",
    "keyboardHelpDialog.returnToToolbox.value":
        "返回工具箱",
    "keyboardHelpDialog.cancelMovement.value":
        "取消移动",

    # forces-and-motion-basics a11y
    "a11y.navigable.value":
        "可导航",
    "a11y.sortable.value":
        "可排序",
    "a11y.valuesCheckbox.checkedResponse.value":
        "数值已显示。",
    "a11y.valuesCheckbox.uncheckedResponse.value":
        "数值已隐藏。",
    "a11y.valuesCheckbox.accessibleHelpTextForce.value":
        "显示或隐藏力值。",
    "a11y.valuesCheckbox.accessibleHelpTextForceSpeed.value":
        "显示或隐藏力和速度值。",
    "a11y.valuesCheckbox.accessibleHelpTextForceSpeedAcceleration.value":
        "显示或隐藏力、速度和加速度值。",
    "a11y.speedCheckbox.accessibleHelpText.value":
        "显示或隐藏速度计。",
    "a11y.speedCheckbox.accessibleContextResponseUnchecked.value":
        "速度计已隐藏。",
    "a11y.preferences.netForcePullerColorControl.accessibleHelpText.value":
        "为拔河游戏选择队伍颜色。",
    "a11y.netForceScreen.screenButtonsHelpText.value":
        "探索拔河游戏中的净力。",
    "a11y.netForceScreen.colorName.value":
        "{ $color -> [blue] 蓝色 [red] 红色 [purple] 紫色 *[orange] 橙色 }",
    "a11y.netForceScreen.teamName.value":
        "{ $color -> [blue] 蓝队 [red] 红队 [purple] 紫队 *[orange] 橙队 }",
    "a11y.netForceScreen.screenSummary.playArea.description.value":
        "有一个 {{leftColor}} 队和 {{rightColor}} 队之间的拔河游戏，争夺一辆装满糖果的手推车。"
        "{{leftTeamName}} 拉力者在左侧，{{rightTeamName}} 拉力者在右侧。"
        "手推车放在平面上，两侧系有绳子。绳子上有结，拉力者可以抓住。"
        "有按钮可以开始或暂停拔河或将小车返回中心。",
    "a11y.netForceScreen.screenSummary.controlArea.description.value":
        "你可以开启合力、数值或速度显示。重置模拟器以重新开始。",
    "a11y.netForceScreen.screenSummary.currentDetails.accessibleNameNotStarted.value":
        "当前，拔河游戏尚未开始。",
    "a11y.netForceScreen.screenSummary.currentDetails.accessibleNameInProgress.value":
        "当前，拔河游戏进行中。",
    "a11y.netForceScreen.screenSummary.currentDetails.accessibleNameCompleted.value":
        "当前，拔河游戏已完成。",
    "a11y.netForceScreen.screenSummary.currentDetails.noPullersAttached.value":
        "没有拉力者连接到绳子上。",
    "a11y.netForceScreen.screenSummary.currentDetails.teamAttached.value":
        "{ $count -> [0] 没有 { a11y_netForceScreen_colorName } 拉力者在绳子上。"
        " [one] 有 { $count } 个 { a11y_netForceScreen_colorName } 拉力者在绳子上。"
        " *[other] 有 { $count } 个 { a11y_netForceScreen_colorName } 拉力者在绳子上。 }",
    "a11y.netForceScreen.screenSummary.interactionHint.value":
        "将拉力者放到绳结上以开始拔河游戏。",
    "a11y.netForceScreen.puller.accessibleName.value":
        "{ a11y_netForceScreen_puller_size } { a11y_netForceScreen_colorName } 拉力者 { $index }",
    "a11y.netForceScreen.puller.accessibleRoleDescription.value":
        "可导航",
    "a11y.netForceScreen.puller.size.value":
        "{ $size -> [small] 小 [medium] 中 *[large] 大 }",
    "a11y.netForceScreen.pullerGroup.accessibleRoleDescription.value":
        "组",
    "a11y.netForceScreen.pullerResponses.pullerAttachedToKnot.value":
        "{ a11y_netForceScreen_puller_accessibleName } 连接到 { $knotDescription }。",
    "a11y.netForceScreen.pullerResponses.pullerReturnedToToolbox.value":
        "{ a11y_netForceScreen_puller_accessibleName } 已返回工具箱。",
    "a11y.netForceScreen.pullerResponses.pullerInteractionCancelled.value":
        "{ a11y_netForceScreen_puller_accessibleName } 交互已取消。",
    "a11y.netForceScreen.returnButton.cartReturnedToCenter.value":
        "小车已返回中心。",
    "a11y.netForceScreen.returnButton.accessibleName.value":
        "返回小车",
    "a11y.netForceScreen.returnButton.accessibleHelpText.value":
        "将小车返回中心。",
    "a11y.netForceScreen.goPauseButton.accessibleHelpTextGo.value":
        "开始拔河游戏。",
    "a11y.netForceScreen.goPauseButton.accessibleHelpTextPause.value":
        "暂停拔河游戏。",
    "a11y.netForceScreen.goPauseButton.cartMovingLeft.value":
        "小车向左移动。",
    "a11y.netForceScreen.goPauseButton.cartMovingRight.value":
        "小车向右移动。",
    "a11y.netForceScreen.goPauseButton.cartStationary.value":
        "小车静止。",
    "a11y.netForceScreen.goPauseButton.cartPaused.value":
        "小车已暂停。",
    "a11y.netForceScreen.netForceControlPanel.sumOfForces.accessibleHelpText.value":
        "显示或隐藏合力箭头。",
    "a11y.netForceScreen.netForceControlPanel.sumOfForces.accessibleContextResponseUnchecked.value":
        "合力箭头已隐藏。",
    "a11y.netForceScreen.playAreaControls.accessibleHeading.value":
        "拔河控制",
    "a11y.motionScreen.motionScreenButtonsHelpText.value":
        "创建一堆物体并推动它们以探索运动。",
    "a11y.motionScreen.frictionScreenButtonsHelpText.value":
        "推动一堆物体时尝试摩擦力实验。",
    "a11y.motionScreen.accelerationScreenButtonsHelpText.value":
        "测量推动一堆物体时的加速度。",
    "a11y.motionScreen.screenSummary.playArea.motionDescription.value":
        "推车者站在平地上，准备向滑板车上的一堆物体施加力。物体可以从工具箱移到堆中。",
    "a11y.motionScreen.screenSummary.playArea.frictionDescription.value":
        "推车者站在平地上，准备向一堆物体施加力。物体可以从工具箱移到堆中。",
    "a11y.motionScreen.screenSummary.playArea.accelerationDescription.value":
        "推车者站在平地上，准备向一堆物体施加力。物体可以从工具箱移到堆中。",
    "a11y.motionScreen.screenSummary.controlArea.motionDescription.value":
        "你可以开启力、数值或测量工具。重置模拟器以重新开始。",
    "a11y.motionScreen.screenSummary.controlArea.frictionDescription.value":
        "你可以开启力、数值或测量工具。摩擦力滑块设置地面的粗糙度。重置模拟器以重新开始。",
    "a11y.motionScreen.screenSummary.currentDetails.summary.value":
        "{ $count -> [0] 当前，{ $surface } 上没有物体。"
        " [1] 当前，{ $surface } 上有1个物体。堆 { $motionState }。"
        " *[other] 当前，{ $surface } 上有 { $count } 个物体。堆 { $motionState }。 }",
    "a11y.motionScreen.screenSummary.interactionHint.value":
        "创建一堆物体并推动它们。",
    "a11y.motionScreen.stackMovement.stackMovingLeft.value":
        "堆向左移动。",
    "a11y.motionScreen.stackMovement.stackMovingRight.value":
        "堆向右移动。",
    "a11y.motionScreen.stackMovement.stackStationary.value":
        "堆静止。",
    "a11y.motionScreen.stackState.stationary.value":
        "静止",
    "a11y.motionScreen.stackState.movingRight.value":
        "向右移动",
    "a11y.motionScreen.stackState.movingLeft.value":
        "向左移动",
    "a11y.motionScreen.objects.objectAccessibleNameWithMass.value":
        "{ $objectName }，{ $mass }",
    "a11y.motionScreen.objects.massUnknown.value":
        "质量未知",
    "a11y.motionScreen.objects.names.fridge.value":
        "冰箱",
    "a11y.motionScreen.objects.names.crate1.value":
        "箱子 1",
    "a11y.motionScreen.objects.names.crate2.value":
        "箱子 2",
    "a11y.motionScreen.objects.names.girl.value":
        "女孩",
    "a11y.motionScreen.objects.names.man.value":
        "男人",
    "a11y.motionScreen.objects.names.trash.value":
        "垃圾桶",
    "a11y.motionScreen.objects.names.mystery.value":
        "神秘物体",
    "a11y.motionScreen.objects.names.bucket.value":
        "水桶",
    "a11y.motionScreen.objectToolbox.accessibleName.value":
        "物体工具箱",
    "a11y.motionScreen.objectToolbox.accessibleRoleDescription.value":
        "组",
    "a11y.motionScreen.objectToolbox.descriptionContent.value":
        "抓住物体。抓住后，使用键盘快捷键移动物体。",
    "a11y.motionScreen.objectStackGroup.onSkateboard.accessibleName.value":
        "滑板车上的物体",
    "a11y.motionScreen.objectStackGroup.onGround.accessibleName.value":
        "地面上的物体",
    "a11y.motionScreen.objectStackGroup.accessibleRoleDescription.value":
        "组",
    "a11y.motionScreen.objectStackGroup.descriptionContent.value":
        "抓住物体。抓住后，使用键盘快捷键移动物体。",
    "a11y.motionScreen.objectResponses.overToolbox.value":
        "在工具箱上方",
    "a11y.motionScreen.objectResponses.overStack.value":
        "在堆上方",
    "a11y.motionScreen.objectResponses.overSkateboard.value":
        "在滑板车上方",
    "a11y.motionScreen.objectResponses.overGround.value":
        "在地面上",
    "a11y.motionScreen.objectResponses.droppedOnStack.value":
        "放到堆上",
    "a11y.motionScreen.objectResponses.droppedOnStackBottomObjectReturned.value":
        "放到堆上。底部物体已返回工具箱。",
    "a11y.motionScreen.objectResponses.droppedOnSkateboard.value":
        "放到滑板车上",
    "a11y.motionScreen.objectResponses.droppedOnGround.value":
        "放到地面上",
    "a11y.motionScreen.objectResponses.returnedToToolbox.value":
        "已返回工具箱",
    "a11y.motionScreen.objectResponses.returnedToStack.value":
        "已返回堆",
    "a11y.motionScreen.surface.skateboard.value":
        "滑板车",
    "a11y.motionScreen.surface.ground.value":
        "地面",
    "a11y.motionScreen.stackList.stackedOnSurface.value":
        "{ $surface } 上的物体：",
    "a11y.motionScreen.stackList.noObjectsOnSurface.value":
        "{ $surface } 上没有物体。",
    "a11y.motionScreen.pusherResponses.fellDownAppliedForceZero.value":
        "推车者倒下，推力现在为0牛顿。",
    "a11y.motionScreen.motionControlPanel.forceCheckbox.accessibleHelpText.value":
        "显示或隐藏推力箭头。",
    "a11y.motionScreen.motionControlPanel.forceCheckbox.accessibleContextResponseChecked.value":
        "推力箭头已显示。",
    "a11y.motionScreen.motionControlPanel.forceCheckbox.accessibleContextResponseUnchecked.value":
        "推力箭头已隐藏。",
    "a11y.motionScreen.motionControlPanel.massesCheckbox.accessibleHelpText.value":
        "显示或隐藏物体的质量。",
    "a11y.motionScreen.motionControlPanel.massesCheckbox.accessibleContextResponseChecked.value":
        "质量值已显示。",
    "a11y.motionScreen.motionControlPanel.massesCheckbox.accessibleContextResponseUnchecked.value":
        "质量值已隐藏。",
    "a11y.motionScreen.motionControlPanel.stopwatchCheckbox.accessibleHelpText.value":
        "显示或隐藏秒表。",
    "a11y.motionScreen.motionControlPanel.stopwatchCheckbox.accessibleContextResponseChecked.value":
        "秒表已添加到游戏区。",
    "a11y.motionScreen.motionControlPanel.stopwatchCheckbox.accessibleContextResponseUnchecked.value":
        "秒表已从游戏区移除。",
    "a11y.motionScreen.motionControlPanel.forcesCheckbox.accessibleHelpText.value":
        "显示或隐藏推力和摩擦力箭头。",
    "a11y.motionScreen.motionControlPanel.forcesCheckbox.accessibleContextResponseChecked.value":
        "力箭头已显示。",
    "a11y.motionScreen.motionControlPanel.forcesCheckbox.accessibleContextResponseUnchecked.value":
        "力箭头已隐藏。",
    "a11y.motionScreen.motionControlPanel.sumOfForcesCheckbox.accessibleHelpText.value":
        "勾选以显示代表所有力的合力的箭头。",
    "a11y.motionScreen.motionControlPanel.sumOfForcesCheckbox.accessibleContextResponseUnchecked.value":
        "合力箭头已隐藏。",
    "a11y.motionScreen.motionControlPanel.accelerationCheckbox.accessibleHelpText.value":
        "显示或隐藏加速度计。",
    "a11y.motionScreen.motionControlPanel.accelerationCheckbox.accessibleContextResponseUnchecked.value":
        "加速度计已隐藏。",
    "a11y.motionScreen.playAreaControls.appliedForceControl.accessibleHeading.value":
        "推力控制",
    "a11y.motionScreen.playAreaControls.appliedForceControl.description.value":
        "设置推车者对堆施加的力。",
    "a11y.motionScreen.frictionSlider.accessibleHelpText.value":
        "设置静摩擦系数，范围从无到最大。",
    "a11y.motionScreen.frictionSlider.contextResponse.smoother.value":
        "地面更光滑。",
    "a11y.motionScreen.frictionSlider.contextResponse.rougher.value":
        "地面更粗糙。",
    "a11y.motionScreen.frictionSlider.contextResponse.icy.value":
        "地面结冰。",
    "a11y.objectToolboxes.objectToolbox.value":
        "物体工具箱",
    "a11y.objectToolboxes.skateboard.value":
        "滑板车上的堆",
    "a11y.objectToolboxes.stack.value":
        "堆",
    "a11y.pullers.pullerInstruction.value":
        "抓住拉力者。抓住后，使用键盘快捷键改变位置。绳结从左到右编号。",
    "a11y.pullers.overReturnToToolbox.value":
        "在工具箱上方",
    "a11y.pullers.overKnotDescription.value":
        "{ $side -> [left] 在左侧绳结 { $number -> [1] 1，距小车最远 [4] 4，距小车最近 *[other] { $number } } "
        "*[right] 在右侧绳结 { $number -> [1] 1，距小车最近 [4] 4，距小车最远 *[other] { $number } }",
    "a11y.pullers.knotDescription.value":
        "{ $side } 侧绳结 { $number }",
    "a11y.pullers.leftSide.value":
        "左侧",
    "a11y.pullers.rightSide.value":
        "右侧",
    "a11y.tugOfWar.heading.value":
        "糖果手推车拔河",
    "a11y.tugOfWar.list.leadingParagraph.value":
        "连接到绳子上的拉力者，从左到右：",
    "a11y.tugOfWar.noPullersOnRope.value":
        "绳子上没有拉力者",
    "a11y.tugOfWar.knotOccupied.value":
        "{ $side } 侧绳结 { $number }：{ $pullerName }",
    "a11y.forces.netForceScreenHeading.value":
        "手推车上的力",
    "a11y.forces.motionScreensHeading.value":
        "堆上的力",
    "a11y.forces.appliedForceArrow.value":
        "推力箭头 { $description }，指向 { $direction }",
    "a11y.forces.frictionForceArrow.value":
        "摩擦力箭头 { $description }，指向 { $direction }",
    "a11y.forces.leftForceArrow.value":
        "向左的力箭头 { $description }",
    "a11y.forces.rightForceArrow.value":
        "向右的力箭头 { $description }",
    "a11y.forces.sumOfForcesArrow.value":
        "合力箭头 { $description }，指向 { $direction }",
    "a11y.forces.sumOfForcesZero.value":
        "合力为0",
    "a11y.forces.noForcesDisplayed.value":
        "未显示任何力。",
    "a11y.forces.quantitativeDescription.value":
        "{ $forceMagnitude -> [one] { $forceMagnitude } 牛顿 *[other] { $forceMagnitude } 牛顿 }",
    "a11y.forces.qualitativeDescriptions.verySmall.value":
        "非常小",
    "a11y.forces.qualitativeDescriptions.small.value":
        "小",
    "a11y.forces.qualitativeDescriptions.medium.value":
        "中等",
    "a11y.forces.qualitativeDescriptions.somewhatLarge.value":
        "有些大",
    "a11y.forces.qualitativeDescriptions.large.value":
        "大",
    "a11y.forces.qualitativeDescriptions.veryLarge.value":
        "非常大",
    "a11y.forces.qualitativeDescriptions.extremelyLarge.value":
        "极其大",
    "a11y.forces.qualitativeDescriptions.left.value":
        "向左",
    "a11y.forces.qualitativeDescriptions.right.value":
        "向右",
    "a11y.speed.heading.value":
        "速度",
    "a11y.speed.cartSpeed.value":
        "小车速度 { $speedDescription }。",
    "a11y.speed.cartSpeedWithAcceleration.value":
        "小车速度 { $speedDescription }，{ $accelerationDescription }。",
    "a11y.speed.speedOnly.value":
        "速度 { $speedDescription }。",
    "a11y.speed.speedOnlyWithAcceleration.value":
        "速度 { $speedDescription }，{ $accelerationDescription }。",
    "a11y.speed.speedWithValue.value":
        "速度 { $speedDescription }，为 { $speedMetersPerSecond -> "
        "[one] { $speedMetersPerSecond } 米每秒 *[other] { $speedMetersPerSecond } 米每秒 }。",
    "a11y.speed.speedWithValueAndAcceleration.value":
        "速度 { $speedDescription }，{ $accelerationDescription }，"
        "为 { $speedMetersPerSecond -> [one] { $speedMetersPerSecond } 米每秒 "
        "*[other] { $speedMetersPerSecond } 米每秒 }。",
    "a11y.speed.qualitativeDescriptions.stationary.value":
        "零",
    "a11y.speed.qualitativeDescriptions.verySlow.value":
        "非常慢",
    "a11y.speed.qualitativeDescriptions.slow.value":
        "慢",
    "a11y.speed.qualitativeDescriptions.moderate.value":
        "中等",
    "a11y.speed.qualitativeDescriptions.fast.value":
        "快",
    "a11y.speed.qualitativeDescriptions.veryFast.value":
        "非常快",
    "a11y.speed.qualitativeDescriptions.extremelyFast.value":
        "极快",
    "a11y.acceleration.heading.value":
        "加速度",
    "a11y.acceleration.accelerationOnly.value":
        "加速度 { $accelerationDescription }。",
    "a11y.acceleration.accelerationWithValue.value":
        "加速度 { $accelerationDescription }，"
        "为 { $accelerationMetersPerSecondSquared -> "
        "[one] { $accelerationMetersPerSecondSquared } 米每二次方秒 "
        "*[other] { $accelerationMetersPerSecondSquared } 米每二次方秒 }。",
    "a11y.acceleration.accelerationWithDirection.value":
        "加速度 { $accelerationDescription }，向 { $direction }。",
    "a11y.acceleration.accelerationWithDirectionAndValue.value":
        "加速度 { $accelerationDescription }，向 { $direction }，"
        "为 { $accelerationMetersPerSecondSquared -> "
        "[one] { $accelerationMetersPerSecondSquared } 米每二次方秒 "
        "*[other] { $accelerationMetersPerSecondSquared } 米每二次方秒 }。",
    "a11y.acceleration.qualitativeDescriptions.zero.value":
        "零",
    "a11y.acceleration.qualitativeDescriptions.verySmall.value":
        "非常小",
    "a11y.acceleration.qualitativeDescriptions.small.value":
        "小",
    "a11y.acceleration.qualitativeDescriptions.moderate.value":
        "中等",
    "a11y.acceleration.qualitativeDescriptions.large.value":
        "大",
    "a11y.acceleration.qualitativeDescriptions.veryLarge.value":
        "非常大",
    "a11y.acceleration.qualitativeDescriptions.extremelyLarge.value":
        "极其大",
    "a11y.acceleration.qualitativeDescriptions.left.value":
        "向左",
    "a11y.acceleration.qualitativeDescriptions.right.value":
        "向右",
    "a11y.acceleration.accelerationDescriptions.speedingUp.value":
        "加速",
    "a11y.acceleration.accelerationDescriptions.slowingDown.value":
        "减速",

    # friction a11y
    "a11y.chemistryBook.value":
        "化学书",
    "a11y.zoomedInChemistryBook.value":
        "放大视图的化学书",
    "a11y.grabButtonHelpText.value":
        "寻找抓取按钮。抓住后，使用键盘快捷键移动书或放大视图的书。",
    "a11y.moveBookWith.value":
        "使用方向键或W、A、S、D键向上、左、下、右移动已抓取的书或放大视图的书。",
    "a11y.moveInSmallerStepsWith.value":
        "使用Shift加方向键或Shift加W、A、S、D键缓慢移动。",
    "a11y.initialKeyboardGrabbedNotTouching.value":
        "已抓住。轻触物理书。使用W、A、S或D键移动书。按空格键释放。",
    "a11y.initialTouchGrabbedNotTouching.value":
        "已抓住。轻触物理书。拖动手指移动书。抬起手指释放。",
    "a11y.initialKeyboardGrabbedTouching.value":
        "已抓住。使用A或D键快或慢摩擦。按空格键释放。",
    "a11y.initialTouchGrabbedTouching.value":
        "已抓住。左右拖动快或慢摩擦。抬起手指释放。",
    "a11y.lightlyOnPhysicsBook.value":
        "轻触物理书。",
    "a11y.moveDownToRubHarder.value":
        "向下移动以用力摩擦。",
    "a11y.grabbedNotTouchingPattern.value":
        "{{grabbedOnBook}} {{moveDownToRubHarder}}",
    "a11y.rubFastOrSlow.value":
        "快或慢摩擦。",
    "a11y.grabbedPattern.value":
        "已抓住。{{alert}}",
    "a11y.amountOfAtoms.sentence.value":
        "化学书有 {{comparisonAmount}} 个抖动原子，{{breakAwayAmount}} 已脱离。{{space}}",
    "a11y.amountOfAtoms.fewer.value":
        "更少",
    "a11y.amountOfAtoms.farFewer.value":
        "少很多",
    "a11y.amountOfAtoms.some.value":
        "一些",
    "a11y.amountOfAtoms.many.value":
        "很多",
    "a11y.jiggle.jiggleALot.value":
        "剧烈抖动",
    "a11y.jiggle.jiggleALittle.value":
        "轻微抖动",
    "a11y.jiggle.jiggleABit.value":
        "微微抖动",
    "a11y.jiggle.jigglingLess.value":
        "抖动减少",
    "a11y.jiggle.less.value":
        "更少",
    "a11y.jiggle.evenLess.value":
        "更少",
    "a11y.temperature.superHot.value":
        "极热",
    "a11y.temperature.capitalizedVeryHot.value":
        "非常热",
    "a11y.temperature.veryHot.value":
        "非常热",
    "a11y.temperature.hot.value":
        "热",
    "a11y.temperature.atWarm.value":
        "温暖",
    "a11y.temperature.atCool.value":
        "凉爽",
    "a11y.temperature.thermometerPattern.value":
        "表面温度为 {{temp}}",
    "a11y.temperature.pattern.value":
        "表面温度温度计为 {{temp}}",
    "a11y.temperature.more.value":
        "更多",
    "a11y.temperature.faster.value":
        "更快",
    "a11y.temperature.evenFaster.value":
        "更快",
    "a11y.temperature.superFast.value":
        "极快",
    "a11y.temperature.evenCooler.value":
        "更凉爽",
    "a11y.temperature.cooler.value":
        "更凉爽",
    "a11y.temperature.nowCooler.value":
        "现在更凉爽",
    "a11y.temperature.warmer.value":
        "更温暖",
    "a11y.temperature.evenHotter.value":
        "更热",
    "a11y.temperature.nowHotter.value":
        "现在更热",
    "a11y.screenSummary.summarySentencePattern.value":
        "{{chemistryBookString}} {{jiggleTemperatureScaleSentence}}",
    "a11y.screenSummary.droppingAsAtomsJiggleLess.value":
        "随着原子抖动减少而下降",
    "a11y.screenSummary.atomsJigglePattern.value":
        "原子 {{jiggleAmount}}",
    "a11y.screenSummary.jiggleClausePattern.value":
        "且 {{jiggleAmount}}",
    "a11y.screenSummary.jiggleTemperatureScaleSentence.value":
        "在书本接触处的放大视图中，{{temperatureClause}}，{{jigglingClause}}。",
    "a11y.screenSummary.grabChemistryBookPlay.value":
        "抓住化学书开始体验。",
    "a11y.screenSummary.continueRubbing.value":
        "抓住化学书用力或轻摩擦。",
    "a11y.screenSummary.startingChemistryBookPattern.value":
        "{{relativeChemistryBookSentence}}化学书静止在物理书上，准备与其摩擦。",
    "a11y.screenSummary.startingChemistryBookLightlyPattern.value":
        "{{relativeChemistryBookSentence}}化学书轻放在物理书上，准备与其摩擦。",
    "a11y.moveDownToRubHarderSentence.value":
        "向下移动以用力摩擦。",
    "a11y.resetSimMoreObservationSentence.value":
        "重置模拟器以进行更多观察。",
    "a11y.atomsJiggleTinyBitTempCool.value":
        "原子微微抖动，温度凉爽。",
    "a11y.frictionIncreasingAtomsJigglingTemperaturePattern.value":
        "抖动 {{jigglingAmount}}，{{temperature}}。",
    "a11y.frictionIncreasingAtomsJigglingTemperatureFirstPattern.value":
        "原子 {{jigglingAmount}}，温度 {{temperature}}。",
    "a11y.breakAwaySentenceFirst.value":
        "{{temp}}。原子从化学书上脱离。",
    "a11y.breakAwaySentenceAgain.value":
        "{{temp}}。更多原子脱离。",
    "a11y.breakAwayNoneLeft.value":
        "{{temp}}。原子剧烈抖动。",
    "a11y.readMeOverview.value":
        "摩擦力是一个互动模拟器。它会随着你的操作而变化。"
        "准备好体验摩擦力了吗？有一摞大教科书准备就绪。"
        "在书本接触处的放大视图中，你可以观察到原子抖动和温度的变化。",

    # graphing-quadratics a11y + keyboard
    "keyboardHelpDialog.pointToolShortcuts.value":
        "点工具快捷键",
    "keyboardHelpDialog.moveOffGrid.value":
        "移出网格",
    "keyboardHelpDialog.jumpToNextCurve.value":
        "跳转到下一条曲线",
    "a11y.standardFormEquation.value":
        "y等于ax平方加bx加c",
    "a11y.vertexFormEquation.value":
        "y等于a乘以括号x减h括号的平方加k",
    "a11y.focusAndDirectrixFormEquation.value":
        "y等于1除以4p乘以括号x减h括号的平方加k",
    "a11y.allScreens.screenSummary.controlArea.value":
        "此外，可以访问可移动的坐标点工具，并重置模拟器以重新开始。\n",
    "a11y.allScreens.screenSummary.currentDetails.value":
        "当前，坐标网格中有一条抛物线，绘制了方程控制中的函数。",
    "a11y.allScreens.screenSummary.currentDetailsEmpty.value":
        "当前，坐标网格内容为空。",
    "a11y.allScreens.screenSummary.interactionHint.value":
        "调整方程系数和常数以开始改变抛物线的形状或位置，"
        "或继续阅读了解更多详情。",
    "a11y.exploreScreen.screenButtonsHelpText.value":
        "通过操作标准式中二次函数系数创建自定义抛物线。",
    "a11y.exploreScreen.screenSummary.playArea.value":
        "有一个方程控制面板用于调整方程 {{equation}} 中的系数值，"
        "一个单独的二次项面板，以及一个坐标网格。"
        "方程控制允许你操作二次函数。图形区域显示活跃曲线。",
    "a11y.exploreScreen.equationAccordionBox.accessibleHelpText.value":
        "调整方程 {{equation}} 中a、b和c的值。",
    "a11y.standardFormScreen.screenButtonsHelpText.value":
        "探索抛物线特征及其与标准式中二次函数的关系。",
    "a11y.standardFormScreen.screenSummary.playArea.value":
        "有一个方程控制面板用于调整方程 {{equation}} 中的系数值，"
        "用于关键抛物线特征的可见性复选框，以及一个坐标网格。"
        "方程控制允许你操作二次函数。图形区域显示活跃的抛物线和抛物线特征。",
    "a11y.standardFormScreen.equationAccordionBox.accessibleHelpText.value":
        "调整方程 {{equation}} 中a、b和c的值。",
    "a11y.vertexFormScreen.screenButtonsHelpText.value":
        "探索抛物线特征及其与顶点式中二次函数的关系。",
    "a11y.vertexFormScreen.screenSummary.playArea.value":
        "有一个方程控制面板用于调整方程 {{equation}} 中的系数值，"
        "用于关键抛物线特征的可见性复选框，以及一个坐标网格。"
        "方程控制允许你操作二次函数。图形区域显示活跃的抛物线和抛物线特征。",
    "a11y.vertexFormScreen.equationAccordionBox.accessibleHelpText.value":
        "调整方程 {{equation}} 中a、h和k的值。",
    "a11y.focusAndDirectrixScreen.screenButtonsHelpText.value":
        "探索抛物线与其焦点和准线之间的关系。",
    "a11y.focusAndDirectrixScreen.screenSummary.playArea.value":
        "有一个方程控制面板用于调整方程 {{equation}} 中的系数值，"
        "用于关键抛物线特征的可见性复选框，以及一个坐标网格。"
        "方程控制允许你操作二次函数。图形区域显示活跃的抛物线和抛物线特征。",
    "a11y.focusAndDirectrixScreen.equationAccordionBox.accessibleHelpText.value":
        "调整方程 {{equation}} 中p、h和k的值。",
    "a11y.equationAccordionBox.accessibleName.value":
        "方程控制",
    "a11y.quadraticTermsAccordionBox.accessibleHelpTextCollapsed.value":
        "分别绘制二次函数的每一项。",
    "a11y.graphContentsToggleButton.accessibleNameOn.value":
        "隐藏图形内容",
    "a11y.graphContentsToggleButton.accessibleNameOff.value":
        "显示图形内容",
    "a11y.graphContentsToggleButton.accessibleHelpText.value":
        "显示或隐藏图形区域中的抛物线和抛物线特征。",
    "a11y.graphContentsToggleButton.accessibleContextResponseHidden.value":
        "图形内容已隐藏。",
    "a11y.graphContentsToggleButton.accessibleContextResponseShown.value":
        "图形内容已显示。",
    "a11y.saveButton.accessibleName.value":
        "保存抛物线",
    "a11y.saveButton.accessibleHelpText.value":
        "将当前抛物线保存到网格并继续探索主抛物线。已保存的抛物线不可交互。",
    "a11y.saveButton.accessibleContextResponse.value":
        "当前抛物线已保存到网格。",
    "a11y.eraseButton.accessibleName.value":
        "擦除已保存的抛物线",
    "a11y.eraseButton.accessibleContextResponse.value":
        "已保存的抛物线已擦除。",
    "a11y.vertexManipulator.accessibleName.value":
        "顶点",
    "a11y.vertexManipulator.accessibleHelpText.value":
        "调整抛物线的顶点。",
    "a11y.vertexManipulator.accessibleObjectResponse.value":
        "{{x}} {{y}}",
    "a11y.focusManipulator.accessibleName.value":
        "焦点",
    "a11y.focusManipulator.accessibleHelpText.value":
        "调整抛物线的焦点和准线。",
    "a11y.focusManipulator.accessibleObjectResponse.value":
        "{{x}} {{y}}",
    "a11y.pointOnParabolaManipulator.accessibleName.value":
        "抛物线上的点",
    "a11y.pointOnParabolaManipulator.accessibleHelpText.value":
        "探索抛物线上的xy有序对。",
    "a11y.pointOnParabolaManipulator.accessibleObjectResponse.value":
        "{{x}} {{y}}",
    "a11y.pointToolNode.accessibleObjectResponseXY.value":
        "{{x}} {{y}}",
    "a11y.pointToolNode.accessibleObjectResponseXYCurveName.value":
        "{{x}} {{y}} 在 {{curveName}} 上",
    "a11y.pointToolNode.accessibleObjectResponseOffGrid.value":
        "网格外",
    "a11y.pointToolNode.keyboardHelp.value":
        "使用J跳转到下一条曲线，K移出网格。",
    "a11y.leftPointToolNode.accessibleName.value":
        "左手点工具",
    "a11y.leftPointToolNode.accessibleHelpText.value":
        "放置在网格中获取xy坐标。工具左侧有手柄，右侧有探头。{{keyboardHelp}}",
    "a11y.rightPointToolNode.accessibleName.value":
        "右手点工具",
    "a11y.rightPointToolNode.accessibleHelpText.value":
        "放置在网格中获取xy坐标。工具右侧有手柄，左侧有探头。{{keyboardHelp}}",
    "a11y.quadraticTermCheckbox.accessibleName.value":
        "y等于ax平方",
    "a11y.quadraticTermCheckbox.accessibleHelpText.value":
        "显示或隐藏二次项的图形。",
    "a11y.quadraticTermCheckbox.accessibleContextResponseChecked.value":
        "二次项已绘图。",
    "a11y.quadraticTermCheckbox.accessibleContextResponseUnchecked.value":
        "二次项未绘图。",
    "a11y.linearTermCheckbox.accessibleName.value":
        "y等于bx",
    "a11y.linearTermCheckbox.accessibleHelpText.value":
        "显示或隐藏一次项的图形。",
    "a11y.linearTermCheckbox.accessibleContextResponseChecked.value":
        "一次项已绘图。",
    "a11y.linearTermCheckbox.accessibleContextResponseUnchecked.value":
        "一次项未绘图。",
    "a11y.constantTermCheckbox.accessibleName.value":
        "y等于c",
    "a11y.constantTermCheckbox.accessibleHelpText.value":
        "显示或隐藏常数项的图形。",
    "a11y.constantTermCheckbox.accessibleContextResponseChecked.value":
        "常数项已绘图。",
    "a11y.constantTermCheckbox.accessibleContextResponseUnchecked.value":
        "常数项未绘图。",
    "a11y.equationsCheckbox.accessibleHelpText.value":
        "显示或隐藏标注曲线的方程。",
    "a11y.equationsCheckbox.accessibleContextResponseChecked.value":
        "曲线已用方程标注。",
    "a11y.equationsCheckbox.accessibleContextResponseUnchecked.value":
        "曲线未用方程标注。",
    "a11y.vertexManipulatorCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线上的可移动顶点。",
    "a11y.vertexManipulatorCheckbox.accessibleContextResponseChecked.value":
        "顶点已显示。",
    "a11y.vertexManipulatorCheckbox.accessibleContextResponseUnchecked.value":
        "顶点已隐藏。",
    "a11y.vertexPointCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线上的顶点。",
    "a11y.vertexPointCheckbox.accessibleContextResponseChecked.value":
        "顶点已显示。",
    "a11y.vertexPointCheckbox.accessibleContextResponseUnchecked.value":
        "顶点已隐藏。",
    "a11y.axisOfSymmetryCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线的对称轴。",
    "a11y.axisOfSymmetryCheckbox.accessibleContextResponseChecked.value":
        "对称轴已显示。",
    "a11y.axisOfSymmetryCheckbox.accessibleContextResponseUnchecked.value":
        "对称轴已隐藏。",
    "a11y.rootsCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线的根（如果有实根的话）。",
    "a11y.rootsCheckbox.accessibleContextResponseChecked.value":
        "根已显示（如为实数）。",
    "a11y.rootsCheckbox.accessibleContextResponseUnchecked.value":
        "根已隐藏。",
    "a11y.coordinatesCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线特征的坐标。",
    "a11y.coordinatesCheckbox.accessibleContextResponseChecked.value":
        "坐标已显示。",
    "a11y.coordinatesCheckbox.accessibleContextResponseUnchecked.value":
        "坐标已隐藏。",
    "a11y.focusCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线的可移动焦点。",
    "a11y.focusCheckbox.accessibleContextResponseChecked.value":
        "焦点已显示。",
    "a11y.focusCheckbox.accessibleContextResponseUnchecked.value":
        "焦点已隐藏。",
    "a11y.directrixCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线的准线。",
    "a11y.directrixCheckbox.accessibleContextResponseChecked.value":
        "准线已显示。",
    "a11y.directrixCheckbox.accessibleContextResponseUnchecked.value":
        "准线已隐藏。",
    "a11y.pointOnParabolaCheckbox.accessibleHelpText.value":
        "显示或隐藏抛物线上的可移动点。",
    "a11y.pointOnParabolaCheckbox.accessibleContextResponseChecked.value":
        "抛物线上的点已显示。",
    "a11y.pointOnParabolaCheckbox.accessibleContextResponseUnchecked.value":
        "抛物线上的点已隐藏。",
    "a11y.aSlider.accessibleName.value":
        "a，x平方的系数",
    "a11y.aSlider.accessibleHelpText.value":
        "调整方程中二次项的系数。",
    "a11y.bSlider.accessibleName.value":
        "b，x的系数",
    "a11y.bSlider.accessibleHelpText.value":
        "调整方程中一次项的系数。",
    "a11y.cSlider.accessibleName.value":
        "c，常数项",
    "a11y.cSlider.accessibleHelpText.value":
        "调整方程中的常数项。",
    "a11y.pSlider.accessibleName.value":
        "p，距离值",
    "a11y.pSlider.accessibleHelpText.value":
        "调整顶点与焦点之间的距离。",
    "a11y.hSlider.accessibleName.value":
        "h，顶点的x坐标",
    "a11y.kSlider.accessibleName.value":
        "k，顶点的y坐标",
    "a11y.aPicker.accessibleName.value":
        "a，x平方的系数",
    "a11y.aPicker.accessibleHelpText.value":
        "调整方程中二次项的系数。",
    "a11y.bPicker.accessibleName.value":
        "b，x的系数",
    "a11y.bPicker.accessibleHelpText.value":
        "调整方程中一次项的系数。",
    "a11y.cPicker.accessibleName.value":
        "c，常数项",
    "a11y.cPicker.accessibleHelpText.value":
        "调整方程中的常数项。",
    "a11y.hPicker.accessibleName.value":
        "h，顶点的x坐标",
    "a11y.kPicker.accessibleName.value":
        "k，顶点的y坐标",
    "a11y.accessibleHeadings.graphAreaHeading.value":
        "图形区域",
    "a11y.accessibleHeadings.parabolaFeaturesHeading.value":
        "抛物线特征",
    "a11y.standardFormEquationNode.accessibleParagraph.value":
        "y等于{{a}}x平方加{{b}}x加{{c}}",
    "a11y.vertexFormEquationNode.accessibleParagraph.value":
        "y等于{{a}}乘以括号x减{{h}}括号的平方加{{k}}",
    "a11y.focusAndDirectrixFormEquationNode.accessibleParagraph.value":
        "y等于分子为1分母为4乘以{{p}}的分数乘以括号x减{{h}}括号的平方加{{k}}",
    "a11y.graphAreaCurrentlyContains.value":
        "图形区域当前包含：",
    "a11y.contentsOfGraphAreaAreHidden.value":
        "图形区域内容已隐藏。",
    "a11y.primaryParabola.value":
        "主抛物线",
    "a11y.primaryParabolaAtEquation.value":
        "主抛物线在 {{equation}}",
    "a11y.savedParabola.value":
        "已保存的抛物线",
    "a11y.savedParabolaAtEquation.value":
        "已保存的抛物线在 {{equation}}",
    "a11y.quadraticTerm.value":
        "二次项",
    "a11y.quadraticTermAtEquation.value":
        "二次项在 {{equation}}",
    "a11y.linearTerm.value":
        "一次项",
    "a11y.linearTermAtEquation.value":
        "一次项在 {{equation}}",
    "a11y.constantTerm.value":
        "常数项",
    "a11y.constantTermAtEquation.value":
        "常数项在 {{equation}}",
    "a11y.axisOfSymmetryAtEquation.value":
        "对称轴在 {{equation}}",
    "a11y.directrixAtEquation.value":
        "准线在 {{equation}}",
    "a11y.vertexAtCoordinates.value":
        "顶点在 {{x}} {{y}}",
    "a11y.movableVertex.value":
        "可移动顶点",
    "a11y.movableVertexAtCoordinates.value":
        "可移动顶点在 {{x}} {{y}}",
    "a11y.movableFocus.value":
        "可移动焦点",
    "a11y.movableFocusAtCoordinates.value":
        "可移动焦点在 {{x}} {{y}}",
    "a11y.movablePointOnParabola.value":
        "抛物线上的可移动点",
    "a11y.movablePointOnParabolaAtCoordinates.value":
        "抛物线上的可移动点在 {{x}} {{y}}",
    "a11y.rootsAtCoordinates1.value":
        "根在 {{x}} {{y}}",
    "a11y.rootsAtCoordinates2.value":
        "根在 {{x1}} {{y1}} 和 {{x2}} {{y2}}",
    "a11y.equals.value":
        "等于",
    "a11y.plus.value":
        "加",
    "a11y.minus.value":
        "减",
    "a11y.times.value":
        "乘",
    "a11y.squared.value":
        "平方",
    "a11y.negative.value":
        "负",
    "a11y.openParen.value":
        "左括号",
    "a11y.closeParen.value":
        "右括号",

    # gravity-force-lab-basics a11y
    "a11y.screenSummary.playAreaOverviewPattern.value":
        "{{playArea}}两个质量球，一个标记为物体1的蓝色球和一个标记为物体2的红色球。"
        "一个力箭头从每个球的中心开始，指向另一个球。",
    "a11y.screenSummary.playAreaControls.value":
        "球可以沿一条看不见的轨道相互靠近或远离移动。每个球的质量可以增加或减少。"
        "每个球被一个机器人固定在位置上。",
    "a11y.screenSummary.secondaryDescriptionPattern.value":
        "{{controlArea}}，复选框改变显示的内容和它们的行为，还有一个按钮重置模拟器。",
    "a11y.screenSummary.basicsSimStateLabel.value":
        "当前，物体1受到物体2的力与物体2受到物体1的力大小相等、方向相反。",
    "a11y.screenSummary.thePlayAreaHas.value":
        "游戏区有",
    "a11y.screenSummary.inTheControlArea.value":
        "控制区中",
    "a11y.distanceCheckboxHelpText.value":
        "以千米为单位测量球之间的距离。",
    "a11y.massBillionsPattern.value":
        "{{mass}} 十亿",
    "a11y.kilometer.value":
        "千米",
    "a11y.kilometers.value":
        "千米",
    "a11y.distanceArrowVisible.value":
        "以千米为单位测量距离。",
    "a11y.distanceArrowRemoved.value":
        "距离测量已隐藏。",
    "a11y.forceArrowsCapitalized.value":
        "力箭头",
    "a11y.forceArrows.value":
        "力箭头",
    "a11y.arrows.value":
        "箭头",
    "a11y.massControlsHelpTextBillions.value":
        "以十亿千克为单位改变球的质量。",
    "a11y.massControlsHelpTextDensityBillions.value":
        "以十亿千克每单位体积为单位改变球的密度。",
    "a11y.forceArrowCapitalized.value":
        "力箭头",
    "a11y.sizeOfForce.value":
        "力的大小",
    "a11y.voicing.voicingToolbar.overviewPattern.value":
        "{{simDescription}} {{playArea}} {{spheres}} {{controls}}",
    "a11y.voicing.voicingToolbar.detailsPattern.value":
        "{{simState}} {{force}} {{distance}} {{mass}} {{robot}}",
    "a11y.voicing.voicingToolbar.thereAre.value":
        "有",
    "a11y.voicing.voicingToolbar.inAddition.value":
        "此外",
    "a11y.voicing.distanceKilometersPattern.value":
        "{{distance}} 千米",
    "a11y.voicing.changeMassHintResponse.value":
        "以十亿千克为单位改变质量。",
    "a11y.voicing.massControlReadingBlockPattern.value":
        "{{label}}，{{value}}",
    "a11y.voicing.distanceArrowReadingBlockNameResponse.value":
        "将球相互靠近或远离移动。",
    "a11y.voicing.forceValuesHintResponse.value":
        "探索有或无数值时的力变化",
    "a11y.voicing.distanceHintResponse.value":
        "探索有或无精确距离时的球位置",
    "a11y.voicing.constantSizeHintResponse.value":
        "探索有或无球大小变化时的质量变化",
    "a11y.voicing.forceValuesShownResponse.value":
        "以牛顿显示",
    "a11y.voicing.forceValuesHiddenResponse.value":
        "已隐藏",
    "a11y.voicing.distanceShownResponse.value":
        "以千米测量",
    "a11y.voicing.distanceHiddenResponse.value":
        "测量已隐藏",
    "a11y.voicing.constantSizeSetResponse.value":
        "设置在球上",
    "a11y.voicing.constantSizeNotSetResponse.value":
        "不再设置",

    # gravity-force-lab a11y
    "a11y.screenSummary.playAreaOverview.value":
        "游戏区有两个质量球，一个标记为m1的蓝色球和一个标记为m2的红色球。"
        "一个力向量箭头从每个球的中心开始，指向另一个球。",
    "a11y.screenSummary.playAreaControls.value":
        "球可以沿一条测量过的轨道相互靠近或远离移动。每个球的质量可以增加或减少。"
        "每个球被一个机器人固定在位置上。可选地，可以使用可移动的标尺来测量球心之间的距离。",
    "a11y.screenSummary.secondaryDescription.value":
        "在控制区，有改变力的表示和质量表示的选项，还有一个按钮重置模拟器。",
    "a11y.screenSummary.simStateListLabel.value":
        "当前，m1受到m2的力与m2受到m1的力大小相等、方向相反。",
    "a11y.screenSummary.massValuesAndComparisonSummaryPattern.value":
        "{{mass1Label}} 的质量为 {{m1Mass}} 千克，"
        "{{comparativeValue}} {{mass2Label}} 的 {{m2Mass}} 千克。",
    "a11y.blueSpherePattern.value":
        "{{objectLabel}}，蓝色球",
    "a11y.redSpherePattern.value":
        "{{objectLabel}}，红色球",
    "a11y.sizeAndDistancePattern.value":
        "{{size}}，{{relativeSize}} {{otherObjectLabel}}，以及 {{distance}}。",
    "a11y.sizePattern.value":
        "{{thisObjectLabel}} 为 {{massValue}} 千克",
    "a11y.micronewtons.value":
        "微牛顿",
    "a11y.mass.value":
        "质量",
    "a11y.qualitative.objectsRelativeSizePattern.value":
        "{{firstObjectLabel}} {{relativeSize}} {{secondObjectLabel}}。",
    "a11y.qualitative.massAndUnitPattern.value":
        "{{massValue}} 千克",
    "a11y.qualitative.massAndForceClausesPattern.value":
        "{{massClause}}，{{forceClause}}。",
    "a11y.qualitative.massChangeClausePattern.value":
        "随着 {{changeDirectionPhrase}}",
    "a11y.qualitative.massChangesAndMovesClausePattern.value":
        "随着 {{changeDirectionPhrase}} 并向 {{leftOrRight}} 移动",
    "a11y.qualitative.massChangesMovesOtherClausePattern.value":
        "随着 {{changeDirectionPhrase}} 并使 {{otherObjectLabel}} 向 {{leftOrRight }} 移动",
    "a11y.sentencePattern.value":
        "{{sentence}}。",
    "a11y.relativeMassSize.muchMuchSmallerThan.value":
        "小很多很多",
    "a11y.relativeMassSize.halfTheSizeOf.value":
        "大小是...的一半",
    "a11y.relativeMassSize.muchSmallerThan.value":
        "小很多",
    "a11y.relativeMassSize.smallerButComparableTo.value":
        "小但与...相当",
    "a11y.relativeMassSize.sameSizeAs.value":
        "与...大小相同",
    "a11y.relativeMassSize.largerButComparableTo.value":
        "大但与...相当",
    "a11y.relativeMassSize.muchLargerThan.value":
        "大很多",
    "a11y.relativeMassSize.twiceTheSizeOf.value":
        "大小是...的两倍",
    "a11y.relativeMassSize.muchMuchLargerThan.value":
        "大很多很多",
    "a11y.relativeMassSizeCapitalized.muchMuchSmallerThan.value":
        "小很多很多",
    "a11y.relativeMassSizeCapitalized.halfTheSizeOf.value":
        "大小是...的一半",
    "a11y.relativeMassSizeCapitalized.muchSmallerThan.value":
        "小很多",
    "a11y.relativeMassSizeCapitalized.smallerButComparableTo.value":
        "小但与...相当",
    "a11y.relativeMassSizeCapitalized.sameSizeAs.value":
        "与...大小相同",
    "a11y.relativeMassSizeCapitalized.largerButComparableTo.value":
        "大但与...相当",
    "a11y.relativeMassSizeCapitalized.muchLargerThan.value":
        "大很多",
    "a11y.relativeMassSizeCapitalized.twiceTheSizeOf.value":
        "大小是...的两倍",
    "a11y.relativeMassSizeCapitalized.muchMuchLargerThan.value":
        "大很多很多",
    "a11y.relativeMassDensity.notDenseComparedTo.value":
        "密度不如",
    "a11y.relativeMassDensity.halfAsDenseAs.value":
        "密度是...的一半",
    "a11y.relativeMassDensity.muchLessDenseThan.value":
        "密度小很多",
    "a11y.relativeMassDensity.lessDenseButComparableTo.value":
        "密度小但与...相当",
    "a11y.relativeMassDensity.asDenseAs.value":
        "密度与...相同",
    "a11y.relativeMassDensity.denseButComparableTo.value":
        "密度大但与...相当",
    "a11y.relativeMassDensity.muchDenseThan.value":
        "密度大很多",
    "a11y.relativeMassDensity.twiceAsDenseAs.value":
        "密度是...的两倍",
    "a11y.relativeMassDensity.extremelyDenseComparedTo.value":
        "密度远大于",
    "a11y.relativeMassDensityCapitalized.notDenseComparedTo.value":
        "密度不如",
    "a11y.relativeMassDensityCapitalized.halfAsDenseAs.value":
        "密度是...的一半",
    "a11y.relativeMassDensityCapitalized.muchLessDenseThan.value":
        "密度小很多",
    "a11y.relativeMassDensityCapitalized.lessDenseButComparableTo.value":
        "密度小但与...相当",
    "a11y.relativeMassDensityCapitalized.asDenseAs.value":
        "密度与...相同",
    "a11y.relativeMassDensityCapitalized.denseButComparableTo.value":
        "密度大但与...相当",
    "a11y.relativeMassDensityCapitalized.muchDenseThan.value":
        "密度大很多",
    "a11y.relativeMassDensityCapitalized.twiceAsDenseAs.value":
        "密度是...的两倍",
    "a11y.relativeMassDensityCapitalized.extremelyDenseComparedTo.value":
        "密度远大于",
    "a11y.propertyChange.massGetsSmaller.value":
        "质量变小",
    "a11y.propertyChange.massGetsBigger.value":
        "质量变大",
    "a11y.propertyChange.densityIncreases.value":
        "密度增加",
    "a11y.propertyChange.densityDecreases.value":
        "密度减少",
    "a11y.controls.massControlsLabel.value":
        "质量控制",
    "a11y.controls.massControlsHelpText.value":
        "以千克为单位改变球的质量。",
    "a11y.controls.massControlsHelpTextDensity.value":
        "以千克每单位体积为单位改变球的密度。",
    "a11y.controls.constantSizeCheckboxHelpText.value":
        "改变质量时保持球的大小不变。",
    "a11y.controls.constantRadiusThinkDensityPattern.value":
        "{{mass1}} 和 {{mass2}} 设置为相同大小。",
    "a11y.controls.massMaxMinBorderTextWithForce.value":
        "{{relativeSize}} {{otherObjectLabel}}，{{forceVectorSize}}，力 {{force}} {{unit}}。",
    "a11y.controls.massMaxMinBorderTextWithoutForce.value":
        "{{relativeSize}} {{otherObjectLabel}}，{{forceVectorSize}}。",
    "a11y.keyboardHelp.moveSphereDescription.value":
        "使用左和右方向键左右移动球。",
    "a11y.keyboardHelp.moveInSmallerStepsDescription.value":
        "使用Shift加左和右方向键以更小步幅移动。",
    "a11y.keyboardHelp.moveInLargerStepsDescription.value":
        "使用Page Up和Page Down键以更大步幅移动。",
    "a11y.keyboardHelp.jumpToLeftDescription.value":
        "使用Home键跳转到左侧。",
    "a11y.keyboardHelp.jumpToRightDescription.value":
        "使用End键跳转到右侧。",
    "a11y.keyboardHelp.changeMassPDOM.value":
        "使用左和右方向键改变质量。",
    "a11y.keyboardHelp.changeMassBasicsPDOM.value":
        "使用上和下方向键改变质量。",
    "a11y.keyboardHelp.changeMassInLargerStepsDescription.value":
        "使用Page Up和Page Down键以更大步幅改变质量。",
    "a11y.keyboardHelp.changeMassInSmallerStepsDescription.value":
        "使用Shift加左和右方向键以更小步幅改变质量。",
    "a11y.keyboardHelp.jumpToMaximumMassDescription.value":
        "使用End键跳转到最大质量。",
    "a11y.keyboardHelp.jumpToMinimumMassDescription.value":
        "使用Home键跳转到最小质量。",
    "a11y.keyboardHelp.moveGrabbedRulerPDOM.value":
        "使用方向键或W、A、S、D键向上、左、下、右移动已抓取的标尺。",
    "a11y.keyboardHelp.moveInSmallerStepsPDOM.value":
        "使用Shift加方向键或Shift加W、A、S、D键以更小步幅移动。",
    "a11y.keyboardHelp.jumpStartOfSpherePDOM.value":
        "使用J加C键将标尺起点跳转到m1球中心。",
    "a11y.keyboardHelp.jumpHomePDOM.value":
        "使用J加H键将标尺释放到初始位置。",
    "a11y.ruler.regionAndDistancePattern.value":
        "{{verticalRegion}} {{centersApart}}",
    "a11y.ruler.releaseAndExploreHint.value":
        "释放标尺以探索球的位置和质量。",
    "a11y.ruler.grabbedAlertPattern.value":
        "已抓住。{{regionAndDistance}} {{supplementalHint}}",
    "a11y.ruler.hintPattern.value":
        "{{playHint}} {{releaseHint}}",
    "a11y.ruler.grabbedJumpKeyboardHint.value":
        "按住J加C键将标尺跳转到m1中心。",
    "a11y.ruler.jumpCenterKeyboardHint.value":
        "按住J加H键将标尺释放到初始位置。",
    "a11y.ruler.gestureHint.value":
        "拖动手指移动标尺。抬起手指释放。",
    "a11y.ruler.keyboardReleaseHint.value":
        "按空格键释放。",
    "a11y.ruler.jumpCenterMassAlert.value":
        "标尺零点位于 {{object1}} 中心。{{centersApart}} {{supplementalHint}}",
    "a11y.ruler.positions.coveringM2.value":
        "覆盖m2的力向量。",
    "a11y.ruler.positions.coveringM1.value":
        "覆盖m1的力向量。",
    "a11y.ruler.positions.justAboveCenters.value":
        "刚好在中心上方。",
    "a11y.ruler.positions.coveringCenters.value":
        "覆盖中心。",
    "a11y.ruler.positions.justBelowCenters.value":
        "刚好在中心下方。",
    "a11y.ruler.positions.inHomePosition.value":
        "在质量球下方的初始位置。",
    "a11y.ruler.positions.behindMassControls.value":
        "在质量控制后方。",
    "a11y.voicing.briefPositionChangeInteractionPattern.value":
        "{{valueText}}。{{forceAlert}}",
    "a11y.voicing.briefMassChangeForceAlertWithValuePattern.value":
        "力{{forceChange}}，现在{{value}}牛顿。",
    "a11y.voicing.briefMassChangeForceAlertPattern.value":
        "力{{forceChange}}。",
    "a11y.voicing.briefDensityChangeForceAlertPattern.value":
        "{{densityChange}}密度，{{forceChange}}力。",
    "a11y.voicing.briefNewForcePattern.value":
        "力现在为{{value}}牛顿。",
    "a11y.voicing.briefMassPushAlertPattern.value":
        "{{object1}} 使 {{object2}} 向 {{direction}} 移动。{{forceAlert}}",
    "a11y.voicing.briefMassChangeWithPushAlertPattern.value":
        "{{pushAlert}} {{forceAlert}}",
    "a11y.voicing.briefMassChangeAlertPattern.value":
        "{{propertyChange}} {{forceChange}}",
    "a11y.voicing.biggerCapitalized.value":
        "更大",
    "a11y.voicing.smallerCapitalized.value":
        "更小",
    "a11y.voicing.more.value":
        "更多",
    "a11y.voicing.less.value":
        "更少",
    "a11y.voicing.levels.distanceArrowPattern.value":
        "{{distance}} 千米",
}

def make_entry(value):
    return {"value": value, "history": []}


for proj in projects:
    en_file = os.path.join(BASE, proj, f"{proj}-strings_en.json")
    zh_file = os.path.join(BASE, "babel", proj, f"{proj}-strings_zh_CN.json")

    with open(en_file, encoding="utf-8") as f:
        en_data = json.load(f)
    with open(zh_file, encoding="utf-8") as f:
        zh_data = json.load(f)

    # Flatten both EN and ZH to {flat_key: entry} format
    en_flat = flatten_to_leaf_paths(en_data)
    zh_flat = flatten_to_leaf_paths(zh_data)

    added = 0
    updated = 0
    for flat_key in sorted(en_flat.keys()):
        # TRANSLATIONS keys include ".value" suffix, but flat_key doesn't
        trans_key = flat_key + ".value"
        has_trans = trans_key in TRANSLATIONS

        if flat_key not in zh_flat:
            # New key - add with translation
            en_entry = en_flat[flat_key]
            en_val = en_entry.get("value", "")
            zh_val = TRANSLATIONS.get(trans_key, en_val) if has_trans else en_val
            zh_flat[flat_key] = make_entry(zh_val)
            added += 1
        elif has_trans:
            # Existing key - check if value needs update
            zh_entry = zh_flat[flat_key]
            zh_val = zh_entry.get("value", "")
            # If current value is English (matches EN) and we have a Chinese translation, update it
            en_val = en_flat[flat_key].get("value", "")
            if zh_val == en_val and TRANSLATIONS[trans_key] != en_val:
                zh_flat[flat_key] = make_entry(TRANSLATIONS[trans_key])
                updated += 1

    print(f"\n{proj}: {len(zh_flat)} total entries, {added} added, {updated} updated")

    # Rebuild nested dict from flat
    new_zh = unflatten(zh_flat)

    with open(zh_file, "w", encoding="utf-8") as f:
        json.dump(new_zh, f, ensure_ascii=False, indent=2)

print("\nAll done!")
