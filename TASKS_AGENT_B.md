# TASKS — Agent B · Design System & Site

**Branch:** `agent/site` · **Total:** ~74h across 8 days
**You own:** the design system, the homepage, startups, resources, playbook, team, contact,
IIMA Ventures, SEO, analytics, accessibility and performance.
**You do not own:** `payload.config.ts`, `collections/`, `lib/{schemas,content,email}`,
`app/api/`, `app/(payload)/`, `app/(public)/events/`, the registration form, `deploy/`.

Read `CLAUDE.md` and `CONTRACT.md` before your first task and again at every handshake.

> **You are never blocked waiting for the CMS.** Agent A ships a seed script on Day 1. Run
> `npm run seed` and build every page against real data. If you want to open `/admin` to
> create test content, stop — ask Agent A for a seed case in `DECISIONS.md` instead.

> **Three things in your work are acceptance criteria, not polish:** LCP < 2.5s on 4G,
> WCAG 2.1 AA, and 360px. Build them in from the first component. There is no edge network
> in front of this site — a college VM serves every byte — so performance headroom you do
> not create yourself does not exist.

---

## Sprint 0 — Bootstrap (Day 0, joint · 2h)

Agent A leads the scaffold. You review and do not commit until H0 is signed.

### ☐ B0.1 — Review the scaffold `1h`
- Confirm the dependency list covers what the public pages need. Request additions **now**,
  while dependencies are still installed once.
- Note that the Payload admin keeps its own default styling — **do not plan to theme it.**

### ☐ B0.2 — Agree the token plan `1h`
- Confirm token names in `CONTRACT.md` §8 with Agent A, who styles the registration form
  from them. Adding a token later is cheap; renaming one is not.

> **🤝 H0 — signed off in `DECISIONS.md`.**

---

## Sprint 1 — Design system and shell (Days 1–2 · 19h)

### ☐ B1.1 — Design tokens `4h` · `CONTRACT.md` §8
**Files:** `app/globals.css` (you are its only owner)
- Full token set under Tailwind 4 `@theme`, seeded from `brand/colors.md`.
- Brand red is `#BD282E` — **5.98:1 on white, white text only, never black on red.**
- **Ship placeholders today** and swap when `brand/` completes; because everything is a
  token, that swap touches this one file. Do not wait for brand assets to start.
- Every colour pair clears 4.5:1. Check as you choose, not in Sprint 4.

### ☐ B1.2 — UI primitives `5h`
**Files:** `components/ui/**`
- Button, Input, Textarea, Select, Checkbox, Label, Card, Badge, Dialog, Sheet, Tabs,
  Skeleton, Toast, Tooltip — themed to the tokens, `cva` variants.
- Visible focus ring on every interactive element. No `outline: none` anywhere in this repo.
- Agent A builds the registration form from these and never edits them. If a need appears,
  they request it in `DECISIONS.md` and you build it.

### ☐ B1.3 — Root layout, header, footer `4h`
**Files:** `app/layout.tsx`, `components/public/{header,footer}.tsx`
- Self-hosted fonts via `next/font` — an external font round trip is a real cost against the
  LCP target with no CDN in front.
- Header with entry points to every section, mobile nav, **skip-to-content link**.
- Footer with social links, club email, campus address, and the **takedown route** the PRD
  requires as its alumni-consent mitigation.
- Above-the-fold content renders **without client-side JS**. `'use client'` on leaves only.

### ☐ B1.4 — Shared components `4h`
**Files:** `components/public/**`
- `SectionHeader`, `EventCard`, `StartupCard`, `ResourceCard`, `PersonCard`, `FilterChips`,
  `EmptyState`, `Pagination`, `ShareButton`, `StatBlock`.
- **Every card handles a missing image, a missing link and a very long title.** The seed
  data contains all three; a card that breaks on seed data will break on real content.
- `EventCard` is used by Agent A's events pages — treat its API as shared.

### ☐ B1.5 — Formatting, SEO and revalidation helpers `2h`
**Files:** `lib/format.ts`, `lib/seo.ts`, `lib/revalidation.ts`
- IST formatting from UTC via `date-fns-tz`, in one helper used everywhere.
- `buildMetadata()` for titles, descriptions, canonicals and OG tags.
- `pathsFor(collection, slug)` returning every public route affected by a content change.
  Agent A calls it from Payload hooks. **Keep it exhaustive as you add routes** — a missing
  entry means published content silently does not appear, the hardest bug here to notice.

> **🤝 H1 — Agent A's collections and content functions are frozen. Import their types;
> never redeclare a content shape.**

---

## Sprint 2 — Directories (Days 3–4 · 19h)

### ☐ B2.1 — Startup directory `6h` · *the credibility artifact for investors*
**Files:** `app/(public)/startups/page.tsx`
- Alumni / Student toggle. Cards with logo, name, one-line description, founders with batch,
  sector, stage, website, LinkedIn.
- Filters: sector (multi), stage (multi), batch, plus keyword search across name,
  description and founders.
- Filters **combine with AND** and **reflect in the URL** so a filtered view is shareable —
  an investor sharing `?sector=fintech&stage=seed` is an explicit flow in the PRD.
- **Client-side filtering over a prefetched list** — no spinner between filter clicks under
  ~500 entries. Paginate beyond that.
- **Never render founder contact detail unless `contactConsent === true`.** Gate at render;
  do not rely on the data being clean.

### ☐ B2.2 — Startup detail `2h`
- Longer description, founding story, team, stage, links. Same consent gate. Fire
  `startup_view`.

### ☐ B2.3 — IIMA Ventures `2h` · an explicit ask in the club brief
**Files:** `app/(public)/iima-ventures/page.tsx`
- Overview, contact, highlight block, and the schemes list: name, who it's for, what it
  offers, eligibility, application route, deadline. Deadlines in IST; past deadlines visibly
  de-emphasised rather than hidden.

### ☐ B2.4 — Resources library `4h`
**Files:** `app/(public)/resources/page.tsx`
- Grid with type filter and tag filter plus search, URL-reflected.
- **Every resource is one click from list to source — no interstitial.** Gating is cut from
  V1, so nothing here asks for an email.

### ☐ B2.5 — Playbook `3h`
**Files:** `app/(public)/resources/playbook/page.tsx`
- Chaptered web version with in-page chapter navigation, plus a PDF download CTA
  `[ASSUMPTION: web chapters + uploaded PDF; no PDF generation]`. The web version is the SEO
  surface and the reason the playbook is findable at all.

### ☐ B2.6 — YouTube feed `2h`
- Latest 6–9 videos. **Degrades to a plain channel link if the call fails, and never blocks
  render** — fetch off the critical path, no layout shift on arrival.

> **🤝 H2 — pages render seeded data; publishing in `/admin` updates a page within 10s.**

---

## Sprint 3 — Homepage, people, contact, SEO (Days 5–6 · 20h)

### ☐ B3.1 — Homepage `5h`
**Files:** `app/(public)/page.tsx`
Seven blocks: positioning statement and intro · next three events with direct register
links · featured startups · latest resource · key numbers · mailing-list signup · entry
points to every section.
- The events strip pulls the next three chronologically and **hides itself entirely** when
  none are upcoming. It must never render an empty shell.
- Key numbers from `getKeyNumbers()` — live counts with the admin override applied.
- Above the fold renders with zero client JS. **JS budget: < 150KB.**

### ☐ B3.2 — Team and archive `4h`
**Files:** `app/(public)/team/page.tsx`, `app/(public)/team/[year]/page.tsx`
- Grouped by vertical, ordered by the admin-controlled `displayOrder`.
- Club structure visual **built from data, not a hardcoded diagram**, or it goes stale at the
  first reorganisation.
- Year switcher rendering any past roster from the same collection.

### ☐ B3.3 — Contact page `3h`
**Files:** `app/(public)/contact/page.tsx`
- Club email, campus address, socials, role-specific contacts from settings.
- Category selector (general / event / startup listing / sponsorship / speaking /
  mentorship), name, email, batch or organisation, message, honeypot.
- Documented **takedown route** for listing removal. Fire `contact_submit`.

### ☐ B3.4 — Mailing-list signup `1h`
- One component used on the homepage and in the footer. Email plus consent, inline success
  and duplicate states. Fire `newsletter_signup`.

### ☐ B3.5 — Metadata and structured data `3h`
- `generateMetadata` on every route you own: title, description, canonical, OG, Twitter.
- JSON-LD: `Organization` on the homepage, `BreadcrumbList` on detail routes. (Agent A
  handles `Event` on event pages.)
- OG images are the entry's own uploaded image — dynamic generation is cut.

### ☐ B3.6 — Sitemap and robots `1h`
- `app/sitemap.ts` from published content; `app/robots.ts` disallowing `/admin` and `/api`.

### ☐ B3.7 — Analytics `2h`
- GA4 with the five frozen events from `CONTRACT.md` §9: `register_start`,
  `registration_complete`, `newsletter_signup`, `startup_view`, `contact_submit`.
- Verify the event-page-view → registration funnel actually resolves. The PRD sets a >25%
  target against it, and an unverified funnel measures nothing.

### ☐ B3.8 — Error, empty and loading states `1h`
- `not-found.tsx` and `error.tsx` at root and per section, `loading.tsx` skeletons, a
  defined empty state for every list.

> **🤝 H3 — every page built and rendering real content.**

---

## Sprint 4 — Accessibility, performance, QA (Days 7–8 · 14h)

### ☐ B4.1 — Accessibility pass `4h` · WCAG 2.1 AA
- Full keyboard walk of home, event detail, registration form, startup directory, contact.
- Contrast audit, semantic heading order, labels tied to inputs, errors announced, focus
  management in the gallery lightbox, alt text everywhere.
- axe clean on all five pages.

### ☐ B4.2 — Performance `3h` · LCP < 2.5s on 4G, with no CDN
- Throttled 4G Lighthouse on home and event detail.
- `next/image` with correct `sizes`, priority on the LCP element only, WebP/AVIF.
- Audit the bundle: homepage < 150KB JS. Push `'use client'` down.
- Confirm Caddy is serving compression and sensible cache headers — ask Agent A, since the
  server config is theirs.

### ☐ B4.3 — Responsive and browser QA `3h`
- 360, 390, 768, 1024, 1440. Chrome, Safari, Firefox, Edge — last two versions.
- No horizontal scroll at 360px anywhere; wide content scrolls inside its own container,
  never the page body.

### ☐ B4.4 — Content entry session `3h` · *a club activity you support*
- Sit with the team while **they** enter real content in `/admin`. Watch where they
  hesitate; every hesitation is a field label or description worth logging for Agent A.
- Do not enter it for them. The point of the session is proving they can.

### ☐ B4.5 — Final QA `1h`
- Walk the Definition of Done in `EXECUTION_PLAN.md` §7 line by line and tick it honestly.

> **🤝 H4 — Lighthouse target met, axe clean, OG previews checked in a real WhatsApp chat.**

---

## If your queue empties first

Likely around Day 7. Claim from Agent A by appending to `DECISIONS.md`:
`CLAIM <task-id> by B at <timestamp>`. Best candidates in your reach: **A3.3 recap mode**,
**A4.5 admin usability pass**, **A4.7 handover kit**.

## Your recurring obligations

- Keep `lib/revalidation.ts` exhaustive as routes are added.
- Import content types from `lib/schemas` — never redeclare a shape Agent A owns.
- Append to `DECISIONS.md` when you add a token, need a primitive for the registration form,
  or find a content shape that does not work for a page.
- Never edit a file Agent A owns. Request it instead.
