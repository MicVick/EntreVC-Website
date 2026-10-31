import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/ui/cn'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold tracking-[-0.01em] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45 [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg:last-child]:translate-x-0.5',
  {
    variants: {
      variant: {
        primary:
          'border-brand bg-brand text-brand-fg shadow-glow hover:border-brand-strong hover:bg-brand-strong hover:shadow-glow-lg',
        secondary:
          'border-border-strong bg-surface-2 text-fg hover:border-fg-subtle hover:bg-surface',
        ghost: 'border-transparent bg-transparent text-fg hover:bg-fg/[0.06]',
        outline:
          'border-fg/18 bg-fg/[0.04] text-fg backdrop-blur-md hover:border-fg/40 hover:bg-fg/[0.08]',
        danger: 'border-danger bg-danger text-danger-fg hover:brightness-110',
      },
      size: {
        sm: 'min-h-9 px-3.5 text-xs',
        md: 'min-h-11 px-5',
        lg: 'min-h-13 px-7 text-[0.95rem]',
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
