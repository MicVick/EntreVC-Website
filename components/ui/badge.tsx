import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/ui/cn'

// Badges label a category or a state. They stay quiet by default; red is reserved for
// the `brand` variant, which marks something you can act on (open, live, new).
const badgeVariants = cva(
  'inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 font-mono text-[0.64rem] font-medium uppercase leading-none tracking-[0.08em]',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2/85 text-fg-muted backdrop-blur',
        brand: 'border-accent/45 bg-brand-muted text-accent',
        success: 'border-success/50 bg-success-muted text-success',
        warning: 'border-warning/50 bg-warning-muted text-warning',
        danger: 'border-danger/50 bg-danger-muted text-danger',
        outline: 'border-border-strong bg-transparent text-fg-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
