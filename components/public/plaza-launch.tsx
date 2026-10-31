import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Line drawing of Louis Kahn Plaza at IIM Ahmedabad, seen from the lawn: the classroom
 * block receding on the left with its hooded windows, the Vikram Sarabhai Library at
 * the back (the arched window, the tall slot with its round opening, the terrace and
 * the steps) and the faculty block on the right with one of Kahn's great cut circles.
 * Traced from photographs of the plaza, simplified, not to scale.
 *
 * A rocket stands on a pad on the lawn with the red sun setting behind the library.
 * Server-rendered SVG, animated in CSS (`.plaza-launch` in globals.css): the lines
 * sketch themselves and the sun rises once, then the launch loops with a pause between
 * flights. The SVG overflows its box on purpose so the climb can leave the drawing.
 * Without animation it is a still poster of the rocket on the pad.
 */

type Stagger = CSSProperties & Record<'--i', number>
type Puff = CSSProperties & Record<'--i', number> & Record<'--dx', string>
type Point = readonly [number, number]

const stagger = (index: number): Stagger => ({ '--i': index })
const round = (n: number) => Math.round(n * 10) / 10
const pt = ([x, y]: Point) => `${x} ${y}`

/** Where the buildings meet the ground, and the lawn the rocket stands on. */
const GROUND_Y = 522
const LAWN_Y = 600

/** The launch axis lines up with the library's slot and the sun. */
const PAD_X = 671

/** Launch tower beside the pad: x from TOWER_X to TOWER_X + 20, rising from the lawn. */
const TOWER_X = PAD_X - 62
const TOWER_TOP = 448
const TOWER_CELL = 24

/** Straight up off the pad, then a gentle turn to the right and out of the frame. */
const TRAJECTORY = `M${PAD_X} 590 V440 C${PAD_X} 250 ${PAD_X + 100} 40 ${PAD_X + 410} -520`

/** Exhaust clouds rolling out along the lawn: [cx, cy, r, sideways drift]. */
const SMOKE: readonly (readonly [number, number, number, number])[] = [
  [PAD_X, 595, 8, 0],
  [PAD_X - 14, 594, 7, -26],
  [PAD_X + 14, 594, 7, 26],
  [PAD_X - 28, 597, 6, -50],
  [PAD_X + 28, 597, 6, 50],
  [PAD_X - 40, 599, 5, -74],
  [PAD_X + 40, 599, 5, 74],
]

type Edge = { x: number; top: number; bottom: number }

/**
 * A wall seen in perspective, from its `from` edge to its `to` edge. Returns a mapping
 * from wall coordinates (u along the wall, v up it, both 0–1) to drawing coordinates,
 * foreshortened so equally spaced windows bunch up as the wall recedes.
 */
function perspectiveWall(from: Edge, to: Edge) {
  const k = (from.bottom - from.top) / (to.bottom - to.top) - 1
  const project = (a: number, b: number, u: number) => (a + (b * (1 + k) - a) * u) / (1 + k * u)
  return (u: number, v: number): Point => {
    const top = project(from.top, to.top, u)
    const bottom = project(from.bottom, to.bottom, u)
    return [round(project(from.x, to.x, u)), round(bottom + (top - bottom) * v)]
  }
}

type Wall = ReturnType<typeof perspectiveWall>

/** A window on a receding wall, optionally with Kahn's flat arch and concrete tie above. */
function wallWindow(wall: Wall, u0: number, u1: number, v0: number, v1: number, hood: boolean): string {
  const box = `M${pt(wall(u0, v0))} L${pt(wall(u1, v0))} L${pt(wall(u1, v1))} L${pt(wall(u0, v1))} Z`
  if (!hood) return box
  const tie = v1 + 0.01
  const spread = (u1 - u0) * 0.25
  return `${box} M${pt(wall(u0 - spread, tie))} L${pt(wall(u1 + spread, tie))} M${pt(wall(u0, tie))} Q${pt(wall((u0 + u1) / 2, tie + 0.034))} ${pt(wall(u1, tie))}`
}

/** An arch-topped opening on a receding wall, with the tie across its springing. */
function wallArch(wall: Wall, u0: number, u1: number, v0: number, spring: number, rise: number): string {
  return `M${pt(wall(u0, v0))} L${pt(wall(u0, spring))} Q${pt(wall((u0 + u1) / 2, spring + rise * 2))} ${pt(wall(u1, spring))} L${pt(wall(u1, v0))} M${pt(wall(u0 - 0.04, spring))} L${pt(wall(u1 + 0.04, spring))}`
}

/** The classroom block on the left, receding towards the library. */
const classroomBlock = perspectiveWall({ x: 10, top: 40, bottom: GROUND_Y }, { x: 332, top: 179, bottom: GROUND_Y })
const CLASSROOM_COLUMNS = [0.08, 0.27, 0.46, 0.65, 0.84] as const
const CLASSROOM_ROWS = [
  [0.13, 0.25, false],
  [0.34, 0.5, true],
  [0.57, 0.71, true],
  [0.78, 0.9, true],
] as const

/** The side of the faculty block on the right, coming towards us. */
const facultySide = perspectiveWall({ x: 926, top: 212, bottom: GROUND_Y }, { x: 1060, top: 80, bottom: GROUND_Y })
const FACULTY_COLUMNS = [
  [0.2, 0.38],
  [0.58, 0.76],
] as const
const FACULTY_ROWS = [
  [0.13, 0.24],
  [0.39, 0.5],
  [0.65, 0.77],
] as const

/** Square openings along the foot of the library wall, either side of the slot. */
const LIBRARY_NOTCHES = [466, 515, 565, 741, 791, 842] as const
/** The colonnade openings in the terrace wall in front of the library. */
const TERRACE_OPENINGS = [411, 460, 509, 558, 607, 656, 705, 754, 803, 852] as const

const BIG_ARCH = 'M345 292 V279 A50.5 50.5 0 0 1 446 279 V292 Z'
const DOOR_ARCH = 'M362.5 418 V382 A33 33 0 0 1 428.5 382 V418'
const SLOT_ARCH = `M618 209 Q${PAD_X} 181 724 209`

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
  const draw = (d: string, thin = false) => {
    const index = order
    order += 1
    lines.push(
      <path key={`line-${index}`} className={cn('line-art draw', thin && 'line-art-thin')} pathLength={1} style={stagger(index)} d={d} />,
    )
  }

  // Ground, then the library from the top down, then the terrace and steps in front.
  draw(`M10 ${GROUND_Y} H1190`)
  draw('M288 160 H470 V177 H895 V418')
  draw(BIG_ARCH)
  draw('M340 292 H451 V298 H340 Z M378.5 292 V234 M412.5 292 V234', true)
  draw(DOOR_ARCH)
  draw('M354 380 H437 V386 H354 Z', true)
  draw('M618 418 V215 M724 215 V418 M613 209 H729 V215 H613 Z')
  draw(SLOT_ARCH)
  draw('M633 215 V418', true)
  draw(`M${PAD_X} 256 A37 56 0 1 1 ${PAD_X} 368 A37 56 0 1 1 ${PAD_X} 256 Z`)
  draw(`M${PAD_X + 4} 266 A31 48 0 1 1 ${PAD_X + 4} 362 A31 48 0 1 1 ${PAD_X + 4} 266 Z`, true)
  draw(LIBRARY_NOTCHES.map((x) => `M${x} 418 V399 H${x + 33} V418`).join(' '))
  draw('M314 487 V418 H933 V487')
  draw('M314 424 H933', true)
  draw(TERRACE_OPENINGS.map((x) => `M${x} 484 V450 H${x + 35} V484 Z`).join(' '))
  draw(`M100 487 H1050 M186 487 V${GROUND_Y} M818 487 L803 ${GROUND_Y}`)
  draw([494, 501, 508, 515].map((y) => `M100 ${y} H186`).join(' '), true)
  draw([493, 499, 505, 511, 517].map((y, i) => `M${815 - i * 3} ${y} H1050`).join(' '), true)

  // The classroom block: outline, parapet, then four storeys of windows.
  draw(`M10 ${GROUND_Y} V40 L332 179 V418`)
  draw(`M${pt(classroomBlock(0, 0.975))} L${pt(classroomBlock(1, 0.975))}`, true)
  for (const [v0, v1, hood] of CLASSROOM_ROWS) {
    for (const u of CLASSROOM_COLUMNS) draw(wallWindow(classroomBlock, u - 0.03, u + 0.03, v0, v1, hood))
  }

  // The faculty block: a narrow service volume, the receding side with arched windows,
  // and the end wall facing us with its great circle.
  draw('M906 418 V311 H926')
  draw(`M926 418 V212 L1060 80 V${GROUND_Y} M1060 80 H1190 V${GROUND_Y}`)
  for (const [v0, spring] of FACULTY_ROWS) {
    for (const [u0, u1] of FACULTY_COLUMNS) draw(wallArch(facultySide, u0, u1, v0, spring, 0.035), true)
  }
  draw('M1125 133 A42 42 0 1 1 1125 217 A42 42 0 1 1 1125 133 Z')
  draw('M1129 141 A35 35 0 1 1 1129 211 A35 35 0 1 1 1129 141 Z', true)
  draw(
    [282, 372, 462]
      .flatMap((y) => [`M1078 ${y} H1100 V${y + 30} H1078 Z`, `M1150 ${y} H1172 V${y + 30} H1150 Z`])
      .join(' '),
  )

  // The lawn, with the path that curves across it.
  draw('M40 646 Q671 596 1160 646', true)

  // The launch tower: two legs, a rung and a cross-brace per cell, an antenna on top.
  const tower: ReactNode[] = []
  const pushTower = (node: (index: number) => ReactNode) => {
    tower.push(node(order))
    order += 1
  }
  const right = TOWER_X + 20
  pushTower((i) => <path key={`tower-legs-${i}`} className="line-art draw" pathLength={1} style={stagger(i)} d={`M${TOWER_X} ${LAWN_Y} V${TOWER_TOP} H${right} V${LAWN_Y}`} />)
  for (let y = LAWN_Y; y > TOWER_TOP; y -= TOWER_CELL) {
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
      aria-label="Line drawing of Louis Kahn Plaza at IIM Ahmedabad at sunset: the classroom block with its arched windows, the Vikram Sarabhai Library with its tall slot and round opening, and the faculty block with a great circle cut into its wall. The red sun sets behind the library. On the lawn in front, a rocket lifts off from a launch pad."
      className={cn('plaza-launch h-auto w-full overflow-visible', className)}
    >
      <defs>
        <pattern id="plaza-brick" width="9" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6.5" x2="9" y2="6.5" stroke="var(--color-line)" strokeWidth="0.6" />
        </pattern>
        <mask id="plaza-library-wall">
          <path d="M332 160 H470 V177 H895 V418 H332 Z" fill="white" />
          <path d={BIG_ARCH} fill="black" />
          <path d={`${DOOR_ARCH} Z`} fill="black" />
          <path d={`${SLOT_ARCH} V418 H618 Z`} fill="black" />
          {LIBRARY_NOTCHES.map((x) => (
            <rect key={x} x={x} y="399" width="33" height="19" fill="black" />
          ))}
        </mask>
        {/* The sky above the library roof, and the arch at the top of the slot. */}
        <clipPath id="plaza-sky">
          <rect x="0" y="-400" width="1200" height="577" />
          <path d={`${SLOT_ARCH} Z`} />
        </clipPath>
      </defs>

      <g clipPath="url(#plaza-sky)">
        <circle className="plaza-sun" cx={PAD_X} cy="180" r="96" />
      </g>
      <rect className="brick-coursing" x="332" y="160" width="563" height="258" fill="url(#plaza-brick)" mask="url(#plaza-library-wall)" />
      <g>{lines}</g>

      <path className="line-leader" d="M410 160 V141" />
      <text className="line-note" x="345" y="120">Vikram Sarabhai Library</text>
      <text className="line-note" x="345" y="135">Louis I. Kahn</text>
      <text className="line-note" x="40" y="614">Louis Kahn Plaza · 23°02′N 72°32′E</text>

      <rect className="plaza-occlude" x={TOWER_X} y={TOWER_TOP} width="20" height={LAWN_Y - TOWER_TOP} />
      <g>{tower}</g>
      {[500, 540].map((y) => (
        <path key={y} className="line-art tower-arm" d={`M${right} ${y} H${PAD_X - 17} M${PAD_X - 17} ${y - 4} V${y + 4}`} />
      ))}
      <path className="plaza-occlude" d={`M${PAD_X - 28} ${LAWN_Y} V${LAWN_Y - 4} H${PAD_X + 28} V${LAWN_Y} Z`} />
      <path className="line-art" d={`M${PAD_X - 34} ${LAWN_Y} L${PAD_X - 28} ${LAWN_Y - 4} H${PAD_X + 28} L${PAD_X + 34} ${LAWN_Y}`} />

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
