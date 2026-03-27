#!/usr/bin/env python3
"""
Script to translate untranslated entries in zh_CN.json files.
This handles both flat and nested JSON structures.
"""

import json
import os
import re
import glob
import sys
import copy

sys.stdout.reconfigure(encoding='utf-8')

# Translation dictionary for known untranslated entries
TRANSLATIONS = {
    # ===== energy-skate-park =====
    # Nested format entries
    "energy-skate-park": {
        "energies.energy": "能量",
        "energies.kinetic": "动能",
        "energies.potential": "势能",
        "energies.thermal": "热能",
        "energies.total": "总计",
        "speedometer.label": "速度",
        "speedometer.metersPerSecondPattern": "{{value}} m/s",
        "heightLabels.heightEqualsZero": "高度 = 0",
        "plots.positionLabel": "位置 (m)",
        "plots.energyLabel": "能量 (J)",
        "plots.timeLabel": "时间 (s)",
        "physicalControls.friction": "摩擦力",
        "physicalControls.gravityControls.moon": "月球",
        "physicalControls.gravityControls.earth": "地球",
        "physicalControls.gravityControls.jupiter": "木星",
        "physicalControls.gravityControls.gravity": "重力",
        "physicalControls.gravityControls.gravityMetersPerSecondSquaredPattern": "{{value}} m/s²",
        "physicalControls.gravityControls.gravityNewtonsPerKilogramPattern": "{{value}} N/kg",
        "physicalControls.tiny": "极小",
        "physicalControls.massControls.mass": "质量",
        "physicalControls.massControls.massKilogramsPattern": "{{value}} kg",
        "physicalControls.small": "小",
        "physicalControls.large": "大",
        "physicalControls.custom": "自定义",
        "physicalControls.lots": "很多",
        "physicalControls.none": "无",
        "energy-skate-park.title": "能量滑板竞技场",
        "screens.graphs": "图表",
        "screens.intro": "介绍",
        "screens.measure": "测量",
        "screens.playground": "游乐场",
        "pathSensor.heightMetersPattern": "高度 = {{value}} m",
        "pathSensor.speedMetersPerSecondPattern": "速度 = {{value}} m/s",
        "keyboardHelpDialog.attachToTrack": "附着到最近的轨道",
        "keyboardHelpDialog.connectTrackEndpoints.cancel": "4. 取消",
        "keyboardHelpDialog.connectTrackEndpoints.label": "连接轨道端点",
        "keyboardHelpDialog.connectTrackEndpoints.moveThroughOptions": "2. 切换选项",
        "keyboardHelpDialog.connectTrackEndpoints.selectOption": "3. 选择选项",
        "keyboardHelpDialog.connectTrackEndpoints.showOptions": "1. 显示选项",
        "keyboardHelpDialog.cutTrackAtControlPoint": "在控制点处切断轨道",
        "keyboardHelpDialog.deleteControlPoint": "删除控制点",
        "keyboardHelpDialog.grabOrRelease": "抓取或释放",
        "keyboardHelpDialog.graphCursorControls": "图形光标控件",
        "keyboardHelpDialog.moveAlongTrack": "沿轨道移动",
        "keyboardHelpDialog.moveToEndOfTrack": "跳到轨道末端",
        "keyboardHelpDialog.moveToStartOfTrack": "跳到轨道起点",
        "keyboardHelpDialog.removeFromToolbox": "从工具箱中取出",
        "keyboardHelpDialog.restartSkater": "重新开始滑板者",
        "keyboardHelpDialog.scrubThroughData": "浏览数据",
        "keyboardHelpDialog.skaterControls": "移动或跳跃已抓取的滑板者",
        "keyboardHelpDialog.stopwatchAndMeasuringTapeControls": "秒表和卷尺控件",
        "keyboardHelpDialog.togglePause": "暂停或播放",
        "keyboardHelpDialog.trackControls": "轨道控件",
        "preferences.accelerationUnits": "加速度单位",
        "preferences.accelerationUnitsDescription": "选择重力控件中显示的单位。",
        "preferences.metersPerSecondSquared": "m/s²",
        "preferences.newtonsPerKilogram": "N/kg",
    },
    
    # ===== energy-skate-park-basics =====
    "energy-skate-park-basics": {
        "screen.friction": "摩擦力",
        "screen.introduction": "介绍",
        "screen.trackPlayground": "游乐场",
    },
    
    # ===== energy-forms-and-changes =====
    "energy-forms-and-changes": {
        "energy-forms-and-changes.title": "能量的形式与转化",
        "generator": "发电机",
    },
    
    # ===== graphing-quadratics =====
    "graphing-quadratics": {
        "screen.explore": "探索",
        "screen.focusAndDirectrix": "焦点和准线",
        "screen.standardForm": "标准形式",
        "screen.vertexForm": "顶点形式",
    },
    
    # ===== faradays-law =====
    "faradays-law": {
        "keyboardHelpDialog.autoSlideGrabbedBarMagnet": "自动滑动已抓取的条形磁铁",
        "keyboardHelpDialog.autoSlideGrabbedBarMagnetText": "自动水平滑动已抓取的<br>磁铁并切换<br>滑动方向",
        "keyboardHelpDialog.autoSlideGrabbedBarMagnetWith": "使用数字键1、2或3自动水平滑动已抓取的磁铁并切换滑动方向。",
    },
    
    # ===== circuit-construction-kit-black-box-study =====
    "circuit-construction-kit-black-box-study": {
        "circuit-construction-kit-black-box-study.title": "电路组建实验：黑箱",
    },
    
    # ===== circuit-construction-kit-common =====
    "circuit-construction-kit-common": {
        "resistanceOhmsValuePattern": "{{resistance}} 欧姆",
        "voltageVoltsValuePattern": "{{voltage}} 伏特",
        "resistanceOhms": "{{resistance}} 欧姆",
    },
    
    # ===== forces-and-motion-basics =====
    "forces-and-motion-basics": {
        "pattern.0valueUnitsNewtons": "{0} 牛顿",
    },
    
    # ===== calculus-grapher =====
    "calculus-grapher": {
        "curveManipulatorKeyboardCue": "按住以<b>抓取</b>或<b>释放</b>曲线",
    },
    
    # ===== rutherford-scattering =====
    "rutherford-scattering": {
        "translation.credits": "Hudielan",  # This is a name, keep as is
        "a11y.screenSummary.rutherfordAtom.playArea": "一个可以向薄箔发射α粒子的粒子源。观察窗口显示箔的高度放大视图。您可以调整α粒子的能量以及构成箔中原子的质子和中子数量。",
        "a11y.screenSummary.rutherfordAtom.controlArea": "您可以在原子尺度和核尺度视图之间切换。有暂停按钮和逐步观察按钮，以及重置模拟的按钮。",
        "a11y.screenSummary.rutherfordAtom.interactionHint": "打开α粒子源以开始观察。",
        "a11y.screenSummary.plumPuddingAtom.playArea": "一个可以向薄箔发射α粒子的粒子源。观察窗口显示箔的高度放大视图。您可以调整α粒子的能量。",
        "a11y.screenSummary.plumPuddingAtom.controlArea": "有暂停按钮和逐步观察按钮，以及重置模拟的按钮。",
        "a11y.screenSummary.plumPuddingAtom.interactionHint": "打开α粒子源以开始观察。",
        "a11y.observationWindow": "观察窗口",
        "a11y.atomSpaceDescription": "显示箔的原子尺度视图。可以看到五个紧密排列的原子的部分，场景中可见三个原子核。",
        "a11y.nucleusSpaceDescription": "显示箔的核尺度视图。可以看到一个原子核，其中包含代表性数量的质子和中子。",
        "a11y.toggleAlphaParticle": "α粒子源",
        "a11y.alphaParticlesHelpText": "启动和停止α粒子流。",
        "a11y.alphaParticleSettings": "α粒子设置",
        "a11y.energySliderDescription": "调整α粒子流中粒子的能量。",
        "a11y.energy": "能量",
        "a11y.traces": "轨迹",
        "a11y.traceCheckboxDescription": "观察带有或不带有轨迹的粒子流。",
        "a11y.atomSettings": "原子设置",
        "a11y.protonsValuePattern": "质子",
        "a11y.protonSliderDescription": "调整箔中每个原子的质子数。",
        "a11y.neutronsValuePattern": "中子",
        "a11y.neutronSliderDescription": "调整箔中每个原子的中子数。",
        "a11y.atomicScaleView": "原子尺度",
        "a11y.nuclearScaleView": "核尺度",
        "a11y.switchScale": "实验视图",
        "a11y.switchScaleDescription": "在核尺度或原子尺度下观察实验。",
    },
}

def get_nested_value(data, key_path):
    """Get a value from nested dict using dot-separated key path"""
    keys = key_path.split(".")
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current

def set_nested_value(data, key_path, value):
    """Set a value in nested dict using dot-separated key path"""
    keys = key_path.split(".")
    current = data
    for key in keys[:-1]:
        if key not in current:
            return False
        current = current[key]
    
    last_key = keys[-1]
    if last_key in current:
        if isinstance(current[last_key], dict) and "value" in current[last_key]:
            current[last_key]["value"] = value
            return True
        elif isinstance(current[last_key], dict):
            # Navigate deeper - the value might be in a nested "value" key
            return False
    return False

def process_translations(filepath, project_name, translations):
    """Apply translations to a file"""
    changes = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  Error reading {filepath}: {e}")
        return changes
    
    modified = False
    
    for key_path, new_value in translations.items():
        # Try flat key first
        if key_path in data:
            entry = data[key_path]
            if isinstance(entry, dict) and "value" in entry:
                old_value = entry["value"]
                # Only translate if the current value is in English (not already translated)
                has_chinese = bool(re.search(r'[\u4e00-\u9fff]', old_value))
                if not has_chinese or old_value != new_value:
                    # Check if it's actually untranslated
                    if not has_chinese and old_value != new_value:
                        entry["value"] = new_value
                        changes.append((key_path, old_value, new_value))
                        modified = True
        else:
            # Try nested key
            result = set_nested_value(data, key_path, new_value)
            if result:
                # Verify the change
                nested = get_nested_value(data, key_path)
                if isinstance(nested, dict) and "value" in nested:
                    old_value = "?"  # We already changed it
                    changes.append((key_path, "(nested)", new_value))
                    modified = True
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
    
    return changes

def main():
    babel_dir = "babel"
    total_changes = 0
    
    for project_name, translations in TRANSLATIONS.items():
        # Find the zh_CN file for this project
        pattern = os.path.join(babel_dir, project_name, f"*_zh_CN.json")
        files = glob.glob(pattern)
        
        if not files:
            print(f"WARNING: No zh_CN file found for {project_name}")
            continue
        
        filepath = files[0]
        print(f"\nProcessing: {filepath}")
        
        changes = process_translations(filepath, project_name, translations)
        
        if changes:
            for key_path, old_value, new_value in changes:
                print(f"  TRANSLATED: {key_path}: '{old_value}' -> '{new_value}'")
            total_changes += len(changes)
        else:
            print(f"  No changes needed")
    
    print(f"\n{'='*80}")
    print(f"Total translations applied: {total_changes}")

if __name__ == "__main__":
    main()