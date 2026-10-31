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
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const share = async () => {
    const resolvedUrl = url ?? window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: resolvedUrl })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(resolvedUrl)
      setStatus('copied')
    } catch {
      // Clipboard access can be denied on non-secure previews; let the user copy manually.
      window.prompt('Copy this link', resolvedUrl)
      setStatus('error')
    }
    window.setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <Button variant="outline" size="sm" onClick={share} aria-live="polite">
      {status === 'copied' ? <Check aria-hidden="true" className="size-4" /> : <Share2 aria-hidden="true" className="size-4" />}
      {status === 'copied' ? 'Link copied' : status === 'error' ? 'Copy link' : 'Share'}
    </Button>
  )
}
