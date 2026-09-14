#!/usr/bin/env bash
#
# Monitoring for a site nobody is paid to watch.
#
# The realistic failure mode for a club project is not a dramatic outage — it is the site
# being down for eleven days in the summer because everyone who knew about it graduated.
# So this checks the handful of things that actually go wrong on a small VM and emails a
# CLUB address when one of them does.
#
# What it checks, and why each one:
#   - the service is running          (it crashed, or never came back after a reboot)
#   - the site answers over HTTP      (running but wedged)
#   - the database is reachable       (the app is fine; the disk went read-only)
#   - disk space                      (media uploads and backups fill a small VM quietly,
#                                      and SQLite corrupts messily when the disk is full)
#   - a backup ran recently           (the silent failure that only matters once)
#   - TLS has time left               (Caddy renews automatically; this catches the case
#                                      where renewal has been failing unnoticed)
#
# Install:
#   crontab -e
#   */10 * * * *  /srv/entrevc/current/deploy/healthcheck.sh
#
# It only sends mail when something is wrong. A monitor that emails every ten minutes is
# a monitor everyone filters into a folder and stops reading.

set -uo pipefail

ALERT_EMAIL="${ALERT_EMAIL:-webmaster@entrevc.iima.ac.in}"
SITE_URL="${SITE_URL:-https://entrevc.iima.ac.in}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3000}"
BACKUP_DIR="${BACKUP_DIR:-/srv/entrevc/backups}"
DATA_DIR="${DATA_DIR:-/srv/entrevc/data}"
DISK_WARN_PERCENT="${DISK_WARN_PERCENT:-85}"
BACKUP_MAX_AGE_HOURS="${BACKUP_MAX_AGE_HOURS:-30}"
SERVICE="${SERVICE:-entrevc}"

PROBLEMS=()

note() { PROBLEMS+=("$1"); }

# ── The service ─────────────────────────────────────────────────────────────
if ! systemctl is-active --quiet "$SERVICE"; then
  note "The $SERVICE service is not running. Recent log:
$(journalctl -u "$SERVICE" -n 25 --no-pager 2>/dev/null)"
fi

# ── The application ─────────────────────────────────────────────────────────
HEALTH="$(curl -fsS --max-time 10 "$LOCAL_URL/api/health" 2>/dev/null)" || HEALTH=""
if [ -z "$HEALTH" ]; then
  note "The site did not answer $LOCAL_URL/api/health within 10 seconds."
elif ! printf '%s' "$HEALTH" | grep -q '"status":"ok"'; then
  # This is the case a port check would miss entirely: serving pages, database gone.
  note "Health endpoint reported a problem: $HEALTH"
fi

# ── Publicly reachable, with valid TLS ──────────────────────────────────────
PUBLIC_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL/api/health" 2>/dev/null)" || PUBLIC_CODE="000"
if [ "$PUBLIC_CODE" != "200" ]; then
  note "The public URL $SITE_URL/api/health returned $PUBLIC_CODE. The app may be fine and Caddy or DNS broken."
fi

if command -v openssl >/dev/null 2>&1; then
  HOST="$(printf '%s' "$SITE_URL" | sed -e 's|^https\?://||' -e 's|/.*$||')"
  EXPIRY="$(echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  if [ -n "$EXPIRY" ]; then
    EXPIRY_EPOCH="$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)"
    DAYS_LEFT=$(( (EXPIRY_EPOCH - $(date +%s)) / 86400 ))
    if [ "$EXPIRY_EPOCH" -gt 0 ] && [ "$DAYS_LEFT" -lt 14 ]; then
      note "The TLS certificate expires in $DAYS_LEFT day(s). Caddy should renew it automatically — if it has not, check: journalctl -u caddy"
    fi
  fi
fi

# ── Disk ────────────────────────────────────────────────────────────────────
USED="$(df --output=pcent "$DATA_DIR" 2>/dev/null | tail -1 | tr -dc '0-9')"
if [ -n "$USED" ] && [ "$USED" -ge "$DISK_WARN_PERCENT" ]; then
  note "Disk holding the database is ${USED}% full (warn at ${DISK_WARN_PERCENT}%).
SQLite behaves badly when a disk fills. Oldest backups:
$(ls -1t "$BACKUP_DIR" 2>/dev/null | tail -5)"
fi

# ── Backups ─────────────────────────────────────────────────────────────────
if [ -d "$BACKUP_DIR" ]; then
  RECENT="$(find "$BACKUP_DIR" -maxdepth 1 -name 'entrevc-*.tar.gz' -mmin "-$((BACKUP_MAX_AGE_HOURS * 60))" | head -1)"
  if [ -z "$RECENT" ]; then
    note "No backup in the last $BACKUP_MAX_AGE_HOURS hours. Check the cron entry and /var/log/entrevc-backup.log."
  fi
else
  note "Backup directory $BACKUP_DIR does not exist. Backups are not running at all."
fi

# ── Report ──────────────────────────────────────────────────────────────────
if [ ${#PROBLEMS[@]} -eq 0 ]; then
  exit 0
fi

SUBJECT="[EntreVC] ${#PROBLEMS[@]} problem(s) on $(hostname)"
BODY="Checked $(date --iso-8601=seconds) on $(hostname).

$(printf '%s\n\n' "${PROBLEMS[@]}")

--
deploy/healthcheck.sh. Runbook: docs/handover-guide.md"

printf '%s\n' "$BODY" >&2
if command -v mail >/dev/null 2>&1; then
  printf '%s\n' "$BODY" | mail -s "$SUBJECT" "$ALERT_EMAIL"
else
  echo "(mailutils not installed — alert not emailed. apt install mailutils)" >&2
fi
exit 1
