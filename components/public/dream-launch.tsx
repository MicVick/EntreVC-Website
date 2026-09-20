'use client'

import { useId, useState } from 'react'
import { Pause, Play } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'

export function DreamLaunch() {
  const [paused, setPaused] = useState(false)
  const titleId = useId()

  return (
    <section id="dream-launch" aria-labelledby={titleId} className="border-b border-border bg-bg">
      <div className="site-shell grid items-center gap-3 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div>
          <p className="eyebrow">For the dreamer in you</p>
          <h2 id={titleId} className="display-type mt-5 max-w-lg text-4xl font-semibold sm:text-5xl">
            Big dreams.<br />Little first steps.<br /><span className="text-accent">And then, liftoff.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-fg-muted">
            Every founder starts with a “what if”. Find your people, take the leap, and see how far your idea can go.
          </p>
          <button
            type="button"
            onClick={() => setPaused(value => !value)}
            aria-controls={`${titleId}-scene`}
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}
          >
            {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
            {paused ? 'Play animation' : 'Pause animation'}
          </button>
        </div>

        <div id={`${titleId}-scene`} className="dream-scene relative min-w-0" data-motion="on" data-playing={!paused}>
          <svg viewBox="0 0 640 430" role="img" aria-label="An animated countdown and a smiling young astronaut waving, then blasting off from campus in a red rocket with flames and billowing smoke, flying up toward the stars." className="h-auto w-full overflow-hidden">
            <g aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              {/* A quiet orbital map keeps the canvas white. */}
              <ellipse cx="381" cy="213" rx="227" ry="114" transform="rotate(-30 381 213)" fill="none" stroke="var(--color-border)" strokeDasharray="4 9" />
              <circle cx="454" cy="143" r="87" fill="var(--color-lilac)" opacity="0.45" />
              <circle cx="454" cy="143" r="67" fill="var(--color-bg)" />
              <path d="M139 339 C145 257 230 245 307 227 S399 199 458 143 L610 -20" className="dream-trail dream-animated" fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeDasharray="5 9" />

              <g className="dream-countdown dream-animated" transform="translate(258 306)">
                <circle r="29" fill="var(--color-playful)" />
                <g fill="var(--color-playful-ink)" textAnchor="middle" fontSize="28" fontWeight="700">
                  <text y="10" className="dream-count-three dream-animated">3</text>
                  <text y="10" className="dream-count-two dream-animated">2</text>
                  <text y="10" className="dream-count-one dream-animated">1</text>
                </g>
              </g>
              <g className="dream-liftoff dream-animated" fill="var(--color-accent)" fontSize="23" fontWeight="700">
                <text x="65" y="220" transform="rotate(-8 65 220)">Liftoff!</text>
              </g>

              <g className="dream-star dream-animated dream-star-one" transform="translate(535 66)" fill="var(--color-playful)" stroke="var(--color-playful-ink)" strokeWidth="2">
                <path d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5 Z" />
              </g>
              <g className="dream-star dream-animated dream-star-two" transform="translate(355 66)" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                <path d="M0 -10 L0 10 M-10 0 L10 0" />
              </g>
              <g className="dream-star dream-animated dream-star-three" transform="translate(563 228)" fill="var(--color-lilac)" stroke="var(--color-lilac-ink)" strokeWidth="2">
                <path d="M0 -13 L4 -4 L13 0 L4 4 L0 13 L-4 4 L-13 0 L-4 -4 Z" />
              </g>
              <circle cx="273" cy="137" r="5" fill="var(--color-playful)" />
              <circle cx="592" cy="127" r="4" fill="var(--color-brand-muted)" />
              <circle cx="435" cy="291" r="4" fill="var(--color-lilac)" />
              <path d="M214 213 L214 225 M208 219 L220 219" stroke="var(--color-lilac-ink)" strokeWidth="2" />

              {/* A little red-brick launchpad nods to the campus. */}
              <path d="M58 363 H231" stroke="var(--color-border-strong)" strokeWidth="2" />
              <path d="M92 362 V342 H183 V362" fill="var(--color-brand-muted)" stroke="var(--color-brand)" strokeWidth="2" />
              <path d="M123 362 V351 Q138 332 153 351 V362" fill="var(--color-bg)" stroke="var(--color-brand)" strokeWidth="2" />
              <path d="M89 341 H187" stroke="var(--color-brand)" strokeWidth="3" />
              <path d="M78 363 V315 M78 315 L100 321 L78 330" fill="var(--color-playful)" stroke="var(--color-playful-ink)" strokeWidth="2" />
              <g className="dream-smoke dream-animated" fill="var(--color-surface-2)" stroke="var(--color-border)">
                <circle cx="112" cy="328" r="19" /><circle cx="138" cy="322" r="24" /><circle cx="165" cy="330" r="17" />
              </g>
              <g className="dream-smoke-drift dream-animated" fill="var(--color-surface-2)" stroke="var(--color-border)">
                <circle cx="96" cy="337" r="23" /><circle cx="174" cy="340" r="28" /><circle cx="204" cy="341" r="17" />
              </g>

              <g className="dream-rocket dream-animated">
                <g className="dream-exhaust dream-animated">
                  <g className="dream-flame dream-animated">
                  <path d="M-21 58 Q-27 101 0 128 Q28 100 21 58 Z" fill="var(--color-rocket-flame)" />
                  <path d="M-11 60 Q-14 88 0 104 Q15 86 11 60 Z" fill="var(--color-playful)" />
                  </g>
                </g>
                <path d="M-32 2 Q-61 19 -58 61 L-29 47 M32 2 Q61 19 58 61 L29 47" fill="var(--color-brand)" stroke="var(--color-rocket-outline)" strokeWidth="2.5" />
                <path d="M-19 49 L-23 66 Q0 75 23 66 L19 49" fill="var(--color-rocket-outline)" />
                <path d="M0 -111 C-41 -84 -47 -22 -31 48 Q0 64 31 48 C47 -22 41 -84 0 -111Z" fill="var(--color-bg)" stroke="var(--color-rocket-outline)" strokeWidth="2.5" />
                <path d="M0 -111 Q-20 -94 -29 -65 Q0 -52 29 -65 Q20 -94 0 -111Z" fill="var(--color-brand)" stroke="var(--color-rocket-outline)" strokeWidth="2.5" />
                <path d="M-31 35 Q0 48 31 35 L31 48 Q0 64 -31 48Z" fill="var(--color-brand-muted)" stroke="var(--color-rocket-outline)" strokeWidth="2" />
                <circle cy="-21" r="32" fill="var(--color-lilac)" stroke="var(--color-rocket-outline)" strokeWidth="3" />
                {/* The astronaut: helmet, unruly hair, rosy cheeks and a grin. */}
                <path d="M-20 -8 Q0 -23 20 -8 L23 2 Q0 18 -23 2Z" fill="var(--color-brand)" />
                <circle cy="-26" r="24" fill="var(--color-bg)" stroke="var(--color-rocket-outline)" strokeWidth="1.8" />
                <ellipse cy="-25" rx="18" ry="19" fill="var(--color-rocket-skin)" />
                <path d="M-18 -29 Q-22 -49 -4 -45 Q5 -52 17 -39 L18 -30 Q9 -34 6 -40 Q-2 -28 -18 -29Z" fill="var(--color-rocket-outline)" />
                <path d="M-10 -25 Q-7 -29 -4 -25 M5 -25 Q8 -29 11 -25" fill="none" stroke="var(--color-rocket-outline)" strokeWidth="2" />
                <path d="M-5 -16 Q1 -10 7 -17" fill="none" stroke="var(--color-rocket-outline)" strokeWidth="2" />
                <ellipse cx="-11" cy="-18" rx="4" ry="2.5" fill="var(--color-rocket-cheek)" />
                <ellipse cx="13" cy="-18" rx="4" ry="2.5" fill="var(--color-rocket-cheek)" />
                <g className="dream-wave dream-animated">
                  <path d="M12 -2 Q23 -7 24 -18" fill="none" stroke="var(--color-bg)" strokeWidth="7" />
                  <path d="M24 -18 L23 -23 M24 -18 L27 -23 M24 -18 L29 -20" stroke="var(--color-rocket-skin)" strokeWidth="4" />
                </g>
                <path d="M-25 -29 Q-30 -13 -22 -3 M25 -29 Q30 -13 22 -3" fill="none" stroke="var(--color-rocket-outline)" strokeWidth="3" />
                <path d="M14 -43 L19 -37" stroke="var(--color-bg)" strokeWidth="3" />
                <path d="M0 18 V27 M-4 22 H4" stroke="var(--color-brand)" strokeWidth="2" />
                <circle cx="-22" cy="19" r="2" fill="var(--color-border-strong)" />
                <circle cx="22" cy="19" r="2" fill="var(--color-border-strong)" />
              </g>
              <g className="dream-destination" fill="var(--color-accent)">
                <path d="M515 310 L535 290 M523 290 H535 V302" fill="none" stroke="currentColor" strokeWidth="2" />
              </g>
            </g>
          </svg>
          <p className="absolute bottom-2 right-0 text-xs font-semibold tracking-wide text-fg-muted sm:bottom-5 sm:right-5">Made of curiosity. Fueled by possibility.</p>
        </div>
      </div>
    </section>
  )
}
