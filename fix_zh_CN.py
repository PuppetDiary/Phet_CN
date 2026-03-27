#!/usr/bin/env python3
"""
Script to fix zh_CN translation files in the babel folder:
1. Fix keyboard key names that were incorrectly translated to Chinese
2. Identify untranslated English entries and output to a report file
"""

import json
import os
import re
import glob
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Keyboard key names that should NOT be translated - they should keep their English key names
KEYBOARD_KEY_FIXES = {
    "key.tab": "Tab",
    "key.shift": "Shift",
    "key.alt": "Alt",
    "key.option": "Option",
    "key.capsLock": "Caps Lock",
    "key.enter": "Enter",
    "key.return": "Return",
    "key.backspace": "Backspace",
    "key.delete": "Delete",
    "key.space": "Space",
    "key.esc": "Esc",
    "key.fn": "Fn",
    "key.pageUp": "Pg Up",
    "key.pageDown": "Pg Dn",
    "key.home": "Home",
    "key.end": "End",
    "key.a": "A",
    "key.b": "B",
    "key.c": "C",
    "key.d": "D",
    "key.e": "E",
    "key.f": "F",
    "key.g": "G",
    "key.h": "H",
    "key.i": "I",
    "key.j": "J",
    "key.k": "K",
    "key.l": "L",
    "key.m": "M",
    "key.n": "N",
    "key.o": "O",
    "key.p": "P",
    "key.q": "Q",
    "key.r": "R",
    "key.s": "S",
    "key.t": "T",
    "key.u": "U",
    "key.v": "V",
    "key.w": "W",
    "key.x": "X",
    "key.y": "Y",
    "key.z": "Z",
    "key.zero": "0",
    "key.one": "1",
    "key.two": "2",
    "key.three": "3",
    "key.four": "4",
    "key.five": "5",
    "key.six": "6",
    "key.seven": "7",
    "key.eight": "8",
    "key.nine": "9",
}

def is_keyboard_key_entry(key):
    """Check if a JSON key represents a keyboard key name"""
    return key.startswith("key.")

def fix_keyboard_key_value(key, value):
    """Fix keyboard key values that were incorrectly translated"""
    if not is_keyboard_key_entry(key):
        return value, False
    
    if key in KEYBOARD_KEY_FIXES:
        correct_value = KEYBOARD_KEY_FIXES[key]
        if value != correct_value:
            return correct_value, True
    
    return value, False

def process_file(filepath):
    """Process a single zh_CN.json file to fix keyboard keys"""
    changes = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            data = json.loads(content)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        return changes, False
    
    modified = False
    
    for key, entry in data.items():
        if isinstance(entry, dict) and "value" in entry:
            old_value = entry["value"]
            new_value, changed = fix_keyboard_key_value(key, old_value)
            if changed:
                changes.append((key, old_value, new_value))
                entry["value"] = new_value
                modified = True
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
    
    return changes, modified

def find_untranslated_entries(filepath):
    """Find entries that appear to still be in English (not translated)"""
    untranslated = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return untranslated
    
    def check_value(key, value):
        """Check if a value appears to be untranslated English"""
        if not isinstance(value, str):
            return False
        
        value_stripped = value.strip()
        
        # Skip empty values
        if not value_stripped:
            return False
        
        # Skip keyboard key entries (should stay English)
        if is_keyboard_key_entry(key):
            return False
        
        # Skip entries that are just unit symbols or measurement patterns
        if any(x in key for x in ["symbol.", "units.", ".symbol", ".symbolPattern", 
                                    "Pattern", "pattern", ".title" if key.endswith(".title") and "." in key and key.split(".")[-2] in ["scenery-phet", "joist"] else "NOMATCH"]):
            pass
        
        # Skip if it's a pattern with mostly placeholders
        placeholders = re.findall(r'\{\{?\w+\}?\}|\{[0-9]+\}', value)
        non_placeholder = re.sub(r'\{\{?\w+\}?\}|\{[0-9]+\}', '', value).strip()
        
        # Skip pure placeholder patterns
        if not non_placeholder or len(non_placeholder) <= 2:
            return False
        
        # Skip if it's just symbols, numbers, punctuation
        if re.match(r'^[\d\s\.\,\:\;\-\+\=\*\/\(\)\[\]\{\}\<\>\|\&\%\#\@\!\?\~\`\^\$\°\×\ρ\Ω]+$', non_placeholder):
            return False
        
        # Skip HTML sup/sub tags with simple content
        cleaned = re.sub(r'</?su[bp]>', '', non_placeholder)
        if re.match(r'^[\d\s\.\,\:\;\-\+\=\*\/\(\)\[\]\{\}\<\>\|\&\%\#\@\!\?\~\`\^\$\°\×]+$', cleaned):
            return False
        
        # Skip Fluent ICU message format strings
        if re.search(r'\{\s*\$\w+\s*->', value):
            return False
        if re.search(r'\*\[', value):
            return False
        
        # Skip entries that contain "{ $" (Fluent format)
        if '{ $' in value:
            return False
        
        # Check if the value contains any Chinese characters
        has_chinese = bool(re.search(r'[\u4e00-\u9fff]', value))
        
        if has_chinese:
            return False
        
        # At this point, no Chinese characters found
        # Check if it looks like English text that should be translated
        english_words = re.findall(r'[a-zA-Z]{2,}', value)
        
        # Skip if no meaningful English words
        if not english_words:
            return False
        
        # Skip known technical terms / proper nouns that shouldn't be translated
        skip_words = {'PhET', 'WebGL', 'Internet', 'Explorer', 'pH', 'mol', 'Hz',
                      'nm', 'cm', 'mm', 'kg', 'kPa', 'IQR', 'AU', 'eV', 'AMU',
                      'Tab', 'Shift', 'Alt', 'Enter', 'Esc', 'Space', 'Home', 'End',
                      'Fn', 'Pg', 'Up', 'Dn', 'Delete', 'Backspace', 'Caps', 'Lock',
                      'Option', 'Return'}
        
        meaningful_words = [w for w in english_words if w not in skip_words]
        
        if len(meaningful_words) >= 2:
            return True
        if len(meaningful_words) == 1 and len(meaningful_words[0]) > 4:
            return True
        
        return False
    
    def scan_entries(data, prefix=""):
        for key, entry in data.items():
            full_key = f"{prefix}.{key}" if prefix else key
            if isinstance(entry, dict):
                if "value" in entry:
                    value = entry["value"]
                    if check_value(full_key, value):
                        untranslated.append((full_key, value))
                elif "history" not in entry:
                    # Nested structure without value - recurse
                    scan_entries(entry, full_key)
    
    scan_entries(data)
    return untranslated

def main():
    babel_dir = "babel"
    
    zh_cn_files = glob.glob(os.path.join(babel_dir, "**", "*_zh_CN.json"), recursive=True)
    zh_cn_files.sort()
    
    print(f"Found {len(zh_cn_files)} zh_CN.json files")
    print("=" * 80)
    
    total_key_fixes = 0
    total_untranslated = 0
    all_untranslated = []
    all_key_fixes = []
    
    for filepath in zh_cn_files:
        rel_path = os.path.relpath(filepath)
        
        # Fix keyboard keys
        changes, modified = process_file(filepath)
        if changes:
            for key, old_val, new_val in changes:
                all_key_fixes.append((rel_path, key, old_val, new_val))
                print(f"  KEY FIX: {rel_path} | {key}: '{old_val}' -> '{new_val}'")
            total_key_fixes += len(changes)
        
        # Find untranslated entries
        untranslated = find_untranslated_entries(filepath)
        if untranslated:
            total_untranslated += len(untranslated)
            for key, value in untranslated:
                all_untranslated.append((rel_path, key, value))
    
    print(f"\nTotal keyboard key fixes applied: {total_key_fixes}")
    print(f"Total potentially untranslated entries found: {total_untranslated}")
    
    # Write untranslated report to file
    with open("untranslated_report.txt", 'w', encoding='utf-8') as f:
        f.write(f"Total potentially untranslated entries: {total_untranslated}\n")
        f.write("=" * 80 + "\n\n")
        for filepath, key, value in all_untranslated:
            f.write(f"FILE: {filepath}\n")
            f.write(f"KEY:  {key}\n")
            f.write(f"VALUE: {value}\n")
            f.write("-" * 40 + "\n")
    
    print(f"\nUntranslated entries report written to: untranslated_report.txt")

if __name__ == "__main__":
    main()