'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Dialog } from '@/components/ui/dialog'
import type { ImageRef } from '@/lib/schemas'

/**
 * Photo gallery for a past event.
 *
 * Built on the shared `Dialog` rather than a bespoke overlay so it inherits the native
 * `<dialog>` behaviours that are tedious to reimplement correctly: focus is trapped
 * while open, Escape closes, and the rest of the page is inert to a screen reader.
 * Left/right arrows move through the set, which is the only part a lightbox has to add.
 */

type EventGalleryProps = {
  images: ImageRef[]
  eventTitle: string
}

export function EventGallery({ images, eventTitle }: EventGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current
        return (current + delta + images.length) % images.length
      })
    },
    [images.length],
  )

  useEffect(() => {
    if (openIndex === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openIndex, step])

  if (images.length === 0) return null

  const active = openIndex === null ? null : images[openIndex]

  return (
    <>
      <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden rounded-md border border-border bg-surface-2 transition hover:border-border-strong"
            >
              <span className="sr-only">
                Open photo {index + 1} of {images.length}: {image.alt}
              </span>
              <Image
                src={image.url}
                alt=""
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={active !== null}
        onOpenChange={(next) => {
          if (!next) setOpenIndex(null)
        }}
        title={eventTitle}
        description={
          openIndex === null ? undefined : `Photo ${openIndex + 1} of ${images.length}`
        }
        className="sm:max-w-4xl"
      >
        {active ? (
          <div>
            <Image
              src={active.url}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes="(min-width: 640px) 56rem, 100vw"
              className="h-auto w-full rounded-md object-contain"
            />
            <p className="mt-4 text-sm leading-6 text-fg-muted">{active.alt}</p>

            {images.length > 1 ? (
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-bold transition hover:border-brand hover:text-accent"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" /> Previous
                </button>
                <p aria-live="polite" className="text-sm text-fg-subtle">
                  {(openIndex ?? 0) + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-bold transition hover:border-brand hover:text-accent"
                >
                  Next <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </>
  )
}
