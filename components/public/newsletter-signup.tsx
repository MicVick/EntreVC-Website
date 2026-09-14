'use client'

import { useId, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRightIcon, CheckIcon } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SubscriberSource } from '@/lib/schemas'
import { trackAnalytics } from '@/lib/analytics'

type NewsletterSignupProps = {
  source: SubscriberSource
  compact?: boolean
}

type FormState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'

export function NewsletterSignup({ source, compact = false }: NewsletterSignupProps) {
  const emailId = useId()
  const consentId = useId()
  const messageId = useId()
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const emailInput = formElement.elements.namedItem('email')
    const email = emailInput instanceof HTMLInputElement ? emailInput.value.trim() : ''
    const consentGiven = form.get('consentGiven') === 'on'
    const website = String(form.get('website') ?? '')

    if (!email) {
      setState('error')
      setMessage('Please enter your email')
      return
    }

    if (!(emailInput instanceof HTMLInputElement) || !emailInput.validity.valid) {
      setState('error')
      setMessage('That does not look like an email')
      return
    }

    if (!consentGiven) {
      setState('error')
      setMessage('We need your consent to email you')
      return
    }

    setState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, consentGiven, website: website || undefined }),
      })

      if (response.ok) {
        setState('success')
        setMessage('You’re on the list. We’ll only send the useful things.')
        formElement.reset()
        trackAnalytics('newsletter_signup', { source })
        return
      }

      if (response.status === 409) {
        setState('duplicate')
        setMessage('You’re already on the list — no need to sign up again.')
        return
      }

      setState('error')
      setMessage('We couldn’t add you right now. Please try again in a moment.')
    } catch {
      setState('error')
      setMessage('We couldn’t reach the server. Check your connection and try again.')
    }
  }

  if (state === 'success') {
    return (
      <div role="status" className="flex min-h-14 items-center gap-3 rounded-md border border-success bg-success-muted px-4 py-3 text-sm font-semibold text-success">
        <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
        {message}
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className={compact ? 'max-w-xl' : 'max-w-2xl'}>
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row' : 'grid gap-3 sm:grid-cols-[1fr_auto]'}>
        <div>
          <Label htmlFor={emailId} className="sr-only">Email address</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-describedby={message ? messageId : undefined}
            required
          />
        </div>
        <Button type="submit" size={compact ? 'md' : 'lg'} disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Joining…' : 'Join the list'}
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <Checkbox id={consentId} name="consentGiven" required />
        <Label htmlFor={consentId} className="text-xs font-normal leading-5 text-fg-muted">
          I agree to receive occasional EntreVC updates. I can unsubscribe anytime.
        </Label>
      </div>
      <div className="sr-only" aria-hidden="true">
        <Label htmlFor={`${emailId}-website`}>Website</Label>
        <Input id={`${emailId}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {message ? (
        <p
          id={messageId}
          role={state === 'error' ? 'alert' : 'status'}
          className={state === 'error' ? 'mt-3 text-sm text-danger' : 'mt-3 text-sm text-accent'}
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
