# EntreVC Website & Portal — Execution Plan

**Derived from:** `EntreVC_Website_PRD.pdf` (Club Brief v1.0) and `entrevc-website-prd.pdf`
(PRD v2.0). v2.0 is authoritative; v1.0 verifies nothing from the club's original scope was
dropped.
**Plan version:** 2.0 — revised for self-hosting on a college VM · **10 Sep 2026**
**Build model:** two AI agents in parallel · **Target:** 8 working days to launch.

---

## 1. What changed from plan v1.0, and why

The hosting mandate landed after the first plan: the site must run on a college-provided
VM, so Firebase and Vercel are out. Three revisions followed.

| | Plan v1.0 | Plan v2.0 |
|---|---|---|
| Hosting | Vercel + Firebase | Next.js 15 on a college VM, behind Caddy |
| Database | Firestore | SQLite on disk |
| Admin console | ~39h hand-built | **Payload 3, configured** — ~12h |
| Auth, roles, media, drafts, versions | hand-built | supplied by Payload |
| Scheduled jobs | Cloud Functions | node-cron in-process (mostly cut) |
| Email | Resend | nodemailer → institute SMTP relay |
| Agent split | Console vs Public | Data+Events vs Design+Site |
| Total effort | 231h | **151h** |

**The architecture survived the move**, which is the point of having drawn a seam through
it: `lib/content/*` is a set of function signatures Agent B consumes without knowing what
is behind them. Firestore became Payload-over-SQLite and the signatures did not change.

**Payload is the decision that pays for the hosting change.** Configuring collections
instead of building a console removes 27h, and hands back for free several things v1.0 had
cut for cost: a media library, draft/version history, and role management. What you give up
against Firebase is operational — backups, TLS and uptime are now yours. That is roughly
12h of work and one recurring responsibility.

**Features cut from V1** (confirmed): global search · scheduled publishing · dynamically
generated OG images, replaced by each event's hero poster · gated resource downloads ·
a bespoke media library · a bespoke revision viewer. Also cut: the `in_review` state and
the `contributor`/`viewer` roles — two roles, `admin` and `editor`, not four.

**Still explicitly out of scope** (PRD v2.0, unchanged): public startup self-submission ·
1:1 mentor booking · EntreFair board · blog & newsletter archive · student login ·
payments · multi-language · native apps · double opt-in.

---

## 2. Architecture in one page

```
                     ┌─────────────────────────────────────────────┐
  Public visitor ───▶│  College VM · Caddy (TLS) · systemd          │
  (4G phone)         │                                              │
                     │  Next.js 15 — one app                        │
                     │    app/(public)/**   static, on-demand ISR   │◀── Agent B
                     │        ↓ reads at build                      │
                     │    lib/content/*  (Payload Local API + zod)  │◀── Agent A
                     │        ↓                                     │
                     │    SQLite  ─── content + registrations       │
                     │        ↑                                     │
                     │    app/api/*  register · contact · subscribe │◀── Agent A
                     │        ↑                                     │
  Club team ────────▶│    Payload admin at /admin                   │◀── configured,
  (email login)      │      publish → afterChange → revalidatePath  │    not built
                     └─────────────────────────────────────────────┘
                                    │
                          /media on disk · nightly backup offsite
```

Four properties matter; everything else follows.

1. **Reads are static.** Most visitors hit pre-rendered HTML, so a small VM is not a
   constraint and the 2.5s LCP target stays reachable without an edge network.
2. **Publishing is instant.** Payload's `afterChange` hook revalidates the affected paths,
   so an editor sees the change within ten seconds — no rebuild, no deploy.
3. **The one contended write is capacity.** `registerForEvent` re-counts inside a SQLite
   transaction. In a single Node process with `better-sqlite3` this is *stronger* than the
   Firestore version it replaces, and far easier to test.
4. **The content layer is a seam.** Nothing outside `lib/content/` knows Payload exists.
   That seam has already survived one platform migration.

**Never build on the VM.** Next builds are memory-hungry and will OOM on a small box. Build
in CI or locally, rsync the standalone output, restart the service. Runtime footprint is
roughly 400MB including the Payload admin.

---

## 3. Decisions taken to unblock the build

Defaults are baked into the task docs and flagged `[ASSUMPTION]` at their point of use, so
reversing one is a small, localised edit.

| # | Question | Default | Needs you? |
|---|---|---|---|
| 1 | Domain and DNS | `NEXT_PUBLIC_SITE_URL` env var, placeholder `entrevc.in` | **Blocks Day 8 deploy** |
| 2 | Transactional email | nodemailer → institute SMTP relay; SPF/DKIM/DMARC on the club domain | **Blocks Day 6** |
| 3 | Alumni venture consent | Per-listing written consent; publish blocked without `listingApproval.approved` | Confirm |
| 4 | Institute-email restriction | Off by default, per-event toggle | Confirm |
| 5 | Waitlist promotion | Manual — one click in the admin, sends a promotion email | Confirm |
| 6 | Playbook format | Chaptered web version + uploaded PDF. No PDF generation is built | Confirm |
| 7 | Database | SQLite. **Switch to Postgres only if the VM's storage is NFS-mounted** — SQLite on a network filesystem corrupts | Check with IT |
| 8 | Rate limiting | In-process token bucket with a SQLite fallback; no Redis vendor | — |

**Testing**, which the PRD does not specify: the capacity race is a rated *High impact*
risk, so this plan adds Vitest over every schema and the capacity transaction under
simulated concurrency, plus two Playwright flows (register from a shared link; publish an
event at 390px). About 5h, and the only thing separating "worked when I tried it" from
"survives 500 concurrent registrations".

---

## 4. Why this split, and where it is fragile

The layer split from v1.0 stopped balancing once Payload absorbed the console. The new
split gives Agent A the entire events-and-registration path — form UI, endpoint,
transaction, email — which removes the one seam that used to cross both agents on the
highest-risk feature in the build.

Agent A works in `payload.config.ts`, `collections/`, `lib/{schemas,content,email}`,
`app/api/`, `app/(public)/events/` and `deploy/`. Agent B works in everything else public.
No file is written by both.

| Seam | Risk | Mitigation |
|---|---|---|
| Collection shape | B builds pages against a schema A later changes | Frozen at H1; changes go through `DECISIONS.md`; B imports A's types rather than redeclaring them |
| B needs data that does not exist | B blocked behind A's CMS | `npm run seed` on Day 1; B never opens `/admin` to get data |
| Revalidation map | A calls `pathsFor()`; B owns it | B keeps it exhaustive as routes land; verified at H2 by publishing and watching a page change |
| Ops work lands late | Deploy, TLS and backups discovered on Day 8 | VM provisioning is a **Sprint 1** task, not a launch task — deploy something trivial on Day 2 |

**Balance:** A ≈ 77h, B ≈ 74h. Treat these as relative weights, not a schedule — AI agents
compress task types very differently. The handshakes govern the timeline, not the hours.

---

## 5. Timeline

Eight working days, both agents running.

```
Day   0    1    2    3    4    5    6    7    8
      ├────┼────┼────┼────┼────┼────┼────┼────┤
 A    ██S0 █████S1████│████S2████│████S3████│██S4██│ Launch
      bootstrap Payload    API routes   events pages  admin view
      (joint)   collections email/.ics   detail/recap  deploy/backup
                seed/VM     register     reg form UI   tests
 B    ░░S0 ░░░░░S1░░░░│░░░░S2░░░░│░░░░S3░░░░│░░S4░░│ Launch
      bootstrap tokens/    startups/    home/team/   a11y/perf
      (joint)   UI kit/    resources/   contact/SEO  QA
                layout     iima-vc
      ▲              ▲          ▲          ▲      ▲
      H0             H1         H2         H3     H4
```

| Sprint | Days | Agent A | Agent B | Exit |
|---|---|---|---|---|
| **0** | Day 0, joint | Scaffold, deps, Payload boots, branches | Reviews scaffold, confirms tokens | **H0** |
| **1** | 1–2 | Collections, content layer, seed, VM + Caddy + first deploy | Tokens, UI kit, layout, shared components | **H1** |
| **2** | 3–4 | Register endpoint + transaction, email + `.ics`, contact, subscribe, revalidation hooks | Startups directory + detail, IIMA Ventures, resources, playbook | **H2** |
| **3** | 5–6 | Events list, detail, recap, registration form UI | Homepage, team, contact, metadata, sitemap, analytics | **H3** |
| **4** | 7–8 | Registrations view + CSV, backups, monitoring, tests, handover guide | a11y, performance, responsive QA, error states | **H4** |
| **Launch** | Day 8 | Prod deploy, DNS, TLS | Content entry session with the club | DoD §7 |

---

## 6. Risk register

The PRD's own risks stand. These are the ones self-hosting and the parallel build add.

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Nobody backs up the VM** — two years of registrations lost to one bad command | High | Medium | Nightly SQLite + `/media` dump copied **off the box**, in Sprint 4, verified by a restore test before launch |
| No edge network — off-campus visitors pay full latency | Medium | High | Static generation, compression and cache headers in Caddy; ask IT whether a CDN proxy is permitted, which is usually allowed since it is not hosting |
| Build run on the VM, OOMs | Medium | Medium | Build in CI only; the deploy script refuses to run `next build` on the server |
| SQLite on NFS-mounted storage corrupts | High | Low | Confirm the storage type with IT in Sprint 0; Postgres if network-mounted |
| VM patching and uptime depend on college IT | Medium | Medium | Document who owns the box in the handover guide; monitoring alerts to a club address |
| Collection drift after H1 breaks B's pages | High | Medium | Contract change protocol; typecheck at every handshake |
| Deploy discovered to be broken on Day 8 | High | Medium | Deploy a trivial page to the VM on **Day 2**, not Day 8 |
| Site outgrows the free-form content model | Low | Low | Payload migrations exist; the content layer is a seam |
| Team drifts back to Google Forms | High | Medium | CSV export parity, and a publish flow strictly faster than making a form |

---

## 7. Definition of Done

- [ ] A club member with no code access publishes an event from a phone in under 5 minutes.
- [ ] A student registers and receives a confirmation email with a working `.ics` in 30s.
- [ ] Registering past capacity produces a waitlist entry; capacity holds under a simulated
      concurrent burst.
- [ ] Duplicate registration is rejected with a friendly message and a resend link.
- [ ] Registrations export to CSV with every custom question as a column.
- [ ] The startup directory filters (sector AND stage AND batch), reflects state in the URL,
      and the filtered URL is shareable.
- [ ] No startup is published without `listingApproval.approved === true`.
- [ ] Contact submissions route by the admin-editable category map with no deploy.
- [ ] Publishing reflects on the public page within 10 seconds.
- [ ] LCP < 2.5s on a throttled 4G Lighthouse run; homepage JS < 150KB.
- [ ] WCAG 2.1 AA on home, event detail, registration form, startup directory, contact.
- [ ] HTTPS with automatic renewal; site reachable from outside the campus network.
- [ ] **Backups run nightly, land off the box, and a restore has been tested once.**
- [ ] Vitest green, including capacity under concurrency; two Playwright flows green.
- [ ] Handover guide (2 pages) + screen recording + the PRD's annual checklist in the repo.

---

## 8. What has to come from a human

| # | By | What | Blocks |
|---|---|---|---|
| 1 | Day 0 | VM provisioned: SSH access, public IP *(confirmed)*, storage type known, ports 80/443 open | Sprint 1 deploy |
| 2 | Day 0 | GitHub repo under a club-owned account, for CI | Deploy pipeline |
| 3 | Day 1 | `brand/` completed — vector logo, square mark, fonts. See `brand/README.md` | B's final theming; placeholders hold until then |
| 4 | Day 5 | Institute SMTP relay credentials, and SPF/DKIM/DMARC on the club domain | Confirmation emails not landing in spam |
| 5 | Day 7 | Domain decision + DNS pointed at the VM | Launch |
| 6 | Day 7 | Answers to the `[ASSUMPTION]` items in §3 | Locking behaviour before launch |
| 7 | Day 8 | Real content — events, startups, schemes, playbook, team, photos | Launch. A club activity, ~4h, not a dev task |
| 8 | Day 8 | GA4 property + measurement ID | Analytics |
| 9 | Ongoing | Somewhere off the VM to send nightly backups | The backup task |

---

## 9. Post-launch backlog

**Phase 2:** global search · blog & newsletter archive · gated resources · public startup
submission with an approval queue · scheduled publishing · mentor/investor 1:1 booking ·
QR check-in · double opt-in.

**Phase 3:** EntreFair board — its own PRD, a workflow product not a page · co-founder
matching · alumni self-service profile claiming · public directory API.

**Hooks already in place** so Phase 2 needs no migration: `resources` carries `type` and
`tags` broad enough to absorb blog posts; `subscribers.source` distinguishes signup origin;
Payload's draft state supports a future submission queue; Payload ships scheduled publishing
and versioning that this plan simply leaves unconfigured.
