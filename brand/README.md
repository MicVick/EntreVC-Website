# brand/ — drop your brand assets here

> **Already here:** `logo-full.png` (horizontal lockup, raster) and `iima-logo.svg`
> (institute mark). Colours sampled from the logo are in [colors.md](colors.md), along with
> what is still missing — a vector logo, a square mark, and the typefaces.

Agent B ships a **placeholder palette on Day 1** and does not wait for this folder. When
you populate it, the swap touches exactly one file (`app/globals.css`), because every
colour, font and radius in the codebase is a token rather than a literal value.

**Useful by:** Day 1 · **Hard deadline:** Day 8, before the accessibility and performance
passes. If it arrives later than that, the site ships on placeholders and gets rebranded
post-launch — annoying, not blocking.

## What to drop in

| File | Format | Notes |
|---|---|---|
| `logo-full.svg` | SVG | Horizontal lockup for the header |
| `logo-mark.svg` | SVG | Square mark for the favicon and OG images |
| `logo-full-inverse.svg` | SVG | Light-on-dark, for the footer |
| `favicon.svg` / `favicon.png` | SVG + 512px PNG | |
| `og-default.png` | 1200×630 PNG | Fallback social preview |
| `fonts/` | WOFF2 | **Self-hosted only.** Include the licence file |
| `colors.md` | text | See below |
| `references.md` | text | 2–3 sites whose feel you want, and one sentence each on *why* |

## colors.md — what to write

Hex values for as many as you have. Anything missing, Agent B derives.

```
Brand primary      #______   (the club colour — buttons, links, active states)
Brand foreground   #______   (text on top of brand primary — must clear 4.5:1)
Accent             #______   (optional second colour, used sparingly)
Ink / body text    #______
Background         #______
Surface            #______   (cards and raised panels)
Border             #______
```

If a brand pair fails 4.5:1 contrast, Agent B will adjust the **non-brand** side to comply
and log it in `DECISIONS.md`. WCAG 2.1 AA is a launch gate in this project, so a colour
that cannot pass will not be used for text.

## Typography

Name the display face (headings) and the body face. Two families maximum. If the club has
no licensed fonts, say so and Agent B picks a well-supported open pairing that self-hosts
cleanly — an external font request costs real milliseconds against the 2.5s LCP target.

## Also worth including if it exists

- Photography direction — do event photos get a treatment, or run as shot?
- Tone-of-voice notes — the site writes its own microcopy otherwise
- Any existing poster or deck template, as a reference for visual continuity
