# Annual checklist

Run this at committee handover, every year. It takes about an hour.

It exists because this project's largest risk is not technical. The team turns over
completely each year and may include nobody who writes code — so the failure mode is
not a bug, it is a site that quietly stops being anybody's job.

---

## 1. Accounts and ownership — *do this first*

- [ ] Create accounts for the incoming committee (`/admin` → Users). **Editor** unless they genuinely need to manage users.
- [ ] **Remove the outgoing committee's accounts.** Not "later" — this week.
- [ ] Confirm every account below is owned by a **club address, not a personal one**. Anything on a personal address is lost the moment that person graduates.
  - [ ] Domain registrar and DNS
  - [ ] VM access (who at IIMA IT is the contact?)
  - [ ] GitHub repository
  - [ ] Email / SMTP relay
  - [ ] Google Analytics
- [ ] Update the ownership table in `docs/handover-guide.md`.
- [ ] Check the Let's Encrypt contact address in `/etc/caddy/Caddyfile` is a club address.

## 2. Prove the backup works

Not "check that backups ran" — **restore one**.

- [ ] `ls -1t /srv/entrevc/backups | head` — is there a recent archive?
- [ ] `deploy/restore.sh /srv/entrevc/backups/<archive>.tar.gz /tmp/restore-check`
- [ ] Confirm it reports `integrity ok` with sensible event and registration counts.
- [ ] Confirm backups are being copied **off the VM** (`OFFSITE_TARGET` is set in the cron environment). A backup that lives only on the machine it protects is not a backup.
- [ ] Record here that you did it: **last tested restore — ____________**

## 3. Data hygiene

- [ ] `npm run retention` — read the report.
- [ ] Registrations older than two academic years: export and purge with `npm run retention -- --confirm`. Keep the exported CSVs somewhere safe and off the server.
- [ ] Confirm the consent audit reports no founder contact details stored without consent.
- [ ] Spot-check a few venture listings: is written permission still recorded for each?

## 4. Content

- [ ] Update **Team** for the new committee, and move last year's roster to the archive year.
- [ ] Refresh **Site Settings**: positioning statement, homepage numbers, contact routing.
- [ ] Check **Contact & routing** points at mailboxes that still exist and that somebody reads.
- [ ] Retire events, resources and schemes that are no longer true.
- [ ] Send a test message through the public contact form and confirm it reaches a human.

## 5. Health

- [ ] `https://entrevc.iima.ac.in/api/health` returns `{"status":"ok"}`.
- [ ] `sudo systemctl is-enabled entrevc` says `enabled` — otherwise the site does not come back after a reboot, and college machines reboot for patching without asking.
- [ ] `df -h` — is the disk filling? Media uploads and backups are the usual cause.
- [ ] Confirm the monitoring cron entry exists and `ALERT_EMAIL` points at a club address somebody reads.
- [ ] Register for a test event end to end. Confirm the email arrives and is **not** in spam. If it is, the fix is DNS (SPF, DKIM, DMARC), not the website.

## 6. Hand it over properly

- [ ] Walk the incoming committee through publishing a real event themselves. Do not do it for them — the point is proving they can.
- [ ] Point them at `docs/handover-guide.md`.
- [ ] Agree who owns the site this year, by name. **A site that is everybody's job is nobody's job.**

---

**Owner this year:** ____________________  **Handover completed:** ______________
