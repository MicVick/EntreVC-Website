# TASKS — Agent A · Data, CMS & Events

**Branch:** `agent/data` · **Total:** ~77h across 8 days
**You own:** Payload configuration, the content access layer, every API route, email, the
events and registration path end to end, and the VM.
**You do not own:** `app/globals.css`, `app/layout.tsx`, `components/ui/`, any public route
except `events/`, `next.config.ts`, `lib/{format,seo,analytics,revalidation}.ts`.

Read `CLAUDE.md` and `CONTRACT.md` before your first task and again at every handshake.

> **Two duties outrank everything else.**
> **H1** — Agent B is blocked on nothing but your collections and `lib/content/*`
> signatures. Ship them and the seed on Day 1–2 before anything else.
> **Deploy on Day 2, not Day 8.** Push a trivial page to the VM early. A deploy pipeline
> discovered to be broken on launch day is the most avoidable failure in this plan.

> **You are configuring a CMS, not building one.** Payload supplies the admin UI, auth,
> roles, media library, rich text, drafts and version history. If you find yourself writing
> an admin screen, stop and check whether a field config already does it.

---

## Sprint 0 — Bootstrap (Day 0, joint · 5h)

You lead; Agent B reviews and does not commit until H0 is signed.

### ☑ A0.1 — Scaffold `3h`
- `create-next-app` — App Router, TypeScript, Tailwind 4, `@/` alias, no `src/`.
- Install Payload 3 into the same app: `payload`, `@payloadcms/next`,
  `@payloadcms/db-sqlite`, `@payloadcms/richtext-lexical`,
  `@payloadcms/email-nodemailer`, `better-sqlite3`, `sharp`.
- Install the **entire** list from `CONTRACT.md` §7 in one pass. Commit the lockfile.
  Neither agent installs anything again without a `DECISIONS.md` entry.
- `git init`, first commit, cut `agent/data` and `agent/site` from the same SHA.

**Done when:** `npm run dev` serves the site *and* a working Payload admin at `/admin`.

### ☑ A0.2 — Tooling and environment `1h`
- TS `strict`, `noUncheckedIndexedAccess`. ESLint + Prettier. Scripts: `dev`, `build`,
  `typecheck`, `lint`, `test`, `seed`, `seed:reset`, `e2e`, `deploy`.
- `.env.example` with every var, commented. `PAYLOAD_SECRET`, SMTP credentials and the
  database path are server-only — never `NEXT_PUBLIC_*`.

### ☑ A0.3 — Confirm the VM `1h`
Ask IT, and record answers in `DECISIONS.md`:
- RAM and vCPU · **storage type — if it is NFS-mounted, we use Postgres, not SQLite** ·
  Node version available · ports 80/443 open · outbound SMTP permitted · who patches the
  box · whether a CDN proxy in front is allowed.

> **🤝 H0 — sign off in `DECISIONS.md` before either agent proceeds.**

---

## Sprint 1 — Content model and the VM (Days 1–2 · 22h)

### ☑ A1.1 — Payload collections `12h` · **H1 CRITICAL** · `CONTRACT.md` §3
**Files:** `payload.config.ts`, `collections/**`, `globals/SiteSettings.ts`
- All eleven collections plus the settings global, per the contract table.
- `events`: slug from title, drafts + versions on, venue group, format, hero image, gallery,
  speakers array, agenda array, capacity, registration deadline, `restrictToInstituteEmail`
  (**default off** `[ASSUMPTION]`), `registrationFields` array **capped at 3**, recap fields.
- `startups`: founders array with per-founder `contactConsent`, sectors, stage, plus the
  `listingApproval` group and a `beforeChange` hook that **rejects publish when
  `approved !== true`** `[ASSUMPTION: per-listing written consent]`.
- `media`: local disk, sharp sizes, **`alt` required** — this is how the accessibility
  requirement becomes impossible to skip.
- `users`: two roles only, `admin` and `editor`.
- Access control in config, never in the UI alone: public read where `_status ===
  'published'`; `registrations`/`submissions`/`subscribers` create-only for the public.
- Field labels and `admin.description` written in **plain language for a non-technical
  editor**. The field config *is* the console; its copy is the whole user experience.

**Done when:** every collection round-trips in `/admin`, and access control is verified by
attempting a public read of a draft.

### ☑ A1.2 — Content access layer `5h` · **H1 CRITICAL** · `CONTRACT.md` §4
**Files:** `lib/schemas/**`, `lib/content/**`
- Zod schemas mirroring the collections; these are the types Agent B imports.
- **Within your first two hours on Day 1**, create every function in `CONTRACT.md` §4 with
  its final signature returning seed data. Announce the freeze in `DECISIONS.md`. Then
  implement over Payload's Local API.
- Published-only. ISO UTC strings out, never Date objects. `null` for missing.

### ☑ A1.3 — Seed script `3h` · **H1 CRITICAL** · depends A1.1
**Files:** `scripts/seed.ts`
- Cover the awkward cases listed in `CONTRACT.md` §2, not just volume. Idempotent;
  `seed:reset` clears. Tell Agent B in `DECISIONS.md` the moment it lands.

### ☐ A1.4 — VM, Caddy, systemd, first deploy `2h` · *do not defer this*
**Files:** `deploy/**`, `Caddyfile`, `entrevc.service`
- Caddy reverse proxy with automatic TLS; app under systemd with restart-on-failure.
- Deploy script: build **in CI or locally**, rsync the standalone output, restart. The
  script must **refuse to run `next build` on the VM** — a small box will OOM.
- Ship a trivial page to the VM today and load it over HTTPS from off-campus.

> **🤝 H1 — collections frozen, content signatures live, seed working, something deployed.**

---

## Sprint 2 — API routes and email (Days 3–4 · 20h)

### ☑ A2.1 — Registration endpoint `5h` — **the highest-risk task in the build**
**Files:** `app/api/register/route.ts`
- Contract in `CONTRACT.md` §5. **Ship a stub returning realistic confirmed / waitlisted /
  duplicate / closed results by end of Day 1** so your own form UI work in Sprint 3 has
  something to build against.
- Capacity enforced inside a **SQLite transaction** (`payload.db.drizzle.transaction`) that
  re-counts confirmed registrations before inserting. A read-then-write is a defect, not a
  style choice — a WhatsApp blast produces ~500 concurrent registrations.
- Over capacity → waitlist with `waitlistPosition`. Past deadline → `CLOSED`, no write.
  Duplicate (lowercased email + event) → `DUPLICATE` with a resend link, never a crash.
  `restrictToInstituteEmail` → validate the domain when set.
- Store the consent text and timestamp on the record. Queue the email, **never await it**.
  Return in < 500ms.

**Done when:** 50 simultaneous registrations against a capacity-10 event yield exactly 10
confirmed and 40 waitlisted.

### ☑ A2.2 — Availability endpoint `2h`
**Files:** `app/api/events/[slug]/availability/route.ts`
- Live counts for the capacity indicator on a statically-generated page. Cheap, cacheable
  for a few seconds, and explicitly advisory — A2.1 is the authority.

### ☑ A2.3 — Email `6h` · deliverability is a rated High risk
**Files:** `lib/email/**`
- `@payloadcms/email-nodemailer` against the institute SMTP relay.
- react-email templates: registration confirmation (with `.ics` attached), waitlist
  confirmation, waitlist promotion, contact auto-acknowledgement, contact routing
  notification, resend confirmation.
- Record `emailStatus` on the source document so failures surface with a retry. **The write
  must persist even when email fails.**
- Flag the SPF/DKIM/DMARC dependency loudly on Day 5 — it blocks deliverability, not code.

### ☑ A2.4 — Calendar file `2h`
**Files:** `app/api/ics/[slug]/route.ts`
- `.ics` with correct IST→UTC handling, venue, description, organiser. Also return a Google
  Calendar template URL for the inline success state.

### ☑ A2.5 — Contact and subscribe `3h`
**Files:** `app/api/contact/route.ts`, `app/api/subscribe/route.ts`
- Persist first, then send. Auto-acknowledge the sender; route to the vertical mailbox from
  the **admin-editable** `categoryRoutingMap` in settings — changing it must need no deploy.
- Subscribe: lowercase and unique, `source` tag, consent text and timestamp stored.

### ☑ A2.6 — Abuse controls `2h`
**Files:** `lib/rate-limit.ts`
- Honeypot field `website` on every public endpoint; IP rate limiting via an in-process
  token bucket with a SQLite fallback `[ASSUMPTION: no Redis vendor in V1]`. No CAPTCHA
  unless spam appears.

> **🤝 H2 — all five routes live; publish in `/admin` and watch a public page change.**

---

## Sprint 3 — The events experience (Days 5–6 · 21h)

You own this end to end: the pages, the form, the endpoint behind it, and the email out.

### ☑ A3.1 — Events list `3h`
**Files:** `app/(public)/events/page.tsx`
- Upcoming ascending, past descending, filter by event type reflected in the URL.
- An event whose `endDateTime` has passed moves to Past **automatically at next
  revalidation** — no admin action, so the homepage can never show a stale event.
- Build from Agent B's `components/ui` and `components/public/event-card`. Do not write your
  own card.

### ☑ A3.2 — Event detail `5h` · the highest-frequency job on the site
**Files:** `app/(public)/events/[slug]/page.tsx`
- Hero image, title, date/time in IST, venue with map link, format badge, speakers with
  photo and bio, agenda blocks, registration deadline, capacity indicator, register CTA.
- **Sticky register button on mobile.** This page is reached from a WhatsApp link on a 4G
  phone; everything else is secondary to that.
- `generateStaticParams` from `getAllEventSlugs()`. OG tags point at the event's hero
  poster — dynamic OG generation is cut.

### ☑ A3.3 — Past-event recap mode `3h`
- Same route switches to recap: recap text, photo gallery (lightbox, keyboard navigable),
  embedded recording. No registration form.

### ☑ A3.4 — Registration form `5h` · **the highest-value UI in the build**
**Files:** `components/public/registration-form.tsx`
- Expands **inline** on the event page: no route change, no modal that traps scroll.
- `react-hook-form` + the zod schema from `lib/schemas`.
- Fields: name, email, phone, batch/organisation, role, up to 3 custom questions rendered
  from `registrationFields`, consent checkbox, hidden honeypot (`website`, `tabindex="-1"`,
  `aria-hidden="true"`).
- Every state, built against your own stub: closed · full → "Join waitlist" with a note on
  how promotion works · `DUPLICATE` → "You're already registered — check your inbox" plus a
  resend link · `RATE_LIMITED` · `SERVER_ERROR` · pending → disabled submit, no double
  submission.
- Errors announced to screen readers; focus moves to the first invalid field.

### ☑ A3.5 — Success state and calendar `2h`
- Inline success with date and venue plus an add-to-calendar button, for the many users who
  never open the email. Fire `register_start` and `registration_complete`.

### ☑ A3.6 — Revalidation hooks `3h`
**Files:** `collections/**` hooks
- Payload `afterChange` / `afterDelete` call `pathsFor()` from Agent B's
  `lib/revalidation.ts` and `revalidatePath` each. **Must reflect within 10 seconds.**
- Verify by publishing from a phone and watching the public page.

> **🤝 H3 — register end to end with a real email and a working calendar file.**

---

## Sprint 4 — Operations and hardening (Days 7–8 · 24h)

### ☑ A4.1 — Registrations view and export `4h`
**Files:** `collections/Registrations.ts` admin config, `app/api/registrations/csv/route.ts`
- Payload list view configured for the job: filter by event and status, mark attendance,
  **promote from waitlist** in one click (sends the promotion email) `[ASSUMPTION: manual
  promotion]`.
- **CSV export with every custom question as its own column.** Export parity is what stops
  the team drifting back to Google Forms.

### ☑ A4.2 — Backups `4h` · *the one operational task I would not cut*
**Files:** `deploy/backup.sh`, cron entry
- Nightly SQLite + `/media` dump, **copied off the box**, with rotation.
- **Test a restore onto a clean directory before launch and record that you did.** An
  untested backup is a belief, not a backup.

### ☑ A4.3 — Monitoring `2h`
- Uptime check to a club address, disk-space alert, log rotation, systemd restart alerts.

### ☑ A4.4 — Tests `5h`
- Vitest: every zod schema; **the capacity transaction under simulated concurrency**; slug
  uniqueness; the category routing resolver.
- Playwright: student registers from a shared link; editor publishes an event at 390px.

### ☑ A4.5 — Admin usability pass `3h` · PRD §7
- Walk the three highest-frequency actions on a real 390px viewport: publish an event,
  check a registration count, read a submission.
- Fix field labels and descriptions that assume knowledge. **The console explaining itself
  is the named mitigation for the biggest adoption risk in the PRD** — an incoming team that
  cannot use it is how this project dies.

### ☑ A4.6 — Retention and data hygiene `2h` · PRD §7
- Documented purge for registrations older than two academic years; export-then-purge
  script; confirm no founder contact detail is stored without `contactConsent`.

### ☑ A4.7 — Handover kit `2h` · PRD Appendix
**Files:** `docs/handover-guide.md`, `docs/annual-checklist.md`
- **Two pages, not ten.** How to publish an event, export registrations, add and remove
  users, and who owns the VM. Plus the PRD's annual checklist and a screen recording of the
  publish flow.

### ☐ A4.8 — Production deploy `2h`
- Prod env, domain and DNS, TLS verified, service enabled on boot. Confirm every account —
  domain, GitHub, VM, email — is owned by a **club address, never a personal one**.

> **🤝 H4 — deployed over HTTPS, backups tested, tests green.**

---

## Your recurring obligations

- Append to `DECISIONS.md` when you freeze or change an interface, add a dependency, or
  discover something that changes Agent B's work.
- Re-read `CONTRACT.md` at every handshake and check for drift.
- Never edit a file Agent B owns. Request it instead.
