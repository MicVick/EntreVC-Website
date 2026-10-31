import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Line drawing of the Vikram Sarabhai Library on Louis Kahn Plaza at sunset, with a
 * rocket standing on a launch pad on the plaza, the red sun behind it in Kahn's great
 * circle.
 *
 * Geometry is a simplified elevation (not to scale): the library block with its
 * circular opening, segmental arches held by concrete tie-beams, the Harvard Steps and
 * the dormitory wings with their slit windows. Server-rendered SVG, animated in CSS
 * (`.plaza-launch` in globals.css), once per page load: the lines sketch themselves,
 * the sun rises into the circle, the tower arms swing back and the rocket lifts off
 * from the ground up, leaving a faint trail. The SVG overflows its box on purpose so
 * the climb can leave the drawing. Without animation it is a still poster of the
 * rocket on the pad.
 */

type Stagger = CSSProperties & Record<'--i', number>
type Puff = CSSProperties & Record<'--i', number> & Record<'--dx', string>

const stagger = (index: number): Stagger => ({ '--i': index })

const GROUND_Y = 600
const SIDE_BAYS = [400, 800] as const
const WINGS = [
  [70, 290],
  [910, 1130],
] as const
const STEP_COUNT = 6

/** Launch tower beside the pad: x from TOWER_X to TOWER_X + 20, rising from the ground. */
const TOWER_X = 538
const TOWER_TOP = 448
const TOWER_CELL = 24

/** Straight up off the pad, then a gentle turn to the right and out of the frame. */
const TRAJECTORY = 'M600 590 V440 C600 250 700 40 1010 -520'

/** Exhaust clouds rolling out along the ground: [cx, cy, r, sideways drift]. */
const SMOKE: readonly (readonly [number, number, number, number])[] = [
  [600, 595, 8, 0],
  [586, 594, 7, -26],
  [614, 594, 7, 26],
  [572, 597, 6, -50],
  [628, 597, 6, 50],
  [560, 599, 5, -74],
  [640, 599, 5, 74],
]

function slitWindows(from: number, to: number): number[] {
  const xs: number[] = []
  for (let x = from + 16; x < to - 8; x += 18) xs.push(x)
  return xs
}

function Rocket() {
  // Drawn pointing up with its base at the origin; the CSS transform puts it on the pad.
  return (
    <g className="launch-rocket">
      <g transform="scale(1.25)">
        <g className="rocket-flames">
          <path className="rocket-flame" d="M-6 6 Q0 46 6 6" />
          <path className="rocket-flame rocket-flame-core" d="M-3 6 Q0 26 3 6" />
        </g>
        <path className="rocket-body" d="M-13 -34 L-23 -12 L-23 2 L-13 -6 Z" />
        <path className="rocket-body" d="M13 -34 L23 -12 L23 2 L13 -6 Z" />
        <path className="rocket-body" d="M-6 0 L-7.5 5 H7.5 L6 0 Z" />
        <path className="rocket-body" d="M0 -120 C9 -106 13 -92 13 -76 V-8 L9 0 H-9 L-13 -8 V-76 C-13 -92 -9 -106 0 -120 Z" />
        <circle className="rocket-body" cx="0" cy="-74" r="6" />
        <circle className="rocket-detail" cx="0" cy="-74" r="3" />
        <path className="rocket-detail" d="M-13 -50 H13 M-13 -24 H13 M0 -24 V-8" />
      </g>
    </g>
  )
}

export function PlazaLaunch({ className }: { className?: string }) {
  const lines: ReactNode[] = []
  let order = 0
  const push = (node: (index: number) => ReactNode) => {
    lines.push(node(order))
    order += 1
  }

  push((i) => <line key={`ground-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} x1={30} y1={GROUND_Y} x2={1170} y2={GROUND_Y} />)
  push((i) => <path key={`block-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d="M330 540 V250 H870 V540" />)
  push((i) => <line key={`parapet-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} x1={318} y1={240} x2={882} y2={240} />)
  push((i) => <line key={`parapet-b-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} x1={318} y1={250} x2={882} y2={250} />)
  push((i) => <circle key={`circle-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} cx={600} cy={395} r={118} />)
  push((i) => <path key={`circle-depth-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} d="M482 395 A118 118 0 0 0 718 395" transform="translate(8 9)" />)
  push((i) => <circle key={`circle-inner-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} cx={600} cy={395} r={104} />)

  for (const x of SIDE_BAYS) {
    push((i) => <path key={`arch-${x}-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d={`M${x - 62} 540 V452 Q${x} 404 ${x + 62} 452 V540`} />)
    push((i) => <line key={`tie-${x}-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} x1={x - 70} y1={452} x2={x + 70} y2={452} />)
    push((i) => <line key={`tie-b-${x}-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} x1={x - 70} y1={459} x2={x + 70} y2={459} />)
    push((i) => <circle key={`oculus-${x}-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} cx={x} cy={322} r={26} />)
    push((i) => <circle key={`oculus-b-${x}-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} cx={x} cy={322} r={20} />)
  }

  for (let step = 0; step < STEP_COUNT; step += 1) {
    const y = 550 + step * 10
    const half = 170 + step * 14
    push((i) => (
      <line
        key={`step-${step}-${i}`}
        className={cn('line-art draw', step % 2 === 1 && 'line-art-thin')}
        pathLength={1}
        style={stagger(i)}
        x1={600 - half}
        y1={y}
        x2={600 + half}
        y2={y}
      />
    ))
  }
  push((i) => <line key={`cheek-l-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} x1={430} y1={540} x2={375} y2={GROUND_Y} />)
  push((i) => <line key={`cheek-r-${i}`} className="line-art line-art-thin draw" pathLength={1} style={stagger(i)} x1={770} y1={540} x2={825} y2={GROUND_Y} />)

  for (const [from, to] of WINGS) {
    push((i) => <path key={`wing-${from}-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d={`M${from} ${GROUND_Y} V430 H${to} V${GROUND_Y}`} />)
    push((i) => <line key={`wing-roof-${from}-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} x1={from - 8} y1={424} x2={to + 8} y2={424} />)
    for (const row of [0, 1]) {
      for (const x of slitWindows(from, to)) {
        push((i) => (
          <line
            key={`slit-${from}-${row}-${x}-${i}`}
            className="line-art line-art-thin draw"
            pathLength={1}
            style={stagger(i)}
            x1={x}
            y1={448 + row * 72}
            x2={x}
            y2={482 + row * 72}
          />
        ))
      }
    }
  }

  // The launch tower: two legs, a rung and a cross-brace per cell, an antenna on top.
  const tower: ReactNode[] = []
  const pushTower = (node: (index: number) => ReactNode) => {
    tower.push(node(order))
    order += 1
  }
  const right = TOWER_X + 20
  pushTower((i) => <path key={`tower-legs-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d={`M${TOWER_X} ${GROUND_Y} V${TOWER_TOP} H${right} V${GROUND_Y}`} />)
  for (let y = GROUND_Y; y > TOWER_TOP; y -= TOWER_CELL) {
    const top = Math.max(y - TOWER_CELL, TOWER_TOP)
    pushTower((i) => (
      <path
        key={`tower-cell-${y}-${i}`}
        className="line-art line-art-thin draw"
        pathLength={1}
        style={stagger(i)}
        d={`M${TOWER_X} ${top} H${right} M${TOWER_X} ${y} L${right} ${top}`}
      />
    ))
  }
  pushTower((i) => <path key={`tower-antenna-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d={`M${TOWER_X + 10} ${TOWER_TOP} V${TOWER_TOP - 18} M${TOWER_X + 5} ${TOWER_TOP - 10} H${TOWER_X + 15}`} />)

  return (
    <svg
      viewBox="0 0 1200 650"
      role="img"
      aria-label="Line drawing of the Vikram Sarabhai Library at IIM Ahmedabad at sunset: the red sun in its great circular opening, the arches and the Harvard Steps. On Louis Kahn Plaza in front, a rocket lifts off from a launch pad."
      className={cn('plaza-launch h-auto w-full overflow-visible', className)}
    >
      <defs>
        <pattern id="plaza-brick" width="9" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6.5" x2="9" y2="6.5" stroke="var(--color-line)" strokeWidth="0.6" />
        </pattern>
        <mask id="plaza-openings">
          <rect x="330" y="250" width="540" height="290" fill="white" />
          <circle cx="600" cy="395" r="118" fill="black" />
          {SIDE_BAYS.map((x) => (
            <g key={x}>
              <path d={`M${x - 62} 540 V452 Q${x} 404 ${x + 62} 452 V540 Z`} fill="black" />
              <circle cx={x} cy="322" r="26" fill="black" />
            </g>
          ))}
        </mask>
        <clipPath id="plaza-oculus">
          <circle cx="600" cy="395" r="103" />
        </clipPath>
      </defs>

      <g clipPath="url(#plaza-oculus)">
        <circle className="plaza-sun" cx="600" cy="414" r="74" />
      </g>
      <rect className="brick-coursing" x="330" y="250" width="540" height="290" fill="url(#plaza-brick)" mask="url(#plaza-openings)" />
      <g>{lines}</g>

      <path className="line-leader" d="M870 262 L955 262 L985 232" />
      <text className="line-note" x="990" y="236">Vikram Sarabhai Library</text>
      <text className="line-note" x="990" y="251">Louis I. Kahn</text>
      <path className="line-leader" d="M372 572 L300 628 L200 628" />
      <text className="line-note" x="200" y="620">Harvard Steps</text>
      <text className="line-note" x="40" y="640">Louis Kahn Plaza · 23°01′N 72°32′E</text>

      <rect className="plaza-occlude" x={TOWER_X} y={TOWER_TOP} width="20" height={GROUND_Y - TOWER_TOP} />
      <g>{tower}</g>
      {[500, 540].map((y) => (
        <path key={y} className="line-art tower-arm" d={`M${right} ${y} H${583} M583 ${y - 4} V${y + 4}`} />
      ))}
      <path className="plaza-occlude" d="M572 600 V596 H628 V600 Z" />
      <path className="line-art" d="M566 600 L572 596 H628 L634 600" />

      <path className="launch-trail-glow" pathLength={1} d={TRAJECTORY} />
      <path className="launch-trail" pathLength={1} d={TRAJECTORY} />

      {SMOKE.map(([cx, cy, r, dx], index) => {
        const style: Puff = { '--i': index, '--dx': `${dx}px` }
        return <circle key={`${cx}-${cy}`} className="smoke-puff" style={style} cx={cx} cy={cy} r={r} />
      })}

      <Rocket />
    </svg>
  )
}
