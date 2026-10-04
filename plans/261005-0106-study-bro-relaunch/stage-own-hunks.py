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


def anchor_to_old_side(hunk):
    """Rewrite the new-side start of a -U0 hunk to match its old-side start.

    git apply starts looking for a hunk at its NEW-side line number, and a pure insertion has an
    empty preimage so it matches right there. When other sessions' hunks (not staged) shifted the
    new-side numbers, the insertion would land lines away from where it belongs. Since the hunks
    are applied to the index alone, bottom to top, the old-side position is the right one.
    """
    m = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', hunk)
    old_start, old_len = int(m.group(1)), int(m.group(2) if m.group(2) is not None else 1)
    new_len = int(m.group(4) if m.group(4) is not None else 1)
    new_start = old_start + 1 if old_len == 0 else old_start - 1 if new_len == 0 else old_start
    header = f'@@ -{m.group(1)}' + (f',{m.group(2)}' if m.group(2) is not None else '')
    header += f' +{new_start}' + (f',{m.group(4)}' if m.group(4) is not None else '') + ' @@'
    return header + hunk[m.end():]


# One hunk at a time, bottom to top. Zero-context hunks only apply at their exact old line,
# and a subset in one patch breaks when new-side numbers were shifted by hunks left out;
# going bottom-up keeps the old line numbers of the remaining hunks valid in the index.
for hunk in reversed(keep):
    result = subprocess.run(
        ['git', 'apply', '--cached', '--unidiff-zero', '-'],
        input=head + anchor_to_old_side(hunk), text=True, capture_output=True,
    )
    if result.returncode:
        subprocess.run(['git', 'restore', '--staged', '--', path])
        sys.exit(f'{path}: git apply failed: {result.stderr}')

if path.endswith('.json'):
    staged = subprocess.run(['git', 'show', f':{path}'], capture_output=True, text=True).stdout
    try:
        json.loads(staged)
    except json.JSONDecodeError as err:
        subprocess.run(['git', 'restore', '--staged', '--', path])
        sys.exit(f'{path}: staged JSON invalid ({err}); unstaged again')

print(f'{path}: staged {len(keep)} hunk(s)')
