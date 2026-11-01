/**
 * The "ground up" sky that sits behind every public page.
 *
 * Purely decorative and server-rendered: no client JavaScript. All of its motion is
 * scroll-driven CSS under `.journey*` in globals.css: the world sinks past as you
 * scroll, kites sway, the altitude rail fills, and the rocket from the hero climbs
 * alongside until it reaches the moon. Where scroll-driven animation is unsupported
 * this renders as a still sky behind the top of the page, without the rocket.
 */

type Kite = { left: string; top: string; size: string; tilt: number; tail: 'left' | 'right' }

const KITES: readonly Kite[] = [
  { left: '9%', top: '60%', size: '2.2rem', tilt: -12, tail: 'left' },
  { left: '80%', top: '58.5%', size: '2.6rem', tilt: 10, tail: 'right' },
  { left: '64%', top: '64%', size: '1.8rem', tilt: -6, tail: 'left' },
  { left: '34%', top: '66.5%', size: '1.5rem', tilt: 14, tail: 'right' },
  { left: '92%', top: '68%', size: '1.7rem', tilt: -16, tail: 'left' },
]

function KiteShape({ tail }: Pick<Kite, 'tail'>) {
  const direction = tail === 'right' ? 1 : -1
  return (
    <svg viewBox="-20 -24 40 60" aria-hidden="true" focusable="false">
      <path className="line-art" d="M0 -18 L14 0 L0 22 L-14 0 Z" />
      <path className="line-art line-art-thin" d="M-14 0 L14 0 M0 -18 L0 22" />
      <path className="line-art line-art-thin" d="M0 22 q8 10 -2 20 q-8 9 2 18" />
      <path
        className="line-art line-art-thin"
        style={{ opacity: 0.18 }}
        d={`M0 4 Q ${direction * 90} 140 ${direction * 70} 320`}
      />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="-130 -130 260 290" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="journey-moon-clip">
          <circle r="120" />
        </clipPath>
      </defs>
      <circle className="line-art" r="120" />
      <g clipPath="url(#journey-moon-clip)" opacity="0.2">
        {Array.from({ length: 40 }, (_, index) => {
          const x = -180 + index * 9
          return <line key={x} className="line-art" x1={x} y1={-140} x2={x - 170} y2={140} />
        })}
      </g>
      <circle className="line-art line-art-thin" cx="-40" cy="-40" r="18" />
      <circle className="line-art line-art-thin" cx="40" cy="40" r="12" />
      <circle className="line-art line-art-thin" cx="20" cy="-50" r="8" />
      <circle className="line-art line-art-thin" cx="-30" cy="50" r="10" />
    </svg>
  )
}

/** The hero's rocket again, small, with a dotted trail fading out below it. */
function JourneyRocket() {
  return (
    <svg viewBox="-30 -130 60 470" aria-hidden="true" focusable="false" className="overflow-visible">
      <defs>
        <linearGradient id="journey-trail-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="journey-trail-mask" maskUnits="userSpaceOnUse" x="-30" y="0" width="60" height="340">
          <rect x="-30" y="0" width="60" height="340" fill="url(#journey-trail-fade)" />
        </mask>
      </defs>
      <path className="journey-rocket-trail" d="M0 14 V330" mask="url(#journey-trail-mask)" />
      <path className="rocket-flame" d="M-5 6 Q0 36 5 6" />
      <path className="rocket-flame rocket-flame-core" d="M-2.5 6 Q0 20 2.5 6" />
      <path className="rocket-body" d="M-13 -34 L-23 -12 L-23 2 L-13 -6 Z" />
      <path className="rocket-body" d="M13 -34 L23 -12 L23 2 L13 -6 Z" />
      <path className="rocket-body" d="M-6 0 L-7.5 5 H7.5 L6 0 Z" />
      <path className="rocket-body" d="M0 -120 C9 -106 13 -92 13 -76 V-8 L9 0 H-9 L-13 -8 V-76 C-13 -92 -9 -106 0 -120 Z" />
      <circle className="rocket-body" cx="0" cy="-74" r="6" />
      <path className="rocket-detail" d="M-13 -50 H13 M-13 -24 H13" />
    </svg>
  )
}

function Satellite() {
  return (
    <svg viewBox="-80 -30 160 60" aria-hidden="true" focusable="false">
      <g transform="rotate(-18)">
        <rect className="line-art" x="-14" y="-10" width="28" height="20" />
        <rect className="line-art line-art-thin" x="-70" y="-8" width="48" height="16" />
        <rect className="line-art line-art-thin" x="22" y="-8" width="48" height="16" />
        <path className="line-art line-art-thin" d="M-22 0 H-14 M14 0 H22" />
      </g>
    </svg>
  )
}

export function JourneyBackdrop() {
  return (
    <>
      <div className="journey" aria-hidden="true">
        <div className="journey-world">
          <div className="journey-stars" />
          <div className="journey-stars journey-stars-far" />

          <div className="journey-item" style={{ left: '58%', top: '4%', width: 'clamp(9rem, 20vw, 17rem)', opacity: 0.85 }}>
            <Moon />
          </div>
          <p className="journey-label" style={{ top: '13%' }}>The Moon · 384,400 km</p>

          <div className="journey-item" style={{ left: '14%', top: '27%', width: 'clamp(5rem, 9vw, 8rem)', opacity: 0.55 }}>
            <Satellite />
          </div>
          <p className="journey-label" style={{ top: '29%' }}>400 km · Low Earth orbit</p>

          <div className="journey-karman" />
          <p className="journey-label" style={{ top: '49.4%', color: 'var(--color-accent)' }}>100 km · Kármán line</p>

          {KITES.map((kite) => (
            <div
              key={`${kite.left}-${kite.top}`}
              className="journey-item journey-kite"
              style={{ left: kite.left, top: kite.top, width: kite.size, rotate: `${kite.tilt}deg` }}
            >
              <KiteShape tail={kite.tail} />
            </div>
          ))}
          <p className="journey-label" style={{ top: '70%' }}>2 km · Ahmedabad sky</p>
        </div>
        <div className="journey-rocket">
          <JourneyRocket />
        </div>
      </div>
      <div className="journey-rail" aria-hidden="true">
        <span className="journey-rail-fill" />
        <span className="journey-rail-readout" />
      </div>
    </>
  )
}
