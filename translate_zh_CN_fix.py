#!/usr/bin/env python3
"""Fix remaining untranslated nested-format entries in zh_CN.json files."""

import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Fixes: { project_dir: { nested_key_path: new_value } }
# nested_key_path uses dots to navigate the JSON structure
FIXES = {
    "energy-skate-park-basics": {
        "screen.friction.value": "摩擦",
        "screen.introduction.value": "介绍",
        "screen.trackPlayground.value": "轨道游乐场",
    },
    "energy-forms-and-changes": {
        "energy-forms-and-changes.title.value": "能的形式与变化",
    },
    "graphing-quadratics": {
        "screen.explore.value": "探索",
        "screen.focusAndDirectrix.value": "焦点和准线",
        "screen.standardForm.value": "标准形式",
        "screen.vertexForm.value": "顶点形式",
    },
    "faradays-law": {
        "keyboardHelpDialog.autoSlideGrabbedBarMagnet.value": "自动滑动抓取的条形磁铁",
        "keyboardHelpDialog.autoSlideGrabbedBarMagnetText.value": "自动水平滑动抓取的<br>磁铁并切换<br>滑动方向",
        "keyboardHelpDialog.autoSlideGrabbedBarMagnetWith.value": "使用数字键 1、2 或 3 自动水平滑动抓取的磁铁并切换滑动方向。",
    },
    "forces-and-motion-basics": {
        "pattern.0valueUnitsNewtons.value": "{0} 牛顿",
        "pattern.0massUnitsKilograms.value": "{0} kg",
        "pattern.0name.1valueUnitsAcceleration.value": "{0}: {1} m/s²",
        "pattern.0name.1valueUnitsVelocity.value": "{0} m/s",
        "pattern.0valueUnitsN.value": "{0}N",
    },
}


def set_nested_value(data, key_path, value):
    """Set a value in a nested dict using dot-separated key path."""
    keys = key_path.split(".")
    current = data
    for key in keys[:-1]:
        if key not in current:
            return False
        current = current[key]
    final_key = keys[-1]
    if final_key in current:
        old_value = current[final_key]
        if old_value != value:
            current[final_key] = value
            return True
    return False


def get_nested_value(data, key_path):
    """Get a value from a nested dict using dot-separated key path."""
    keys = key_path.split(".")
    current = data
    for key in keys:
        if key not in current:
            return None
        current = current[key]
    return current


def main():
    babel_dir = "babel"
    total_fixes = 0

    for project, fixes in FIXES.items():
        # Find the zh_CN file
        project_dir = os.path.join(babel_dir, project)
        if not os.path.isdir(project_dir):
            print(f"WARNING: Directory not found: {project_dir}")
            continue

        zh_file = None
        for f in os.listdir(project_dir):
            if f.endswith("_zh_CN.json"):
                zh_file = os.path.join(project_dir, f)
                break

        if not zh_file:
            print(f"WARNING: No zh_CN file found in {project_dir}")
            continue

        print(f"\nProcessing: {zh_file}")

        with open(zh_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        changes = 0
        for key_path, new_value in fixes.items():
            old_value = get_nested_value(data, key_path)
            if old_value is None:
                print(f"  KEY NOT FOUND: {key_path}")
                continue

            if old_value == new_value:
                print(f"  ALREADY OK: {key_path} = '{new_value}'")
                continue

            if set_nested_value(data, key_path, new_value):
                print(f"  FIXED: {key_path}: '{old_value}' -> '{new_value}'")
                changes += 1
            else:
                print(f"  NO CHANGE: {key_path}")

        if changes > 0:
            with open(zh_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            total_fixes += changes
            print(f"  Saved {changes} fixes")
        else:
            print(f"  No changes needed")

    print(f"\n{'='*80}")
    print(f"Total fixes applied: {total_fixes}")


if __name__ == "__main__":
    main()