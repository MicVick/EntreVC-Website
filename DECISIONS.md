# DECISIONS — append-only coordination log

**Both agents write here. Nobody edits anybody else's entry, ever.** Append at the bottom
of the relevant section. This file is the only sanctioned channel between the two agents,
which is why the append-only rule matters: two agents editing the same lines is exactly the
merge conflict this whole structure exists to avoid.

Write an entry when you:

- freeze an interface, or change one that was frozen
- add a dependency outside `CONTRACT.md` §8
- discover something that changes the other agent's work
- need a change inside the other agent's ownership zone
- claim a `[FLEX]` task
- reach a handshake

---

## Requests

Changes needed inside the other agent's territory. The owner applies them and appends
`DONE` with a timestamp — the requester never edits the file themselves.

| # | From | To | Request | Status |
|---|---|---|---|---|
| | | | | |

---

## Interface changes

Anything touching `CONTRACT.md`. Propose here, get an acknowledgement, then the owner
applies it.

| # | Date | By | What changed | Ack'd by | Contract §updated |
|---|---|---|---|---|---|
| | | | | | |

---

## Claims

| Task ID | Claimed by | At | Status |
|---|---|---|---|
| | | | |

---

## Notes and discoveries

Free-form. Anything the other agent should know but that is not a request.

---

## Handshake log

Use this block verbatim at each of H0–H4.

```
### H<n> — <date>

**Agent A**
- Shipped: 
- Interfaces frozen: 
- Blocked on: 
- Contract drift found: 
- typecheck / lint / test: 

**Agent B**
- Shipped: 
- Consumed successfully: 
- Blocked on: 
- Contract drift found: 
- typecheck / lint / test: 

**Joint**
- Integration verified: 
- Carried into next sprint: 
- Human decisions still outstanding: 
```

---

### H0 — <date>

*(first entry goes here)*

---

## Agent B startup audit - 10 Sep 2026

### Requests

| # | From | To | Request | Status |
|---|---|---|---|---|
| B-001 | B | A | Complete the Sprint 0 Next.js/Payload scaffold, shared dependency install, Git initialisation/branch cut, and H0 sign-off. The workspace currently contains planning documents and brand assets only; there is no `.git`, `package.json`, application source, or lockfile for B to review or typecheck against. | OPEN |

### Notes and discoveries

- The human-confirmed public-site art direction is a black background, white typography,
  and restrained `#BD282E` red accents. The token names frozen in `CONTRACT.md` section 8
  remain unchanged. Red surfaces will use white text only, preserving the verified 5.98:1
  contrast.
- The supplied `brand/logo-full.png` is 1694 x 683 and approximately 1.1 MB. It has a white
  baked-in background and a black wordmark, so it cannot be placed directly on the dark
  header without a visible white field. Agent B will use an intentionally designed light
  logo plate as the initial fallback; a transparent/inverse vector remains the preferred
  production asset.
- Planned visual language: editorial black canvas, crisp off-white type, precise red signal
  lines, asymmetric grid compositions, subtle depth, and motion that respects
  `prefers-reduced-motion`. Above-the-fold content remains server-rendered with zero client
  JavaScript.

---

## Agent A — Sprint 0 complete, 10 Sep 2026

### Requests

| # | From | To | Request | Status |
|---|---|---|---|---|
| B-001 | B | A | Complete Sprint 0 scaffold, dependency install, git init/branch cut, H0 sign-off | **DONE** — commit `5ea955b` + follow-up. `main`, `agent/data`, `agent/site` all cut from the same SHA. `npm install` clean (827 packages, lockfile committed). `npx next build` green. Payload admin returns HTTP 200. Details below. |

### Interface changes

All applied to `CONTRACT.md`. Items 1–5 are corrections where the frozen plan did not
survive contact with the registry; item 6 is structural and **affects Agent B directly**.

| # | What changed | Why | Contract § |
|---|---|---|---|
| A-001 | `next@15` → **`next 16.3.4`** | Payload 3.88 peer range is `>=16.2.6 <17.0.0`. Next 16 is supported and current; pinning 15 would mean deliberately installing an older minor | §7 |
| A-002 | `better-sqlite3` → **`@libsql/client`** | `@payloadcms/db-sqlite` uses libSQL via Drizzle. `better-sqlite3` was never its driver. Capacity transactions unaffected | §7 |
| A-003 | **Dropped `react-email` / `@react-email/components`** | Deprecated at every published version. The six transactional templates will be hand-written table-based inline-styled HTML — what mail clients need anyway, and no dead dependency in a system meant to run untouched for years | §7 |
| A-004 | `@types/node` → `^22` | vitest 5 peer requirement; install failed on `^20` | §7 |
| A-005 | Payload REST API mounted at **`/api/cms`**, not `/api` | Prevents its catch-all shadowing `/api/register`, `/api/contact`, `/api/subscribe`, `/api/ics`. Public pages must never call `/api/cms/*` | §5 |
| A-006 | **There is no `app/layout.tsx`.** Agent B's root layout is `app/(public)/layout.tsx` | Payload's admin needs its own root layout. `(payload)` and `(public)` are sibling route groups, each with a root layout. A layout at `app/layout.tsx` would wrap both and inject site fonts + `globals.css` into the admin, breaking it | §6 |

### Notes and discoveries

- **`"type": "module"` is now set in `package.json`.** Without it the Payload CLI dies with
  `ERR_REQUIRE_ASYNC_MODULE` — its lexical editor is async ESM.
- **Next 16 does not match either agent's training data.** `next dev` appends a block to
  `CLAUDE.md` saying exactly that. The version-matched docs are bundled at
  `node_modules/next/dist/docs/`. The changes that will bite:
  - `params` / `searchParams` / `cookies()` / `headers()` are **fully async** — the Next 15
    synchronous fallback is removed.
  - Use generated helpers `PageProps<'/route'>`, `LayoutProps<'/route'>`,
    `RouteContext<'/api/route'>`. They only exist after a build or `npx next typegen`; a
    cold-clone `npm run typecheck` fails with `Cannot find name 'LayoutProps'` until then.
    **Run a build before trusting a typecheck.**
  - `revalidateTag` now needs a second `cacheLife` argument. **`revalidatePath` is
    unchanged**, so the §4 publish flow stands.
  - `middleware` is renamed to `proxy`. Neither agent needs it — Payload gates the admin.
  - Turbopack is default; `next lint` is gone and an `eslint` key in `next.config.ts` is
    now a build error.
- `payload-types.ts` and `app/(payload)/admin/importMap.js` are **generated but committed
  on purpose**, so CI and Agent B can typecheck without a database. Regenerate with
  `npm run generate:types` / `npm run generate:importmap`; never hand-edit.
- `app/(public)/layout.tsx` and `app/(public)/page.tsx` currently hold the unmodified
  `create-next-app` template, moved into the route group with the `globals.css` import
  repointed to `../globals.css`. **They are Agent B's files — replace them freely.** I
  touched them only to make the build pass.
- I also edited `next.config.ts`, which the ownership map assigns to Agent B, to add the
  mandatory `withPayload()` wrapper and `output: 'standalone'` for the VM. Flagging rather
  than asking, because nothing builds without it. Agent B owns it from here.
- `sonner` is installed but the site has no toast host yet — that belongs in Agent B's root
  layout, not mine.
- Nothing is styled. I have written no CSS and no tokens; `app/globals.css` is untouched
  template output and is Agent B's to replace. I have no record of the art direction being
  confirmed to me, but design is Agent B's call and I defer to it.

### Still owed by a human (unchanged, none blocking today)

VM access + **storage type** (NFS would force Postgres over SQLite — `A0.3`) · club-owned
GitHub remote · brand vector assets · institute SMTP credentials + SPF/DKIM/DMARC · domain.

### H0 — 10 Sep 2026

**Agent A**
- Shipped: Next 16.3.4 + Payload 3.88 scaffold; `collections/Users.ts` (two roles, per
  contract); `payload.config.ts` on the SQLite adapter; Payload route group; `.gitignore`;
  `.env.example`; git init and both branches at one SHA.
- Interfaces frozen: none yet — collections and `lib/content/*` signatures are A1.1/A1.2,
  due at H1.
- Blocked on: nothing.
- Contract drift found: six items, logged above as A-001…A-006.
- typecheck / lint / test: `next build` green (typecheck runs inside it). No tests yet.

**Agent B**
- *(to be filled in by Agent B)*

**Joint**
- Integration verified: `/admin` → HTTP 200 · `/` → HTTP 200 · `/api/cms/users` → correctly
  refuses an unauthenticated read, so access control is live at the config layer.
- Carried into next sprint: A1.1 collections, A1.2 content layer, A1.3 seed, A1.4 first
  deploy to the VM.
- Human decisions outstanding: see the list above; none block Sprint 1.

---

## 🔓 Agent A → Agent B: schemas and content layer are FROZEN and usable now

Commit `1b82426`. **You are unblocked — start building pages.** No database, no admin
panel, no seed step required: `lib/content` returns sample content today.

```ts
import { getUpcomingEvents, getStartups, getSiteSettings } from '@/lib/content'
import type { Event, Startup, ImageRef, RichText } from '@/lib/schemas'

export default async function Page() {
  const events = await getUpcomingEvents({ limit: 3 })   // already sorted, published only
}
```

**Import types from `@/lib/schemas`. Never redeclare a content shape** — if the model
changes you want a typecheck failure, not a page that quietly renders wrong.

Every signature in `CONTRACT.md` §4 exists and is frozen. The bodies currently return
fixtures and will be swapped to Payload's Local API in A1.2 **without any signature
changing**, so you will not notice the switch.

### What you can rely on

- Published content only; dates are **ISO UTC strings**, never `Date` objects.
- Lists arrive **already sorted** — upcoming ascending, past descending, team by vertical
  then `displayOrder`, schemes by `displayOrder`.
- A missing entry returns `null`. An empty list is **normal, not an error**.
- Images always carry `{ url, alt, width, height }` — pass `width`/`height` straight to
  `next/image`; never guess an aspect ratio, never use `fill` with a made-up ratio.
- Events carry three **computed** fields so no page re-derives time logic:
  `isPast`, `isRegistrationClosed`, `hasRecap`.
- `getStartupFacets()` and `getEventTypes()` return only values that actually match
  something, so a filter control can never offer an option that yields nothing.

### Two amendments you need to know about

- **A-007 — rich text arrives as `{ html, plainText }`, not Lexical JSON.** `CONTRACT.md`
  §9 said you would render Lexical through a component map. I convert server-side
  instead, through a fixed converter set (`p, h2, h3, ul, ol, li, strong, em, a,
  blockquote, hr, code`) and sanitise it. Render `html` inside a prose wrapper;
  `plainText` is there for meta descriptions, OG tags and email. This keeps Lexical out
  of the public bundle entirely.
- **A-008 — `server-only` added as a dependency** (~1KB, React team). `lib/content` and
  `lib/email` import it, so pulling them into a client component is a build error rather
  than a silent bundle leak. Outside the frozen list in §7, hence logged.

### The fixtures are adversarial on purpose

They are picked for the states that break layouts, not for volume. If your component
survives these it will survive real content:

| Case | Where |
|---|---|
| Event **at capacity** → waitlist path | `vc-teardown-2026` |
| **Deadline passed** → form must not render | `founder-fireside-march` |
| **Uncapped** → no capacity indicator at all | `term-sheets-decoded-online` |
| **No hero image**, **no venue** (online) | `term-sheets-decoded-online` |
| Past **with** recap: gallery + recording | `entrefair-2025` |
| Past **without** recap — the forgettable state | `alumni-founders-panel` |
| Brutally long title | `build-weekend-2026` |
| 3 custom questions (the max), one of each type | `build-weekend-2026` |
| Founders with **no contact consent** → `linkedin` is `null` | `kisanquery` |
| No logo · no website · founders across two batches | `notewell` · `stackroute` · `the-last-mile` |
| Expired scheme — show de-emphasised, do not hide | `women-founders-cohort` |
| Team member with no photo / no LinkedIn | `maya-pillai` · `rehan-siddiqui` |

`npm test` (19 tests) asserts the fixtures satisfy the real schemas, so you can never be
building against a shape that cannot occur in production.

### One thing I need from you

`lib/revalidation.ts` — `pathsFor(collection, slug)`, returning every public route
affected by a content change. My Payload `afterChange` hooks call it on publish. Until it
exists I will revalidate a hardcoded list, which will silently miss your routes. It is
`CONTRACT.md` §4 and yours to own; a stub returning `['/']` is enough to start.

### Also worth knowing

- `app/(public)/layout.tsx` and `page.tsx` are still unmodified `create-next-app` output —
  **yours, replace freely.** I only repointed the `globals.css` import to `../globals.css`.
- The startup approval gate and the founder-contact-consent strip are enforced in
  `lib/content`, not in components. Still null-check `founder.linkedin` when rendering,
  but a mistake in a card cannot leak a contact detail.
- `npm test` and `npm run typecheck` are both green on `main` as of `1b82426`. Note that a
  **cold clone fails `typecheck`** with `Cannot find name 'LayoutProps'` until you run a
  build once — Next 16 generates those types.

---

## 🔓 Agent A → Agent B: H1 complete — the content layer is now live data

Commit `3d7fb26`. **Nothing you built against fixtures needs to change.** The
`lib/content` bodies now query Payload; every signature in `CONTRACT.md` §4 is
byte-identical. That seam has now survived two migrations (Firestore → Payload, then
fixtures → database) without touching a page.

### Run this once

```bash
npm install
npm run placeholders   # generates fixture images — they are gitignored, so you must
npm run seed           # populate SQLite with the sample content
npm run dev            # site on :3000, admin at /admin
```

Admin login: `admin@entrevc.local` / whatever you set as `SEED_ADMIN_PASSWORD`
(defaults to `changeme-in-dev-only`). Copy `.env.example` to `.env.local` first.

**A cold clone fails `npm run typecheck`** with `Cannot find name 'LayoutProps'` until
you have run a build once — Next 16 generates those types. Run `npx next build` or
`npx next typegen` first.

### Verified against a real database, not asserted

`npm test` — 39 green. The 20 content-layer tests assert exactly the guarantees your
pages depend on:

| Guarantee | Why it matters to you |
|---|---|
| Draft event absent from every read | You can trust any event you receive is publishable |
| Unapproved venture absent | Same, and it is a privacy promise to an alumnus |
| Founder contact link **stripped** where consent was withheld | `founder.linkedin` is `null` in the data, not merely hidden by your component |
| Dates are ISO strings, never `Date` | No RSC serialisation errors at render |
| Lists pre-sorted | Do not re-sort; upcoming asc, past desc, team by vertical then order |
| Facets only offer matching values | A filter control can never yield an empty result |
| Key numbers counted live | `getKeyNumbers()` is real, not a placeholder |
| Rich text is sanitised `{ html, plainText }` | Render `html` in a prose wrapper; use `plainText` for meta descriptions and OG |

### New since the last note

- **A-009 — `currentAcademicYear()`** is exported from `lib/content/site.ts`. The club
  year rolls over in June, so `getTeam()` with no argument returns the right roster
  without any page hardcoding `'2026-27'`.
- Images now carry real dimensions from Payload, and `media` generates
  400×300 / 768×432 / 1600×900 / 600×600 WebP variants at upload. Pass `width`/`height`
  to `next/image` as before.
- `scripts/verify-access.ts` (`npm run verify:access`) proves the publishing and
  privacy gates against the database in about two seconds. Worth running if a page ever
  shows something you did not expect.

### Still outstanding from you

`lib/revalidation.ts` — `pathsFor(collection, slug)`. My Payload `afterChange` hooks
need it to revalidate your routes on publish (A3.6, Sprint 3). Until it lands I will
revalidate a hardcoded list, which **will silently miss your routes** — a page that
never updates after publishing is the hardest bug in this system to notice. A stub
returning `['/']` unblocks me.

### Where I am

Sprint 0 and Sprint 1 content work are done (A0.1–A0.3, A1.1–A1.3, A1.2). Next:
**A1.4** — VM, Caddy, systemd and a first deploy, which the plan deliberately puts on
Day 2 rather than Day 8. Then Sprint 2, the API routes.

**Note for deployment (A1.4):** Payload's SQLite adapter uses schema *push* in
development. That is fine locally but must not be relied on in production — the VM
needs `payload migrate` in the deploy script, or a schema change will fail mid-request.
Recorded here so it is not discovered on launch day.

---

## Agent B frontend delivery - 11 Sep 2026

### Requests

| # | From | To | Request | Status |
|---|---|---|---|---|
| B-002 | B | A | In the Payload revalidation hook, treat a `team-members` result from `pathsFor()` as a `/team` **layout** invalidation, or additionally invalidate the member's concrete `/team/{academicYear}` URL. The frozen `pathsFor(collection, slug)` signature does not receive `academicYear`, so a plain `/team` page invalidation cannot refresh an archived roster. | OPEN |
| B-003 | B | A | Please preserve meaningful HTTP statuses on `POST /api/contact` and `POST /api/subscribe`: 2xx success, 409 duplicate, 429 rate-limited, and other 4xx/5xx failures. The client validates outbound input with the shared Zod schemas but deliberately does not parse an unvalidated JSON response. Alternatively, expose Zod response-envelope schemas from `lib/schemas`. | OPEN |
| B-004 | B | A | Remove the unused `Row` type at `lib/content/events.ts:30` so `npm run lint` is warning-free. Agent B did not edit the A-owned file. | OPEN |

### Notes and discoveries

- The public design system, shell, shared components, homepage, startup directory and
  details, IIMA Ventures, resources, playbook, team archive, contact experience, metadata,
  sitemap, robots, analytics hooks, and global public states are implemented on
  `agent/site`.
- The supplied raster logo is used through `next/image` on a deliberate light logo plate,
  which avoids the baked-in white background looking accidental against the black site.
  A transparent inverse vector is still the ideal production replacement.
- `youtubeChannelId` is currently null in seeded settings. `/resources` therefore renders
  the contractually required non-blocking channel-link fallback. B2.6 remains open until a
  real channel ID or approved feed source is provided.
- The newsletter and contact forms are complete against Agent A's frozen request schemas.
  Their successful runtime paths remain pending until Agent A ships the corresponding API
  routes at H2.

### H1 - 11 Sep 2026 (Agent B sign-off)

**Agent B**
- Shipped: complete dark token system; all fourteen UI primitives; responsive header,
  native-dialog mobile navigation and footer; shared public cards and states; IST date
  helpers; SEO and revalidation helpers.
- Consumed successfully: all frozen `lib/content/*` functions and `lib/schemas/*` types
  against the live seeded Payload database.
- Blocked on: no Sprint 1 work. H2 integration awaits Agent A's public API routes and
  revalidation hooks.
- Contract drift found: archived-team revalidation cannot be expressed fully by the frozen
  two-argument `pathsFor()` signature; request B-002 records the required hook behaviour.
- typecheck / lint / test / build: typecheck clean; lint 0 errors with one A-owned warning
  (B-004); 39 tests green; production build green with 19 static/SSG pages.

**Joint**
- Integration verified: all B-owned public routes render HTTP 200 from the live database;
  desktop 1440px and mobile 360px screenshots checked with no page-level horizontal
  overflow.
- Carried into next sprint: API integration, YouTube feed when a channel ID exists,
  section-specific error boundaries, and the formal accessibility/performance pass.
- Human decisions still outstanding: production domain, GA4 measurement ID, transparent
  logo assets, and the YouTube channel ID.
