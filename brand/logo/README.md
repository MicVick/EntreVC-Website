# Logo files

## Use these

| File | What it is |
|---|---|
| `entrevc-wordmark-light.svg` | "entreVC" + red triangle, light lettering, for dark backgrounds |
| `entrevc-wordmark-dark.svg` | The same with dark lettering, for light backgrounds |
| `entrevc-lockup-light.svg` / `-dark.svg` | Wordmark with "Entrepreneurship & Venture Capital Club / IIM Ahmedabad" |
| `entrevc-mark.svg` | The red triangle on its own |

These are traced from `EntreVC_Logo.png` (the sharpest source). The website itself
draws the wordmark from `components/public/entrevc-sprite.tsx`, generated from the
same trace, so it can follow the text colour.

## Source material

Only `EntreVC_Logo.png` is committed. The others are gitignored and live on the machine
they were added from:

- `EntreVC_Logo.png`: source for the trace. `Gemini_Generated_Image_9mnuf…png` is an
  identical copy.
- `Gemini_Generated_Image_rybbnt…png` and `…npy2xn…png`: lower-resolution versions.
- `Gemini_Generated_Image_ai2pyn…png`: a light-on-black version with an AI watermark in
  the corner; not used.
- `IIM,_Ahmedabad_Logo.svg`: identical to `../iima-logo.svg`, which the footer uses.

If the club ever gets the original vector file from whoever designed the logo, drop it
here and replace the traced files; the trace is very close but not exact.
