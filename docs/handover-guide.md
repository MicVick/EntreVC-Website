# EntreVC website — handover guide

**For the incoming committee. You do not need to write code to run this site.**

Two pages. If you read nothing else, read *The five things that matter*.

---

## The five things that matter

1. **Log in at `https://entrevc.iima.ac.in/admin`.** Everything you publish, you publish there.
2. **Content is data, not code.** Events, ventures, resources, people and the homepage numbers are all editable in the admin. If you find yourself asking a developer to change wording, you have probably missed a field.
3. **Every account must belong to a club address, never a personal one.** The domain, the GitHub repository, the VM, the email account. People graduate; club addresses do not.
4. **Backups run nightly and are copied off the server.** Once a year, actually restore one (below). An untested backup is a belief.
5. **The person who breaks this site will be doing something in `/admin`, not in the code.** So the riskiest actions — deleting registrations, changing a published event's web address — are the ones to slow down on.

---

## Publishing an event

1. `/admin` → **Events** → **Create new**.
2. Fill in the **Details** tab. Title, date and time, venue or online, and a hero image.
   *Alt text on the image is required.* That is not bureaucracy — it is what a screen reader and a slow connection show.
3. **Speakers & agenda** if you have them. Both are optional.
4. **Registration** tab: capacity (leave empty for unlimited), a deadline, and up to three extra questions.
5. Press **Publish**. The public page updates within about ten seconds.

**Things worth knowing**

- Registration closes by itself at the deadline and again when the event ends. You never close it by hand.
- Once capacity is reached, further sign-ups become a **waitlist** automatically.
- An event moves from Upcoming to Past on its own when it finishes. Nobody has to move it.
- **Do not change the web address (slug) after sharing the link.** It is in WhatsApp groups by then; changing it breaks every one of them. Fixing a typo in the title is safe — the address does not follow it.

## Getting the attendee list

Open the event → **Registration** tab → **Export registrations for this event (CSV)**.

Every extra question you asked is its own column. Opens in Excel or Google Sheets.

For every event at once: **Registrations** → **Export everything**.

## Someone drops out

**Registrations** → open the person → change **Status** to `Cancelled` → Save.

To give their place to the next person: open the first person on the waitlist, change **Status** from `Waitlisted` to `Confirmed`, Save. That automatically emails them that they are in, with a calendar invite, and moves everyone else up a place. You do not need to email anyone yourself.

## Reading enquiries

**Submissions**. Each one is tagged with a category and shows which mailbox it was forwarded to. Where enquiries go is set in **Site Settings → Contact & routing** — you can change it yourself, no developer needed.

## Adding and removing people

**Users** → **Create new**. Two roles:

- **Editor** — can create, edit and publish content. This is the right role for almost everyone.
- **Admin** — everything an editor can do, plus managing users and deleting registrations.

**At handover, remove the outgoing committee's accounts the same week.** An account nobody owns is the most likely way this site is damaged.

---

## Who owns what

Fill this in and keep it current. It is the first thing the next committee will need.

| Thing | Where | Owned by (club address) |
|---|---|---|
| Domain and DNS | | |
| The VM | IIMA IT | |
| GitHub repository | | |
| Email / SMTP relay | | |
| Google Analytics | | |
| Admin accounts | `/admin` → Users | |

---

## When something is wrong

**The site is down.** Ask IT whether the VM is running. If it is:

```bash
sudo systemctl status entrevc      # is it running?
sudo journalctl -u entrevc -n 100  # what did it say before it stopped?
sudo systemctl restart entrevc     # the honest first thing to try
```

**Published something and the page has not changed.** Wait a minute. If it still has not, restart the service as above. Publishing triggers a refresh of the affected pages; a restart forces it.

**Confirmation emails are not arriving.** Check a registration in the admin — it shows an email status. `Failed` means the registration is safely recorded but the mail did not send, which is almost always the SMTP relay or the sending domain's DNS records (SPF, DKIM, DMARC), not this site.

**Restoring a backup.** On the VM:

```bash
ls -1t /srv/entrevc/backups | head           # find a recent archive
deploy/restore.sh /srv/entrevc/backups/<archive>.tar.gz /tmp/check
```

That restores into `/tmp/check` and verifies it. It does **not** touch the live site — which is exactly why you can run it any time, and why you should, once a year. To actually go live from a restored copy, stop the service, put the restored files in place of `/srv/entrevc/data` and `/srv/entrevc/media`, and start it again.

---

## For whoever maintains the code

- Conventions and architecture: `CLAUDE.md`.
- Interfaces between components: `CONTRACT.md`.
- Deploying, backups, monitoring: `deploy/README.md`.
- **Never build on the VM.** `deploy/deploy.sh` builds locally and ships the output; a build on a small VM runs out of memory and can take the running site down with it.
- Yearly data hygiene: `npm run retention` (reports; add `-- --confirm` to act).
