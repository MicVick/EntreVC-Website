# Fonts

The public site self-hosts three families, all latin-only WOFF2 and all licensed under
the SIL Open Font License 1.1.

| File | Family | Used for | Licence |
|---|---|---|---|
| `geist-variable.woff2` | Geist (weight 100–900) | Headings, body text, buttons | `OFL-geist.txt` |
| `geist-mono-variable.woff2` | Geist Mono (weight 100–900) | Labels, dates, numbers | `OFL-geist.txt` |
| `instrument-serif-italic.woff2`, `instrument-serif-regular.woff2` | Instrument Serif | The italic accent word in big headings | `OFL-instrument-serif.txt` |

Geist and Geist Mono are from the same project (Vercel), so one licence file covers
both. Files come from the Fontsource packages `@fontsource-variable/geist`,
`@fontsource-variable/geist-mono` and `@fontsource/instrument-serif` (v5.3.0).

Use the serif sparingly: one or two words per heading, set in italic (`.accent-serif`).
It is there for contrast with Geist, not as a second text face.

`plus-jakarta-sans.ttf` and `OFL.txt` belong to the earlier light theme and are not
loaded. They can be deleted once the redesign is merged.
