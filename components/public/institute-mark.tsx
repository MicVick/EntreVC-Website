/**
 * The IIM Ahmedabad crest, footer only. Rendered as a white silhouette with a CSS
 * filter because the supplied SVG is navy and disappears on the dark page. Check the
 * institute's brand rules before moving it anywhere more prominent. A CSS background
 * rather than next/image: decorative, and it keeps the image runtime out of the bundle.
 */
export function InstituteMark() {
  return (
    <a
      href="https://www.iima.ac.in/"
      target="_blank"
      rel="noreferrer"
      aria-label="IIM Ahmedabad website"
      className="flex shrink-0 items-center gap-3 rounded-sm text-fg-muted transition hover:text-fg"
    >
      <span aria-hidden="true" className="size-11 shrink-0 bg-[url(/brand/iima-logo.svg)] bg-contain bg-center bg-no-repeat opacity-85 brightness-0 invert" />
      <span className="meta-label leading-4">Indian Institute of<br />Management Ahmedabad</span>
    </a>
  )
}
