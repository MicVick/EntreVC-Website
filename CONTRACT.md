# CONTRACT — the frozen interface between Agent A and Agent B

**Architecture:** Next.js 15 + Payload 3 in a single app, self-hosted on a college VM.
Payload supplies the CMS (admin UI, auth, media, drafts, versions) from configuration
rather than custom code. Public pages are statically generated and revalidated the moment
an editor hits Publish. SQLite on disk holds everything.

**Change protocol:** any change here must be (1) proposed in `DECISIONS.md` under
`## Requests`, (2) acknowledged by the other agent, (3) applied by the owning agent only.
Silent changes break the other agent's build.

This file exists so the two agents can work in parallel **without reading each other's
code**.

---

## 1. The two agents

| | Agent A — *Data, CMS & Events* | Agent B — *Design System & Site* |
|---|---|---|
| Owns | Payload config and collections, content access layer, all API routes, email, the events + registration path end to end, VM and deploy | Design tokens, UI kit, layout, homepage, startups, resources, team, contact, IIMA Ventures, SEO, analytics, a11y, performance |
| Produces for the other | `lib/schemas/*`, `lib/content/*`, sample content, the `ActionResult` shape | `app/globals.css` tokens, `components/ui/*`, `lib/format.ts` |
| Task file | `TASKS_AGENT_A.md` | `TASKS_AGENT_B.md` |
| Branch | `agent/data` | `agent/site` |
| Load | ~77h | ~74h |

Agent A owns the whole registration path — form UI, endpoint, transaction, email —
deliberately. It was the one flow that crossed both agents in earlier drafts, and it is the
highest-risk feature in the build.

---

## 2. The unblocking mechanism

**Seeded content from Day 1.** Agent A ships `scripts/seed.ts` populating a local SQLite
database, and freezes the `lib/content/*` signatures in §4 *before* implementing them.
Agent B runs `npm run seed` and builds every page against real data without ever opening
the admin panel.

Sample content must cover the awkward cases, not just the volume: an event at capacity ·
one past its registration deadline · one past, with recap, gallery and recording · one
draft · one with 3 custom questions · one online and one hybrid · a startup with no
`contactConsent` · two with no logo · one awaiting approval · a resource of every type ·
team members across 2 academic years and 4 verticals · a scheme with a deadline and one
without · a punishingly long title in every collection.

**Corollary:** Agent A writes signatures before implementations. A stub returning the right
shape on Day 1 is worth more than a correct implementation on Day 3.

---

## 3. Payload collections (owner: Agent A, frozen at H1)

Configured in `payload.config.ts` + `collections/`. Payload generates the admin UI, so
**field configuration is the console** — there is no console to build.

| Collection | Notes |
|---|---|
| `events` | drafts + versions on; slug from title; `registrationFields` array (max 3) |
| `startups` | `listingApproval` group; publish blocked without approval |
| `resources` | type, tags, cover, external URL or uploaded file |
| `playbookChapters` | ordered, rich text body |
| `schemes` | IIMA Ventures schemes, `displayOrder` |
| `teamMembers` | `academicYear`, `vertical`, `displayOrder` |
| `media` | upload collection, local disk, sharp sizes, **`alt` required** |
| `users` | Payload auth; roles `admin` \| `editor` |
| `registrations` | public create, authenticated read |
| `submissions` | public create, authenticated read |
| `subscribers` | public create, authenticated read; `email` unique |
| `siteSettings` (global) | positioning, key numbers + overrides, socials, contact emails, category routing map, role contacts |

**Shared enums — these exact values, everywhere:**

```ts
eventFormat   = 'in_person' | 'online' | 'hybrid'
attendeeType  = 'student' | 'alumni' | 'external'
regStatus     = 'confirmed' | 'waitlisted' | 'cancelled'
startupType   = 'alumni' | 'student'
resourceType  = 'article' | 'book' | 'podcast' | 'report' | 'video' | 'template'
submissionCat = 'general' | 'event' | 'startup_listing' | 'sponsorship' | 'speaking' | 'mentorship'
role          = 'admin' | 'editor'
```

Draft/published state is Payload's own `_status`. Roles are two, not four — a `contributor`
tier and a review queue are deliberate cuts.

**Access control**, set in config and never in the UI alone: public read only where
`_status === 'published'`; `registrations`, `submissions` and `subscribers` are
**create-only for the public, read-only for authenticated users**; `users` is admin-only.

**Zod schemas** in `lib/schemas/` mirror the collections and are the type source for both
agents. Agent B imports these types and never redeclares a content shape.

**Startup listings** carry `listingApproval { approved, approvedBy, approvedAt,
evidenceUrl? }`. A `beforeChange` hook rejects publish when `approved !== true`
`[ASSUMPTION: per-listing written consent]`.

---

## 4. Content access layer — `lib/content/` (owner: Agent A, consumed by Agent B)

`import 'server-only'`. Wraps Payload's Local API, parses with zod, returns published
entries only, sorted, dates as ISO UTC strings. Missing entry → `null`.

```ts
// events
getUpcomingEvents(opts?: { limit?: number }): Promise<Event[]>          // asc by startDateTime
getPastEvents(opts?: { limit?: number }): Promise<Event[]>              // desc
getEventBySlug(slug: string): Promise<Event | null>
getAllEventSlugs(): Promise<string[]>
getEventTypes(): Promise<string[]>

// startups
getStartups(filter?: { type?: StartupType }): Promise<Startup[]>
getStartupBySlug(slug: string): Promise<Startup | null>
getAllStartupSlugs(): Promise<string[]>
getFeaturedStartups(opts?: { limit?: number }): Promise<Startup[]>
getStartupFacets(): Promise<{ sectors: string[]; stages: string[]; batches: string[] }>

// resources & playbook
getResources(filter?: { type?: ResourceType; tag?: string }): Promise<Resource[]>
getResourceTags(): Promise<string[]>
getLatestResource(): Promise<Resource | null>
getPlaybookChapters(): Promise<PlaybookChapter[]>                      // asc by order
getPlaybookMeta(): Promise<{ title: string; intro: string; pdfUrl: string | null }>

// schemes, team, settings
getVentureSchemes(): Promise<VentureScheme[]>                          // asc by displayOrder
getIimaVenturesContent(): Promise<IimaVenturesBlock>
getTeam(academicYear?: string): Promise<TeamMember[]>                  // default = current
getTeamYears(): Promise<string[]>                                      // desc
getVerticals(): Promise<{ name: string; description: string; order: number }[]>
getSiteSettings(): Promise<SiteSettings>
getKeyNumbers(): Promise<KeyNumbers>                                   // live counts + admin override
getRoleContacts(): Promise<RoleContact[]>
```

**Rendering contract:** pages are statically generated. Freshness comes from **on-demand
revalidation**, not timers — no page declares `export const revalidate`. Agent A's Payload
`afterChange` hooks call `revalidatePath` through `lib/revalidation.ts`, which Agent B keeps
exhaustive as routes are added:

```ts
export function pathsFor(collection: string, slug?: string): string[]
```

A missing entry there means published content silently fails to appear — the hardest bug in
this system to notice. Publish must reflect within 10 seconds.

---

## 5. Runtime API (owner: Agent A)

Payload's own REST/GraphQL layer is mounted at **`/api/cms`**, not the default `/api`
(`payload.config.ts` → `routes.api`), so its catch-all cannot shadow the public write
endpoints below. Do not call `/api/cms/*` from public pages — it is the admin's transport.

These are the only routes the public site calls:

```
POST /api/register                    → ActionResult<RegisterResult>
GET  /api/events/[slug]/availability  → { capacity, registered, waitlisted, isFull, isClosed }
POST /api/contact                     → ActionResult<{ submissionId }>
POST /api/subscribe                   → ActionResult<{ status }>
GET  /api/ics/[slug]                  → text/calendar
```

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode; fieldErrors?: Record<string, string[]> }

type ActionErrorCode =
  | 'INVALID' | 'DUPLICATE' | 'CLOSED' | 'FULL' | 'RATE_LIMITED' | 'NOT_FOUND' | 'SERVER_ERROR'

type RegisterResult = {
  registrationId: string
  status: 'confirmed' | 'waitlisted'
  waitlistPosition: number | null
  icsUrl: string
  addToCalendarUrl: string
}
```

**Invariants both agents rely on:**

- Capacity is enforced inside a **SQLite transaction** (`payload.db.drizzle.transaction`)
  that re-counts confirmed registrations before inserting. The capacity indicator on the
  page is advisory; the endpoint is the authority.
- Every public endpoint carries a honeypot field named `website` (must be empty) and is IP
  rate limited. Render it visually hidden, `tabindex="-1"`, `aria-hidden="true"`.
- Email is queued, never awaited. Endpoints return in < 500ms.
- Writes persist even when email fails; `emailStatus` records it and the registrations view
  offers a resend.

---

## 6. File ownership map

Editing a file you do not own is a protocol violation. Request it in `DECISIONS.md`.

| Path | Owner |
|---|---|
| `payload.config.ts`, `collections/**`, `globals/**` | **A** |
| `lib/schemas/**`, `lib/content/**`, `lib/email/**`, `lib/rate-limit.ts` | **A** |
| `app/(payload)/**` (admin + Payload API), `app/api/**` | **A** |
| `app/(public)/events/**`, `components/public/registration-form.tsx` | **A** |
| `scripts/**`, `deploy/**`, `.github/workflows/**`, `Caddyfile`, `*.service` | **A** |
| `app/(public)/layout.tsx`, `app/globals.css`, `app/(public)/page.tsx` | **B** |
| `app/(public)/**` *except* `events/` | **B** |
| `components/ui/**`, `components/public/**` *except the registration form* | **B** |
| `lib/format.ts`, `lib/seo.ts`, `lib/analytics.ts`, `lib/revalidation.ts` | **B** |
| `app/sitemap.ts`, `app/robots.ts`, `app/error.tsx`, `app/not-found.tsx` | **B** |
| `next.config.ts` | **B** |
| `package.json`, `tsconfig.json` | **shared, frozen in Sprint 0** |
| `brand/**` | **human** |
| `DECISIONS.md` | **both, append-only** |

Agent A owns `app/(public)/events/**` and the registration form because it owns that flow
end to end. It is the only place A touches public routes.

**There is no `app/layout.tsx`, and there must never be one.** Payload's admin requires its
own root layout, so `app/(payload)/` and `app/(public)/` are sibling route groups, each
with its own root layout. A layout at `app/layout.tsx` would wrap both and inject the
site's fonts and `globals.css` into the admin, breaking its styling. Agent B's root layout
is `app/(public)/layout.tsx`.

`app/globals.css` stays at `app/globals.css` (route groups do not affect non-route files)
and is imported from `app/(public)/layout.tsx` as `../globals.css`.

---

## 7. Dependencies — frozen, installed once in Sprint 0

**Installed and verified at H0** — see `package.json` for exact ranges.

```
next 16.3.4   react 19.2.8   react-dom 19.2.8   typescript 5   tailwindcss 4
payload 3.88.0  @payloadcms/{next,db-sqlite,richtext-lexical,email-nodemailer,ui} 3.88.0
@libsql/client 0.14   graphql 16   sharp 0.35
zod 4   react-hook-form 7   @hookform/resolvers 5
nodemailer 10   ics 3   papaparse 5
date-fns 4   date-fns-tz 3
lucide-react   class-variance-authority   clsx   tailwind-merge   sonner
vitest 5   @testing-library/react   @playwright/test   tsx   dotenv   (dev)
```

**Four corrections to the frozen list, made at H0 after checking the registry:**

1. **`next@15` → `next 16.3.4`.** Payload 3.88's peer range is
   `>=16.2.6 <17.0.0` (among others), so Next 16 is supported and current. Staying on 15
   would have meant deliberately installing an older minor.
2. **`better-sqlite3` → `@libsql/client`.** `@payloadcms/db-sqlite` uses libSQL via
   Drizzle; `better-sqlite3` was never its driver. Transactions are unaffected.
3. **`react-email` / `@react-email/components` dropped.** Deprecated at every published
   version ("no longer supported"). The six transactional templates are hand-written
   table-based HTML with inline styles instead — which is what mail clients need anyway,
   and removes a dead dependency from a system that must run untouched for years.
4. **`@types/node` pinned to `^22`**, required by vitest 5's peer range.

**`"type": "module"` is set in `package.json`** — required, since Payload's lexical editor
is async ESM and the CLI otherwise fails with `ERR_REQUIRE_ASYNC_MODULE`.

**Next 16 differences that affect both agents** (from
`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — read it, it does
not match either agent's training data):

- `params`, `searchParams`, `cookies()`, `headers()` are **fully async**; the Next 15
  synchronous fallback is gone.
- Use the generated helpers `PageProps<'/route'>`, `LayoutProps<'/route'>` and
  `RouteContext<'/api/route'>`; run `npx next typegen` (or any build) to generate them.
- `revalidateTag(tag)` now requires a second `cacheLife` argument. **`revalidatePath` is
  unchanged**, which is what §4's publish flow uses.
- The `middleware` convention is renamed to **`proxy`**. This project needs neither —
  Payload gates the admin itself.
- Turbopack is the default for both `dev` and `build`; `next lint` is gone, and the
  `eslint` key in `next.config.ts` is rejected.

Payload supplies from configuration what earlier drafts budgeted 39h to build: admin UI,
auth, roles, media library with image resizing, rich text, drafts and version history.
Do not hand-roll any of these.

Deliberately not used: any external form service, any CAPTCHA in V1, any payment SDK, any
hosted search vendor.

---

## 8. Design tokens (owner: Agent B, consumed by Agent A)

Defined once in `app/globals.css` under Tailwind 4's `@theme`. Agent A styles the
registration form from these; a hex value outside `globals.css` is a bug. The Payload admin
keeps its own default styling — do not spend time theming it.

```
--color-bg  --color-surface  --color-surface-2  --color-border  --color-border-strong
--color-fg  --color-fg-muted  --color-fg-subtle
--color-brand  --color-brand-fg  --color-brand-muted
--color-accent  --color-accent-fg
--color-success  --color-warning  --color-danger  (+ -fg, -muted)
--radius-sm --radius-md --radius-lg --radius-full
--shadow-sm --shadow-md --shadow-lg
--font-sans  --font-display
```

Seeded from `brand/colors.md`: brand red `#BD282E` — 5.98:1 on white, **white text only,
never black on red**. Registration states map to fixed tokens: `confirmed` → success,
`waitlisted` → accent, `closed`/`full` → muted, `error` → danger.

---

## 9. Shared conventions

- **Slugs** are generated from the title and unique per collection. Agent B may assume they
  are URL-safe and stable.
- **Images** come back as `{ url, alt, width, height }` from the `media` collection. Agent B
  always passes `width`/`height` to `next/image` and never guesses an aspect ratio.
- **Rich text** is Lexical, rendered through a fixed component map: `p, h2, h3, ul, ol, li,
  strong, em, a, blockquote, hr, code`. No raw HTML, no images in body content.
- **Dates** are stored UTC, displayed IST via `lib/format.ts`. No ad-hoc `toLocaleString`.
- **Empty results are normal, not errors.** Every section hides itself or renders a defined
  empty state — the homepage events strip hides entirely when nothing is upcoming.
- **Analytics events** (Agent B fires, names frozen): `register_start`,
  `registration_complete`, `newsletter_signup`, `startup_view`, `contact_submit`.

---

## 10. Handshakes

| ID | When | What must be true |
|---|---|---|
| **H0** | End of Sprint 0 | Repo scaffolded, deps installed, Payload admin boots, both branches cut from one commit |
| **H1** | End of Day 2 | Collections frozen; every `lib/content/*` signature returns seeded data; tokens exist as placeholders |
| **H2** | End of Day 4 | All five API routes live; publish-to-revalidate working; B's directory pages render real data |
| **H3** | End of Day 6 | Registration end to end with a real email and `.ics`; every page built |
| **H4** | End of Day 8 | Deployed to the VM over HTTPS, backups running, a11y and performance passes complete |

At each handshake both agents append a status block to `DECISIONS.md` and re-read this
contract for drift.
