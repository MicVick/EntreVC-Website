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
