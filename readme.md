# EntreVC Website & Portal

Public site + CMS for the Entrepreneurship and Venture Capital Club, IIM Ahmedabad.

One permanent home for everything the entrepreneurship community at IIMA builds, learns and
attends — replacing scattered posters, Google Forms and WhatsApp threads with a site the
club team publishes to itself, without developer support, through an annual handover.

**Status:** planning complete, build not started.
**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind 4 · **Payload 3** · SQLite ·
Caddy · self-hosted on a college VM.

---

## Read these in order

| Document | What it is | Who reads it |
|---|---|---|
| [EXECUTION_PLAN.md](EXECUTION_PLAN.md) | Scope, architecture, decisions, 8-day timeline, risks, launch gate | Everyone, first |
| [CONTRACT.md](CONTRACT.md) | The frozen interface between the two agents | Both agents, at every handshake |
| [CLAUDE.md](CLAUDE.md) | Repository conventions | Both agents, every session |
| [TASKS_AGENT_A.md](TASKS_AGENT_A.md) | Data, CMS & Events — ~77h | Agent A |
| [TASKS_AGENT_B.md](TASKS_AGENT_B.md) | Design System & Site — ~74h | Agent B |
| [DECISIONS.md](DECISIONS.md) | Append-only cross-agent log | Both agents, continuously |
| [brand/README.md](brand/README.md) · [brand/colors.md](brand/colors.md) | What the club still needs to supply | The club |
| [docs/prd-v2.md](docs/prd-v2.md) | The product spec, extracted for searching | Everyone |

Source PDFs: `entrevc-website-prd.pdf` (v2.0, authoritative) and `EntreVC_Website_PRD.pdf`
(v1.0 club brief).

## How it's built

**Payload 3 runs inside the same Next.js app.** The admin console is *configured*, not
built — Payload supplies the editing UI, auth, roles, media library, rich text, drafts and
version history from field definitions. That is the decision that pays for self-hosting:
39 hours of console work becomes 12 hours of configuration.

Public pages are statically generated and revalidated the moment an editor hits Publish, so
the VM serves pre-rendered HTML for almost all traffic. The only runtime writes are
registrations, contact submissions and mailing-list signups.

## How the work is split

Two AI agents, eight working days, no file owned by both:

- **Agent A — Data, CMS & Events.** Payload collections, content access layer, API routes,
  email, and the entire events-and-registration path end to end. Plus the VM and deploys.
- **Agent B — Design System & Site.** Tokens, UI kit, layout, homepage, startups,
  resources, team, contact, IIMA Ventures, SEO, analytics, accessibility, performance.

Agent A owns registration end to end on purpose — it's the highest-risk feature and used to
be the one seam crossing both agents.

## Waiting on a human

VM access and storage type (Day 0) · club-owned GitHub repo (Day 0) · brand assets
(Day 1) · institute SMTP relay + SPF/DKIM/DMARC (Day 5) · domain and DNS (Day 7) · real
content (Day 8) · somewhere off the VM to send nightly backups. Full list in
[EXECUTION_PLAN.md §8](EXECUTION_PLAN.md).

## Two things not to get wrong

**Never run the build on the VM** — Next builds OOM on small boxes. Build in CI, rsync the
output, restart.

**Back up the SQLite file off the box, nightly, and test a restore before launch.** Firebase
was doing this silently; now it's yours, and it holds two years of registrations.
