"""Stage only this session's hunks of a file that another session is also editing.

Usage: python3 plans/261005-0106-study-bro-relaunch/stage-own-hunks.py <file> <regex>

Keeps the hunks of `git diff -U0 <file>` that match <regex> and do not mention
"weather" (the parallel weather WIP), applies them to the index, and for JSON
files verifies that the staged blob still parses.
"""
import json
import re
import subprocess
import sys

path, mark = sys.argv[1], re.compile(sys.argv[2])
diff = subprocess.run(['git', 'diff', '-U0', '--', path], capture_output=True, text=True).stdout
head, *hunks = re.split(r'(?m)^(?=@@ )', diff)
keep = [h for h in hunks if mark.search(h) and 'weather' not in h.lower()]
if not keep:
    sys.exit(f'{path}: no matching hunk')

result = subprocess.run(
    ['git', 'apply', '--cached', '--unidiff-zero', '-'],
    input=head + ''.join(keep), text=True, capture_output=True,
)
if result.returncode:
    sys.exit(f'{path}: git apply failed: {result.stderr}')

if path.endswith('.json'):
    staged = subprocess.run(['git', 'show', f':{path}'], capture_output=True, text=True).stdout
    try:
        json.loads(staged)
    except json.JSONDecodeError as err:
        subprocess.run(['git', 'restore', '--staged', '--', path])
        sys.exit(f'{path}: staged JSON invalid ({err}); unstaged again')

print(f'{path}: staged {len(keep)} hunk(s)')
