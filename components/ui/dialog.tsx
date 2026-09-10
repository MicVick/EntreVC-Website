'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
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
        'dialog-panel m-auto max-h-[min(88vh,48rem)] w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-border bg-surface p-0 text-fg shadow-lg sm:max-w-2xl',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6 border-b border-border p-5 sm:p-6">
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
          aria-label="Close dialog"
          onClick={() => onOpenChange(false)}
          className="-mr-2 -mt-2"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {footer ? <div className="border-t border-border p-5 sm:p-6">{footer}</div> : null}
    </dialog>
  )
}
