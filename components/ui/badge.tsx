import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/ui/cn'

const badgeVariants = cva(
  'inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase leading-none tracking-[0.12em]',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-fg-muted',
        brand: 'border-brand bg-brand-muted text-accent',
        success: 'border-success bg-success-muted text-success',
        warning: 'border-warning bg-warning-muted text-warning',
        danger: 'border-danger bg-danger-muted text-danger',
        outline: 'border-border-strong bg-transparent text-fg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
