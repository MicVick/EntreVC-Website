# Colours — seeded from `logo-full.png`

Sampled from the supplied logo on 10 Sep 2026. **Confirm or correct these**; Agent B builds
the token set in `app/globals.css` from this file.

| Role | Hex | Source |
|---|---|---|
| Brand primary (accent) | `#BD282E` | the red triangle in the logo |
| Brand foreground | `#FFFFFF` | white on the red — verified 5.98:1 |
| Ink / body text | `#000000` → soften to `#14110F` | logo wordmark is pure black; pure black on white is harsh for body copy at length |
| Background | `#FEFEFE` → `#FFFFFF` | logo ground |

## Contrast, checked

- `#BD282E` on white → **5.98:1** — passes AA for normal text, and works as a button fill
  with white label text.
- Black text **on** `#BD282E` → 3.51:1 — fails. Red is a white-text-only surface.

The red reads as an accent, not a field colour: it appears once in the logo, as a small
mark. The site should use it the same way — CTAs, active states, focus rings — over a
largely black-on-white base. If the club intends red as a dominant colour, say so, because
it changes the whole visual direction.

## Still needed

| Item | Why it matters |
|---|---|
| **`logo-full.svg`** — vector version | The supplied PNG is 1694×683 at **1.1MB with no transparency**. At that weight it is a plausible LCP element on every page, and the baked-in white background will show as a box anywhere the header is not pure white. A vector is the fix; a trimmed, transparent, compressed PNG is the fallback |
| `logo-mark.svg` | Square mark for the favicon and OG images. The wordmark does not reduce to 32px legibly — is there a standalone mark, or should Agent B derive one from the red triangle? |
| `logo-full-inverse.svg` | Light-on-dark, for the footer |
| A second accent, or confirmation there is none | Currently the palette is black, white and one red |
| Typography | The wordmark looks like a geometric grotesque (Poppins/Montserrat family); the tagline is a different, more humanist face. Name both if they are licensed, or Agent B picks a self-hostable open pairing |

## IIMA logo

`iima-logo.svg` is the institute mark, not the club's. Check the institute's brand
guidelines before placing it — institutional marks usually carry usage rules on clear
space, minimum size and co-branding. Footer attribution is the safe default; header
placement is not.
