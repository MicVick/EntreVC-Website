#!/usr/bin/env bash
#
# Deploy to the VM. Run this from a laptop or CI — never on the server.
#
#   deploy/deploy.sh entrevc@entrevc.iima.ac.in
#
# The rule this script exists to enforce: **the build never runs on the VM.** A Next build
# peaks well above what a small college VM has, and the failure is not a clean error — it
# is the OOM killer taking down whatever it feels like, sometimes the running site. So we
# build locally, ship the output, and the VM only ever runs `node server.js`.
#
# Releases are timestamped directories with a `current` symlink, so a rollback is one
# `ln -sfn` and a restart rather than a rebuild under pressure.

set -euo pipefail

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: deploy/deploy.sh <user@host>" >&2
  exit 2
fi

REMOTE_ROOT="${REMOTE_ROOT:-/srv/entrevc}"
RELEASE="$(date +%Y%m%d-%H%M%S)"
REMOTE_RELEASE="$REMOTE_ROOT/releases/$RELEASE"

echo "==> Checking the working tree"
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit or stash first — a deploy should be traceable to a commit." >&2
  exit 1
fi
COMMIT="$(git rev-parse --short HEAD)"

echo "==> Installing dependencies and building locally (commit $COMMIT)"
npm ci
npm run typecheck
npm run build

if [ ! -d ".next/standalone" ]; then
  echo "No .next/standalone output. Is output:'standalone' still set in next.config.ts?" >&2
  exit 1
fi

echo "==> Assembling the release"
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT

cp -r .next/standalone/. "$STAGING/"
mkdir -p "$STAGING/.next"
cp -r .next/static "$STAGING/.next/static"
[ -d public ] && cp -r public "$STAGING/public"
# The deploy scripts travel with the release so backup.sh and restore.sh are always the
# versions that match the running code.
cp -r deploy "$STAGING/deploy"
echo "$COMMIT" > "$STAGING/RELEASE"

echo "==> Shipping to $TARGET:$REMOTE_RELEASE"
ssh "$TARGET" "mkdir -p '$REMOTE_RELEASE' '$REMOTE_ROOT/data' '$REMOTE_ROOT/media' '$REMOTE_ROOT/backups'"
rsync -az --delete "$STAGING/" "$TARGET:$REMOTE_RELEASE/"

echo "==> Backing up before switching over"
# A backup taken immediately before a release is the thing that makes a bad migration
# survivable. It costs seconds and it is the difference between a rollback and a disaster.
ssh "$TARGET" "APP_DIR='$REMOTE_RELEASE' bash '$REMOTE_RELEASE/deploy/backup.sh'" || {
  echo "Pre-deploy backup failed. Stopping — not switching to the new release." >&2
  exit 1
}

echo "==> Running database migrations"
# `payload migrate`, never schema push. Push infers changes and can silently drop a
# column it thinks is unused; migrations are reviewed, ordered and reversible.
ssh "$TARGET" "cd '$REMOTE_RELEASE' && set -a && . /etc/entrevc/env && set +a && node node_modules/payload/dist/bin/index.js migrate" || {
  echo "Migration failed. The previous release is still live and untouched." >&2
  exit 1
}

echo "==> Switching over"
ssh "$TARGET" "ln -sfn '$REMOTE_RELEASE' '$REMOTE_ROOT/current' && sudo systemctl restart entrevc"

echo "==> Waiting for health"
for attempt in $(seq 1 20); do
  sleep 3
  STATUS="$(ssh "$TARGET" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/health" || echo "000")"
  if [ "$STATUS" = "200" ]; then
    echo "==> Healthy after $((attempt * 3))s."
    ssh "$TARGET" "ls -1dt '$REMOTE_ROOT'/releases/* | tail -n +6 | xargs -r rm -rf"
    echo "==> Deployed $COMMIT as $RELEASE."
    exit 0
  fi
done

echo "Health check never passed. Rolling back." >&2
PREVIOUS="$(ssh "$TARGET" "ls -1dt '$REMOTE_ROOT'/releases/* | sed -n 2p")"
if [ -n "$PREVIOUS" ]; then
  ssh "$TARGET" "ln -sfn '$PREVIOUS' '$REMOTE_ROOT/current' && sudo systemctl restart entrevc"
  echo "Rolled back to $PREVIOUS." >&2
fi
exit 1
