#!/usr/bin/env python3
"""Verify all zh_CN.json files: check for untranslated entries and keyboard key names."""

import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Keyboard key names that should remain in English
KEYBOARD_KEYS = {
    "Tab", "Shift", "Alt", "Enter", "Space", "Fn", "Home", "End", "Esc",
    "Caps Lock", "Page Up", "Page Down", "Pg Up", "Pg Dn",
    "Backspace", "Delete", "Ctrl", "Option",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
}

# Chinese translations of keyboard keys that should NOT appear
WRONG_KEY_TRANSLATIONS = {
    "空格": "Space",
    "输入": "Enter",
    "退出": "Esc",
    "删除": "Delete",
    "返回": "Backspace",
    "主页": "Home",
    "结束": "End",
    "选择": "Option",
    "锁定大写": "Caps Lock",
    "上翻页": "Page Up",
    "下翻页": "Page Down",
    "制表符": "Tab",
    "换挡": "Shift",
}

# Patterns that are NOT untranslated (false positives)
FALSE_POSITIVE_PATTERNS = [
    r'^[A-Za-z]$',  # Single letters (a, b, c, x, y, etc.)
    r'^[A-Z]{1,3}$',  # Short abbreviations (N, S, E, J, etc.)
    r'^\?$',  # Question mark
    r'^[0-9.]+\s*(m|kg|J|N|s|m/s|m/s²|N/kg|ohms|volts)$',  # Units
    r'^\{[{0-9]',  # Pattern strings like {0}, {{value}}
    r'^[a-z]+://',  # URLs
    r'^<',  # HTML tags
    r'^\$\{',  # Template literals
    r'^[A-Za-z0-9_.]+@',  # Email addresses
    r'^https?://',  # URLs
    r'^\w+\.\w+$',  # File names
    r'^[A-Z][a-z]+(₂|₃|⁺|⁻|²|³)',  # Chemical formulas
    r'^(CO₂|O₂|H₂O|Na⁺|Cl⁻|NO₃⁻)',  # Specific chemical formulas
    r'^\d+\s*[A-Za-z]',  # Number + unit patterns
]

# Keys whose values are expected to be in English (units, symbols, etc.)
EXPECTED_ENGLISH_KEYS = [
    "units.", "abbreviation", "symbol", "pattern", "credits",
    "energyChunkLabel", "coordinateUnknown", "unknownValueIndicator",
]


def is_likely_english(text):
    """Check if text appears to be untranslated English."""
    if not text or len(text.strip()) == 0:
        return False
    
    # Check false positive patterns
    for pattern in FALSE_POSITIVE_PATTERNS:
        if re.match(pattern, text.strip()):
            return False
    
    # Check if it contains Chinese characters
    if re.search(r'[\u4e00-\u9fff]', text):
        return False
    
    # Check if it's mostly ASCII letters (likely English)
    ascii_letters = sum(1 for c in text if c.isascii() and c.isalpha())
    if ascii_letters >= 3:
        # Has at least 3 ASCII letters and no Chinese - likely untranslated
        return True
    
    return False


def is_expected_english_key(key_path):
    """Check if this key is expected to have English value."""
    for pattern in EXPECTED_ENGLISH_KEYS:
        if pattern in key_path:
            return True
    return False


def check_keyboard_keys(key_path, value):
    """Check if a keyboard key name has been incorrectly translated."""
    issues = []
    
    # Only check key.* entries in scenery-phet
    if "key." in key_path.lower() or "keyboardhelpdialog" in key_path.lower():
        for chinese, english in WRONG_KEY_TRANSLATIONS.items():
            if chinese in value:
                issues.append(f"  KEYBOARD KEY ISSUE: {key_path} contains '{chinese}' (should be '{english}')")
    
    return issues


def extract_values(data, prefix=""):
    """Extract all value entries from the JSON structure."""
    results = []
    
    if isinstance(data, dict):
        if "value" in data and isinstance(data["value"], str):
            results.append((prefix, data["value"]))
        
        for key, val in data.items():
            if key in ("history",):
                continue
            new_prefix = f"{prefix}.{key}" if prefix else key
            results.extend(extract_values(val, new_prefix))
    
    return results


def main():
    babel_dir = "babel"
    
    untranslated_entries = []
    keyboard_issues = []
    total_files = 0
    total_entries = 0
    
    for project_dir in sorted(os.listdir(babel_dir)):
        project_path = os.path.join(babel_dir, project_dir)
        if not os.path.isdir(project_path):
            continue
        
        for filename in os.listdir(project_path):
            if not filename.endswith("_zh_CN.json"):
                continue
            
            filepath = os.path.join(project_path, filename)
            total_files += 1
            
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            entries = extract_values(data)
            total_entries += len(entries)
            
            for key_path, value in entries:
                # Check for untranslated English
                if is_likely_english(value) and not is_expected_english_key(key_path):
                    untranslated_entries.append((filepath, key_path, value))
                
                # Check for incorrectly translated keyboard keys
                issues = check_keyboard_keys(key_path, value)
                for issue in issues:
                    keyboard_issues.append((filepath, issue))
    
    # Report
    print(f"Scanned {total_files} files, {total_entries} entries")
    print()
    
    if untranslated_entries:
        print(f"=== POTENTIALLY UNTRANSLATED ENTRIES ({len(untranslated_entries)}) ===")
        current_file = ""
        for filepath, key_path, value in untranslated_entries:
            if filepath != current_file:
                current_file = filepath
                print(f"\n  {filepath}:")
            print(f"    {key_path}: '{value}'")
    else:
        print("=== NO UNTRANSLATED ENTRIES FOUND ===")
    
    print()
    
    if keyboard_issues:
        print(f"=== KEYBOARD KEY NAME ISSUES ({len(keyboard_issues)}) ===")
        for filepath, issue in keyboard_issues:
            print(f"  {filepath}: {issue}")
    else:
        print("=== NO KEYBOARD KEY NAME ISSUES FOUND ===")
    
    print()
    print(f"Summary: {len(untranslated_entries)} untranslated, {len(keyboard_issues)} keyboard issues")


if __name__ == "__main__":
    main()