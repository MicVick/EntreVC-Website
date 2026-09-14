# Deploying EntreVC

Everything in this directory is for the VM. For running the *site*, see
[`docs/handover-guide.md`](../docs/handover-guide.md) — most people never need this file.

## The one rule

**Never build on the VM.** A Next.js build peaks well above what a small college VM has,
and it does not fail cleanly — the OOM killer picks a victim, sometimes the running site.
`deploy.sh` builds locally and ships the output. The VM only ever runs `node server.js`.

---

## Before the first deploy — what to ask IT

Three answers change the design, so get them before building anything:

1. **Is the storage NFS-mounted or otherwise a network filesystem?**
   If yes, **SQLite cannot be used** — its locking is unreliable on NFS and the database
   will corrupt. Switch to Postgres via `@payloadcms/db-postgres` *before* real
   registrations exist. This is much cheaper to discover now than later.
2. **How much RAM?** 1 GB is workable for serving. Builds happen elsewhere regardless.
3. **Are ports 80 and 443 open inbound, and is outbound SMTP allowed?**
   Without outbound SMTP no confirmation email ever sends. Many institutional networks
   block it by default and it is a request, not a setting.

Also worth settling early: the sending domain needs **SPF, DKIM and DMARC** records, or
confirmation emails land in spam no matter what the code does. That is a DNS task for a
human, and it is the highest-likelihood risk on the whole email feature.

## Layout on the server

```
/srv/entrevc/
  current -> releases/20260914-021500   # symlink; rollback = repoint and restart
  releases/                             # last 5 kept
  data/entrevc.db                       # the database
  media/                                # uploaded files
  backups/                              # nightly archives
/etc/entrevc/env                        # secrets, root-owned, chmod 600
```

`data/` and `media/` live **outside** the release directories on purpose — a deploy
replaces the code and must never touch the content.

## First-time setup

```bash
sudo adduser --system --group --home /srv/entrevc entrevc
sudo mkdir -p /srv/entrevc/{releases,data,media,backups} /etc/entrevc
sudo chown -R entrevc:entrevc /srv/entrevc

# Secrets. PAYLOAD_SECRET must be long and random, and must never change after first
# run — existing sessions and any encrypted fields depend on it.
sudo install -m 600 /dev/null /etc/entrevc/env
sudo tee /etc/entrevc/env >/dev/null <<'EOF'
NODE_ENV=production
DATABASE_URI=file:/srv/entrevc/data/entrevc.db
MEDIA_DIR=/srv/entrevc/media
PAYLOAD_SECRET=<openssl rand -base64 48>
NEXT_PUBLIC_SITE_URL=https://entrevc.iima.ac.in
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@entrevc.iima.ac.in
CONTACT_FALLBACK_EMAIL=webmaster@entrevc.iima.ac.in
EOF

sudo cp deploy/entrevc.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now entrevc     # `enable` is the part people forget

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile   # edit the hostname first
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Then, from a laptop:

```bash
deploy/deploy.sh entrevc@entrevc.iima.ac.in
```

`deploy.sh` refuses a dirty working tree, builds and typechecks locally, takes a backup
**before** switching over, runs `payload migrate`, waits for `/api/health`, and rolls back
to the previous release if health never comes good.

## Migrations, not schema push

Development uses Payload's schema push. **Production must not.** Push infers changes from
the config and can drop a column it believes is unused. Generate a migration, read it, and
commit it:

```bash
npx payload migrate:create   # locally, after changing collections
npx payload migrate          # run on the VM — deploy.sh does this for you
```

## Cron

```bash
sudo crontab -u entrevc -e
```

```cron
15 2 * * *   OFFSITE_TARGET=backup@store.example:/entrevc /srv/entrevc/current/deploy/backup.sh >> /var/log/entrevc-backup.log 2>&1
*/10 * * * * /srv/entrevc/current/deploy/healthcheck.sh
```

Set `OFFSITE_TARGET`. Without it, backups live only on the machine they are protecting.

```
# /etc/logrotate.d/entrevc
/var/log/entrevc-backup.log {
    weekly
    rotate 12
    compress
    missingok
    notifempty
}
```

Caddy rotates its own logs (see the `roll_*` settings in the Caddyfile), and the app logs
to the systemd journal, which is already capped.

## The scripts

| Script | What it does |
|---|---|
| `deploy.sh <user@host>` | Build locally, ship, migrate, health-check, roll back on failure |
| `backup.sh` | Nightly database + media archive, verified, rotated, copied off-box |
| `restore.sh <archive> <dir>` | Restore into a directory you name — never over the live site |
| `backup-db.mjs` | Consistent SQLite snapshot via `VACUUM INTO` (never `cp` a live database) |
| `verify-db.mjs` | Open a database file and prove it is intact and non-empty |
| `healthcheck.sh` | Service, HTTP, database, disk, backup age and TLS expiry; emails on failure |

## Rolling back

```bash
ls -1dt /srv/entrevc/releases/*        # find the previous release
sudo ln -sfn /srv/entrevc/releases/<previous> /srv/entrevc/current
sudo systemctl restart entrevc
```

If the bad release included a migration, restore the pre-deploy backup as well — every
deploy takes one immediately before switching over, which is what makes this survivable.
