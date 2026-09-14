'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { XIcon } from '@/components/ui/icons'

export type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  side?: 'left' | 'right'
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const sheet = ref.current
    if (!sheet) return

    if (open && !sheet.open) sheet.showModal()
    if (!open && sheet.open) sheet.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
      className={cn(
        'dialog-panel fixed inset-y-0 m-0 h-dvh w-[min(92vw,28rem)] max-w-none border-border bg-surface p-0 text-fg shadow-lg',
        side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-5 border-b border-border p-5">
          <div>
            <h2 id={titleId} className="display-type text-2xl font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
            className="-mr-2 -mt-2"
          >
            <XIcon aria-hidden="true" className="size-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  )
}
