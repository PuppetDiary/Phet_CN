import os
import re
import json
import sys

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Walk all subdirectories for package.json files
root_dir = os.path.dirname(os.path.abspath(__file__))
modified_files = []
skipped_files = []

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename == 'package.json':
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_dir)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                data = json.loads(content)
                
                if 'version' in data:
                    version = data['version']
                    # Match version suffixes like -dev.N, -rc.N, -alpha.N, -beta.N
                    # Also match .dev.N format
                    new_version = re.sub(r'[-.](?:dev|rc|alpha|beta)\.\d+$', '', version)
                    
                    if new_version != version:
                        old_str = f'"version": "{version}"'
                        new_str = f'"version": "{new_version}"'
                        new_content = content.replace(old_str, new_str)
                        
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            modified_files.append((rel_path, version, new_version))
                            print(f'[OK] {rel_path}: "{version}" -> "{new_version}"')
                        else:
                            skipped_files.append((rel_path, version, "replace failed"))
                            print(f'[WARN] {rel_path}: replace failed "{version}"')
            except Exception as e:
                print(f'[ERR] {rel_path}: error - {e}')

print(f'\nTotal modified: {len(modified_files)} files')
if skipped_files:
    print(f'Skipped: {len(skipped_files)} files')