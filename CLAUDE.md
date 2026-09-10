# EntreVC Web — Repository Conventions

Read this first, every session. It applies to both agents.

## What this project is

A public site plus a CMS in one Next.js 15 app, self-hosted on a college VM. Payload 3
supplies the admin at `/admin`; SQLite on disk holds content and registrations; Caddy
terminates TLS.

**The hard constraint behind every decision:** the club team turns over completely every
year and may include nobody who writes code. If a feature can only be updated by editing
this repo, it is the wrong feature. Content is data, not code.

**The second constraint, new in v2.0:** there is no edge network in front of this site. A
small VM serves every byte. Performance headroom you do not create yourself does not exist.

## Source of truth, in priority order

1. `CONTRACT.md` — frozen interfaces between the two agents.
2. `TASKS_AGENT_A.md` / `TASKS_AGENT_B.md` — your task list. Work only your own file.
3. `EXECUTION_PLAN.md` — sequencing, handshakes, assumptions.
4. `docs/prd-v2.md` — the product spec.
5. `DECISIONS.md` — append-only cross-agent log.

If the PRD and `CONTRACT.md` disagree, `CONTRACT.md` wins on interface shape and the PRD
wins on behaviour. Flag the conflict in `DECISIONS.md`.

## Ownership rule

Every file has exactly one owning agent (`CONTRACT.md` §6). **Never edit a file you do not
own.** If you need a change in the other agent's territory, append a request to
`DECISIONS.md` under `## Requests` and work around it meanwhile. No exceptions, including
"it's a one-line fix".

## Configure the CMS, don't build one

Payload supplies the admin UI, auth, roles, media library with image resizing, rich text,
drafts and version history — all from field configuration. **If you are writing an admin
screen, stop and check whether a field config already does it.** The 39 hours this saves is
the reason the plan fits in eight days.

The corollary: field labels and `admin.description` strings *are* the console's user
experience. Write them in plain language for a non-technical editor at 1 a.m.

## Code conventions

- **TypeScript strict.** No `any`, no `as` casts to silence the compiler, no `@ts-ignore`.
- **Server Components by default.** `'use client'` on the smallest possible leaf, never on a
  page or layout. Above-the-fold homepage content renders with zero client JS.
- **Zod at every boundary.** Anything crossing a network, a form, or a Payload read is
  parsed through a schema from `lib/schemas/`.
- **Dates are UTC in storage, IST on screen.** Format through `lib/format.ts`. Never
  `toLocaleString` without an explicit timezone.
- **No hardcoded colours, spacing or fonts.** Use the tokens in `app/globals.css`. A hex
  code outside that file is a bug. (The Payload admin keeps its own styling — leave it.)
- **Imports** use the `@/` alias. **Files** are `kebab-case.ts`; components `PascalCase`.
- **Server-only modules** (`lib/content/*`, `lib/email/*`) start with `import 'server-only'`.
  `PAYLOAD_SECRET` and SMTP credentials never reach a `NEXT_PUBLIC_*` var.

## Rendering and freshness

Pages are statically generated. Freshness comes from **on-demand revalidation** — Payload
`afterChange` hooks call `revalidatePath` via `lib/revalidation.ts`. No page declares
`export const revalidate`. Publishing must reflect within 10 seconds.

## Never build on the VM

Next builds are memory-hungry and will OOM on a small box. Build in CI or locally, rsync the
standalone output, restart the service. The deploy script enforces this.

## Accessibility and performance are acceptance criteria

- WCAG 2.1 AA: keyboard reachable, visible focus ring, 4.5:1 contrast, semantic headings,
  labels tied to inputs, errors announced. `alt` is a **required field** on media uploads.
- Responsive from 360px. The admin must be usable at 390px for: publish an event, check a
  registration count, read a submission.
- Homepage JS < 150KB. LCP < 2.5s on throttled 4G.

## Definition of done for any task

1. Acceptance criteria in your task file all pass, checked by hand.
2. `npm run typecheck` and `npm run lint` are clean.
3. Empty, loading and error states exist — no component assumes data is present.
4. Works at 360px and by keyboard alone.
5. Task checkbox ticked in your `TASKS_AGENT_*.md`.

## Coordination

- Adding a dependency: only if it is in `CONTRACT.md` §7, otherwise log it in
  `DECISIONS.md` first with a reason.
- Never `git push --force`, never rewrite shared history, never touch the other branch.
- Rebase on `main` at the start of each working block.

## Commit style

`<area>: <what changed>` — e.g. `events: add agenda row rendering`.
Areas: `cms`, `content`, `api`, `events`, `site`, `email`, `deploy`, `docs`.
