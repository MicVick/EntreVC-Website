import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/ui/cn'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold tracking-[-0.01em] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'border-brand bg-brand text-brand-fg shadow-sm hover:border-accent hover:bg-accent hover:text-accent-fg',
        secondary:
          'border-border-strong bg-surface text-fg hover:border-fg-muted hover:bg-surface-2',
        ghost: 'border-transparent bg-transparent text-fg hover:border-border hover:bg-surface',
        outline:
          'border-border-strong bg-transparent text-fg hover:border-brand hover:text-accent',
        danger: 'border-danger bg-danger text-danger-fg hover:brightness-110',
      },
      size: {
        sm: 'min-h-9 px-4 text-xs',
        md: 'min-h-11 px-5',
        lg: 'min-h-13 px-7 text-base',
        icon: 'size-11 shrink-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
