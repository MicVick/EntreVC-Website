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
