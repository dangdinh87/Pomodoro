"""Commit only your own changes while other agents/sessions share the working tree.

Usage:
  python3 plans/261005-0106-study-bro-relaunch/commit-own.py \
      -m "fix(stats): tính ngày theo múi giờ người dùng" \
      --files src/app/api/stats/route.ts src/lib/stats/streak.ts \
      --shared 'src/i18n/locales/en.json=errors\\.guestRateLimited' \
      --shared 'src/i18n/locales/vi.json=errors\\.guestRateLimited'

- Takes a mutex (.git/relaunch-commit.lock) so two agents never stage/commit at
  the same time; a commit can then never sweep in another agent's staged files.
- --files: whole files (new, modified or deleted) owned by you.
- --shared FILE=REGEX: files that also contain someone else's edits (locale JSON,
  next.config.ts); only hunks matching REGEX and not mentioning "weather" are
  staged (see stage-own-hunks.py), and staged JSON must still parse.
- Appends the Co-Authored-By trailer when missing.
"""
import argparse
import os
import subprocess
import sys
import time

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
LOCK = os.path.join(ROOT, '.git', 'relaunch-commit.lock')
TRAILER = 'Co-Authored-By: Claude <noreply@anthropic.com>'
HERE = os.path.dirname(os.path.abspath(__file__))


def git(*args, **kw):
    return subprocess.run(['git', *args], cwd=ROOT, text=True, capture_output=True, **kw)


def acquire(timeout_s=900):
    start = time.time()
    while True:
        try:
            os.mkdir(LOCK)
            with open(os.path.join(LOCK, 'owner'), 'w') as f:
                f.write(f'{os.getpid()} {time.ctime()}\n')
            return
        except FileExistsError:
            # Stale lock (holder died) after 10 minutes
            if time.time() - os.path.getmtime(LOCK) > 600:
                subprocess.run(['rm', '-rf', LOCK])
                continue
            if time.time() - start > timeout_s:
                sys.exit('commit lock busy for too long; retry later')
            time.sleep(2)


def release():
    subprocess.run(['rm', '-rf', LOCK])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-m', '--message', required=True)
    ap.add_argument('--files', nargs='*', default=[])
    ap.add_argument('--shared', action='append', default=[])
    a = ap.parse_args()
    if not a.files and not a.shared:
        sys.exit('nothing to commit: pass --files and/or --shared')

    acquire()
    try:
        if git('diff', '--cached', '--quiet').returncode != 0:
            staged = git('diff', '--cached', '--name-only').stdout
            sys.exit(f'index already has staged changes (someone else?):\n{staged}\nNot committing.')
        if a.files:
            r = git('add', '-A', '--', *a.files)  # -A here only covers the listed paths (incl. deletions)
            if r.returncode:
                sys.exit(r.stderr)
        for spec in a.shared:
            path, regex = spec.split('=', 1)
            r = subprocess.run([sys.executable, os.path.join(HERE, 'stage-own-hunks.py'), path, regex],
                               cwd=ROOT, text=True, capture_output=True)
            print(r.stdout.strip() or r.stderr.strip())
            if r.returncode:
                git('reset', '-q')  # unstage everything this run staged
                sys.exit(f'staging {path} failed')
        staged = git('diff', '--cached', '--name-only').stdout.split()
        if not staged:
            sys.exit('nothing staged')
        weather = [p for p in staged if 'weather' in p.lower()]
        if weather:
            git('reset', '-q')
            sys.exit(f'refusing: weather files staged {weather}')
        msg = a.message.rstrip()
        if TRAILER not in msg:
            msg += '\n\n' + TRAILER
        r = git('commit', '-q', '-F', '-', input=msg)
        if r.returncode:
            git('reset', '-q')
            sys.exit('commit failed: ' + r.stderr + r.stdout)
        print(git('log', '--oneline', '-1').stdout.strip())
        print('files:', ', '.join(staged))
    finally:
        release()


if __name__ == '__main__':
    main()
