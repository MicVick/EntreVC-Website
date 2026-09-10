'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ShareButtonProps = {
  title: string
  text?: string
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const resolvedUrl = url ?? window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: resolvedUrl })
        return
      } catch {
        return
      }
    }

    await navigator.clipboard.writeText(resolvedUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Button variant="outline" size="sm" onClick={share} aria-live="polite">
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Share2 aria-hidden="true" className="size-4" />}
      {copied ? 'Link copied' : 'Share'}
    </Button>
  )
}
