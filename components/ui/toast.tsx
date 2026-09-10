'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

export { toast }

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border border-border bg-surface-2 text-fg shadow-lg',
          title: 'font-semibold text-fg',
          description: 'text-fg-muted',
          actionButton: 'bg-brand text-brand-fg',
          cancelButton: 'bg-surface text-fg',
          closeButton: 'border-border bg-surface text-fg',
        },
      }}
    />
  )
}
