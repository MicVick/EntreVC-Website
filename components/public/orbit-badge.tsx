import Link from 'next/link'
import { ArrowDownIcon as ArrowDown } from '@/components/ui/icons'

import { cn } from '@/components/ui/cn'

type OrbitBadgeProps = {
  href: string
  label: string
  /** Text set around the circle. Repeat it so it fills the ring. */
  ring: string
  className?: string
}

/** A round link with text circling it, turning slowly when motion is on. */
export function OrbitBadge({ href, label, ring, className }: OrbitBadgeProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn('group relative flex size-28 items-center justify-center rounded-full', className)}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" className="orbit-text absolute inset-0 size-full overflow-visible">
        <defs>
          <path id="orbit-badge-path" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
        </defs>
        <text className="orbit-label">
          <textPath href="#orbit-badge-path" textLength="290" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <span className="glass flex size-12 items-center justify-center rounded-full text-fg transition duration-300 group-hover:translate-y-0.5 group-hover:border-accent/60">
        <ArrowDown aria-hidden="true" className="size-4" />
      </span>
    </Link>
  )
}
