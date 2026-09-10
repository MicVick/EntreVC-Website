'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { trackAnalytics } from '@/lib/analytics'
import {
  submissionCategories,
  submissionCategoryLabels,
  submissionInputSchema,
  type SubmissionCategory,
  type SubmissionInput,
} from '@/lib/schemas'

function isSubmissionCategory(value: string | null): value is SubmissionCategory {
  return value !== null && submissionCategories.some((category) => category === value)
}

export function ContactForm() {
  const searchParams = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionInputSchema),
    defaultValues: {
      category: isSubmissionCategory(requestedCategory) ? requestedCategory : 'general',
      website: '',
    },
  })

  const submit = handleSubmit(async (data) => {
    setFormError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        setFormError(
          response.status === 429
            ? 'Too many attempts. Please wait a minute and try again.'
            : 'We couldn’t send your message right now. Please try again in a moment.',
        )
        return
      }

      setSubmitted(true)
      reset()
      trackAnalytics('contact_submit', { category: data.category })
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.')
    }
  })

  if (submitted) {
    return (
      <div role="status" className="rounded-lg border border-success bg-success-muted p-6 sm:p-8">
        <CheckCircle2 aria-hidden="true" className="size-8 text-success" />
        <h2 className="display-type mt-6 text-3xl font-semibold text-fg">Your message is with the right team.</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-fg-muted">We’ve saved your note and sent an acknowledgement to your inbox. Someone from the relevant vertical will reply.</p>
        <Button variant="outline" className="mt-7" onClick={() => setSubmitted(false)}>Send another message</Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-lg border border-border bg-surface p-5 shadow-md sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="contact-category">What is this about?</Label>
          <Select id="contact-category" className="mt-2" aria-invalid={Boolean(errors.category)} {...register('category')}>
            {submissionCategories.map((category) => (
              <option key={category} value={category}>{submissionCategoryLabels[category]}</option>
            ))}
          </Select>
          {errors.category ? <p role="alert" className="mt-2 text-sm text-danger">{errors.category.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" className="mt-2" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
          {errors.name ? <p role="alert" className="mt-2 text-sm text-danger">{errors.name.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" className="mt-2" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          {errors.email ? <p role="alert" className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact-affiliation">Batch or organisation <span className="font-normal text-fg-subtle">(optional)</span></Label>
          <Input id="contact-affiliation" className="mt-2" autoComplete="organization" aria-invalid={Boolean(errors.batchOrOrganisation)} {...register('batchOrOrganisation')} />
          {errors.batchOrOrganisation ? <p role="alert" className="mt-2 text-sm text-danger">{errors.batchOrOrganisation.message}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea id="contact-message" className="mt-2" rows={7} aria-invalid={Boolean(errors.message)} {...register('message')} />
          {errors.message ? <p role="alert" className="mt-2 text-sm text-danger">{errors.message.message}</p> : null}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
        <Checkbox id="contact-consent" aria-invalid={Boolean(errors.consentGiven)} {...register('consentGiven')} />
        <div>
          <Label htmlFor="contact-consent" className="font-normal leading-6 text-fg-muted">I agree to EntreVC storing this message and my details so the team can reply.</Label>
          {errors.consentGiven ? <p role="alert" className="mt-2 text-sm text-danger">{errors.consentGiven.message}</p> : null}
        </div>
      </div>

      <div className="sr-only" aria-hidden="true">
        <Label htmlFor="contact-website">Website</Label>
        <Input id="contact-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {formError ? <p role="alert" className="mt-5 rounded-md border border-danger bg-danger-muted p-4 text-sm text-danger">{formError}</p> : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-7 w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : 'Send to the right team'}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </form>
  )
}
