#!/usr/bin/env bash
#
# Nightly backup: database + uploaded media, rotated, and copied off the box.
#
# This is the one operational task that is not negotiable. Everything else on this VM can
# be rebuilt from the git repository in an afternoon; the registrations, the submissions
# and the uploaded photos cannot be rebuilt from anything.
#
# Three properties worth knowing about:
#
#   1. The database is snapshotted with VACUUM INTO, never copied with `cp`. See
#      deploy/backup-db.mjs for why a plain copy produces a file that looks like a backup
#      and is not one.
#   2. The copy is verified — opened, integrity-checked, and counted — before this script
#      calls it a success. A backup nobody has read is a belief.
#   3. It fails loudly. `set -euo pipefail` plus an explicit trap, because the failure mode
#      that actually hurts is a backup that has been quietly not running for five months.
#
# Restoring is deploy/restore.sh. Test it. An untested restore is also just a belief.
#
# Install (as the service user):
#   crontab -e
#   15 2 * * *  /srv/entrevc/current/deploy/backup.sh >> /var/log/entrevc-backup.log 2>&1

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/entrevc/current}"
DATA_DIR="${DATA_DIR:-/srv/entrevc/data}"
MEDIA_DIR="${MEDIA_DIR:-/srv/entrevc/media}"
BACKUP_DIR="${BACKUP_DIR:-/srv/entrevc/backups}"
DB_FILE="${DB_FILE:-$DATA_DIR/entrevc.db}"
KEEP_DAYS="${KEEP_DAYS:-30}"

# Where backups are copied so they survive losing this machine. Without this set, the
# backups live only on the box they are protecting, which is not a backup at all.
OFFSITE_TARGET="${OFFSITE_TARGET:-}"

STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$BACKUP_DIR/entrevc-$STAMP"

fail() {
  echo "[backup] FAILED at line $1. No archive was produced for $STAMP." >&2
  rm -rf "$WORK"
  exit 1
}
trap 'fail $LINENO' ERR

echo "[backup] ==== $(date --iso-8601=seconds) ===="
mkdir -p "$WORK"

# ── 1. Database ─────────────────────────────────────────────────────────────
node "$APP_DIR/deploy/backup-db.mjs" "$DB_FILE" "$WORK/entrevc.db"

# ── 2. Uploaded media ───────────────────────────────────────────────────────
if [ -d "$MEDIA_DIR" ]; then
  tar -czf "$WORK/media.tar.gz" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"
  echo "[backup] media: $(du -h "$WORK/media.tar.gz" | cut -f1)"
else
  echo "[backup] WARNING: media directory $MEDIA_DIR does not exist — nothing to archive." >&2
fi

# A manifest, so whoever opens this in two years knows what they are holding.
cat > "$WORK/MANIFEST.txt" <<EOF
EntreVC backup
Taken:     $(date --iso-8601=seconds)
Host:      $(hostname)
Database:  $DB_FILE
Media:     $MEDIA_DIR
App:       $(cd "$APP_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")

Restore with:  deploy/restore.sh <this-archive.tar.gz> <target-dir>
EOF

# ── 3. One archive ──────────────────────────────────────────────────────────
ARCHIVE="$BACKUP_DIR/entrevc-$STAMP.tar.gz"
tar -czf "$ARCHIVE" -C "$BACKUP_DIR" "entrevc-$STAMP"
rm -rf "$WORK"
echo "[backup] archive: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

# ── 4. Off the box ──────────────────────────────────────────────────────────
if [ -n "$OFFSITE_TARGET" ]; then
  rsync -az --partial "$ARCHIVE" "$OFFSITE_TARGET/"
  echo "[backup] copied off-box to $OFFSITE_TARGET"
else
  echo "[backup] WARNING: OFFSITE_TARGET is not set. These backups live only on the machine" >&2
  echo "[backup]          they are protecting. Set it before you rely on this." >&2
fi

# ── 5. Rotation ─────────────────────────────────────────────────────────────
find "$BACKUP_DIR" -maxdepth 1 -name 'entrevc-*.tar.gz' -mtime "+$KEEP_DAYS" -print -delete

COUNT="$(find "$BACKUP_DIR" -maxdepth 1 -name 'entrevc-*.tar.gz' | wc -l)"
echo "[backup] done. $COUNT archive(s) retained, keeping $KEEP_DAYS days."
