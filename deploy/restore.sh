#!/usr/bin/env bash
#
# Restore a backup produced by deploy/backup.sh.
#
# Read this before you need it, not on the day you need it.
#
# By default it restores into a TARGET DIRECTORY YOU NAME, not over the live site. That is
# deliberate: the most common reason to run a restore is to check that a backup is good,
# and a restore tool whose only mode is "overwrite production" is one nobody dares test.
# Verifying a backup and performing a recovery are the same command with different
# arguments.
#
#   deploy/restore.sh backups/entrevc-20260914-021500.tar.gz /tmp/restore-check
#
# To go live with a restored copy, stop the service, point DATA_DIR/MEDIA_DIR at the
# restored files (or copy them into place), and start it again. There is no --force flag
# that does this for you on purpose.

set -euo pipefail

ARCHIVE="${1:-}"
TARGET="${2:-}"

if [ -z "$ARCHIVE" ] || [ -z "$TARGET" ]; then
  echo "Usage: deploy/restore.sh <archive.tar.gz> <target-dir>" >&2
  exit 2
fi

if [ ! -f "$ARCHIVE" ]; then
  echo "[restore] Archive not found: $ARCHIVE" >&2
  exit 1
fi

if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "[restore] Target $TARGET exists and is not empty. Refusing to write into it." >&2
  echo "[restore] Choose an empty directory — this tool never overwrites." >&2
  exit 1
fi

mkdir -p "$TARGET"
echo "[restore] Extracting $ARCHIVE"
tar -xzf "$ARCHIVE" -C "$TARGET" --strip-components=1

DB="$TARGET/entrevc.db"
if [ ! -f "$DB" ]; then
  echo "[restore] No database in the archive. This is not a usable backup." >&2
  exit 1
fi

# Prove the restored database actually opens and holds data, rather than reporting
# success because tar exited zero.
echo "[restore] Verifying the restored database"
node "$(dirname "$0")/verify-db.mjs" "$DB"

if [ -f "$TARGET/media.tar.gz" ]; then
  mkdir -p "$TARGET/media"
  tar -xzf "$TARGET/media.tar.gz" -C "$TARGET/media" --strip-components=1
  echo "[restore] media restored to $TARGET/media ($(find "$TARGET/media" -type f | wc -l) files)"
fi

echo
[ -f "$TARGET/MANIFEST.txt" ] && cat "$TARGET/MANIFEST.txt"
echo
echo "[restore] Restored to $TARGET — this is a copy, the live site is untouched."
