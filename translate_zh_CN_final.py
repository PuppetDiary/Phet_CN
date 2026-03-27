#!/usr/bin/env python3
"""Final fixes for remaining untranslated entries in zh_CN.json files."""

import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

FIXES = {
    "energy-skate-park": {
        "energy-skate-park.title.value": "能量滑板竞技场",
        "screens.graphs.value": "图表",
        "screens.intro.value": "介绍",
        "screens.measure.value": "测量",
        "screens.playground.value": "游乐场",
    },
    "rutherford-scattering": {
        "a11y.protonsPerAtomValuePattern.value": "每个原子的质子数 { $protons }",
        "a11y.neutronsPerAtomValuePattern.value": "每个原子的中子数 { $neutrons }",
    },
    "wave-on-a-string": {
        "lots.value": "很多",
    },
}


def set_nested_value(data, key_path, value):
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