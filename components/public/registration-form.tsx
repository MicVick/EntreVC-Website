'use client'

import { useEffect, useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Lock,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useForm, type Path } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { trackAnalytics } from '@/lib/analytics'
import { formatDateInIST, formatDateRangeInIST } from '@/lib/format'
import {
  attendeeTypeLabels,
  attendeeTypes,
  availabilitySchema,
  registrationInputSchema,
  registrationResponseSchema,
  type ActionErrorCode,
  type Availability,
  type Event,
  type RegistrationFormValues,
  type RegistrationResult,
} from '@/lib/schemas'

/**
 * The registration panel — the one piece of UI this whole project exists to make work.
 *
 * Three things shape its design:
 *
 *   1. **It expands inline.** No route change, no modal. The overwhelming majority of
 *      arrivals are a WhatsApp link opened on a phone on 4G, and every navigation
 *      between reading the event and submitting the form is a place to lose someone.
 *   2. **The page is statically generated, so the seat count in the HTML is stale by
 *      definition.** The live figure is fetched on mount from the availability endpoint.
 *      That number is advisory in the strict sense: POST /api/register re-counts under a
 *      lock and is the only authority on whether a place exists. This component must
 *      therefore handle being told "full" at submit time even though it just rendered
 *      "3 places left" — which is exactly what the FULL and waitlist paths below do.
 *   3. **Every failure has a specific treatment**, keyed off `code` rather than matched
 *      on message text, so wording can change without breaking behaviour.
 */

type RegistrationFormProps = {
  event: Event
  className?: string
}

const PANEL = 'rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-7'

/** Field names the server is allowed to attach an error to. Anything else is shown form-level. */
function toFormPath(event: Event, key: string): Path<RegistrationFormValues> | null {
  if (
    key === 'name' ||
    key === 'email' ||
    key === 'phone' ||
    key === 'batchOrOrganisation' ||
    key === 'attendeeType' ||
    key === 'consentGiven'
  ) {
    return key
  }

  const customId = key.startsWith('customAnswers.') ? key.slice('customAnswers.'.length) : null
  if (customId && event.registrationFields.some((field) => field.id === customId)) {
    return `customAnswers.${customId}`
  }

  return null
}

function closedReason(event: Event): { heading: string; body: string } {
  if (!event.registrationEnabled) {
    return {
      heading: 'No registration needed',
      body: 'This one is not ticketed through the site. Check the details above for how to join, or get in touch if anything is unclear.',
    }
  }
  if (event.isPast) {
    return {
      heading: 'This event has finished',
      body: 'Registrations are closed. If there is a recap or a recording it will appear on this page.',
    }
  }
  return {
    heading: 'Registrations have closed',
    body: event.registrationDeadline
      ? `The deadline was ${formatDateInIST(event.registrationDeadline)}. If you still want to come, message the team — sometimes a place opens up.`
      : 'The team has closed sign-ups for this event. Message us if you still want to come.',
  }
}

export function RegistrationForm({ event, className }: RegistrationFormProps) {
  const formId = useId()
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [failure, setFailure] = useState<{ code: ActionErrorCode; message: string } | null>(null)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationInputSchema),
    defaultValues: {
      eventSlug: event.slug,
      name: '',
      email: '',
      phone: '',
      batchOrOrganisation: '',
      attendeeType: 'student',
      customAnswers: {},
      website: '',
    },
  })

  // Live seat count for a page whose HTML was built some time ago.
  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/events/${event.slug}/availability`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        const parsed = availabilitySchema.safeParse(body)
        if (parsed.success) setAvailability(parsed.data)
      })
      .catch(() => {
        // A failed availability check must never block registering — the form still
        // works, it just shows no seat count.
      })

    return () => controller.abort()
  }, [event.slug])

  // Move the keyboard into the form when it opens, or the tab order silently jumps
  // past everything that just appeared.
  useEffect(() => {
    if (expanded) setFocus('name')
  }, [expanded, setFocus])

  const open = () => {
    setExpanded(true)
    trackAnalytics('register_start', { event: event.slug })
  }

  const submit = handleSubmit(async (values) => {
    setFailure(null)

    let body: unknown
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, eventSlug: event.slug }),
      })
      body = await response.json()
    } catch {
      setFailure({
        code: 'SERVER_ERROR',
        message: 'We could not reach the server. Check your connection and try again.',
      })
      return
    }

    const parsed = registrationResponseSchema.safeParse(body)
    if (!parsed.success) {
      setFailure({
        code: 'SERVER_ERROR',
        message: 'We got an unexpected reply from the server. Please try again in a moment.',
      })
      return
    }

    if (parsed.data.ok) {
      setResult(parsed.data.data)
      trackAnalytics('registration_complete', {
        event: event.slug,
        status: parsed.data.data.status,
      })
      return
    }

    const { code, error, fieldErrors } = parsed.data

    // Field-level errors go on the fields, and the focus follows the first one.
    if (fieldErrors) {
      let firstPath: Path<RegistrationFormValues> | null = null
      for (const [key, messages] of Object.entries(fieldErrors)) {
        const message = messages[0]
        if (!message) continue
        const path = toFormPath(event, key)
        if (!path) continue
        setError(path, { type: 'server', message })
        firstPath ??= path
      }
      if (firstPath) setFocus(firstPath)
    }

    setFailure({ code, message: error })
  })

  const resend = async () => {
    setResendState('sending')
    try {
      await fetch('/api/register/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventSlug: event.slug, email: getValues('email') }),
      })
    } catch {
      // Deliberately swallowed: the message below promises nothing more than "we tried",
      // because the endpoint will not confirm whether an address is registered anyway.
    }
    setResendState('sent')
  }

  // ── Terminal states ────────────────────────────────────────────────────────

  if (result) {
    return (
      <SuccessPanel event={event} result={result} className={className} />
    )
  }

  if (failure?.code === 'DUPLICATE') {
    return (
      <section className={className} aria-labelledby={`${formId}-duplicate`}>
        <div className={PANEL}>
          <Inbox aria-hidden="true" className="size-7 text-accent" />
          <h2 id={`${formId}-duplicate`} className="display-type mt-5 text-2xl font-semibold">
            You’re already registered
          </h2>
          <p className="mt-3 text-sm leading-6 text-fg-muted">
            We have a registration against that email address, so there is nothing more to
            do — your place is held. The confirmation has the joining details.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resend}
              disabled={resendState !== 'idle'}
            >
              {resendState === 'sending' ? 'Sending…' : 'Send the confirmation again'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFailure(null)}>
              Use a different email
            </Button>
          </div>
          <p aria-live="polite" className="mt-4 min-h-5 text-sm text-fg-muted">
            {resendState === 'sent'
              ? 'If that address is registered, the confirmation is on its way. Do check your spam folder.'
              : ''}
          </p>
        </div>
      </section>
    )
  }

  if (event.isRegistrationClosed || failure?.code === 'CLOSED') {
    const reason = failure?.code === 'CLOSED'
      ? { heading: 'Registrations have just closed', body: failure.message }
      : closedReason(event)

    return (
      <section className={className} aria-labelledby={`${formId}-closed`}>
        <div className={PANEL}>
          <Lock aria-hidden="true" className="size-7 text-fg-subtle" />
          <h2 id={`${formId}-closed`} className="display-type mt-5 text-2xl font-semibold">
            {reason.heading}
          </h2>
          <p className="mt-3 text-sm leading-6 text-fg-muted">{reason.body}</p>
          <Link
            href="/contact?category=event"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent transition hover:underline"
          >
            Message the events team <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    )
  }

  // ── The live form ──────────────────────────────────────────────────────────

  const isFull = availability?.isFull ?? false
  const seatsLeft =
    availability && availability.capacity !== null
      ? Math.max(0, availability.capacity - availability.registered)
      : null

  return (
    <section className={className} aria-labelledby={`${formId}-heading`}>
      <div className={PANEL}>
        <h2 id={`${formId}-heading`} className="display-type text-2xl font-semibold">
          {isFull ? 'Join the waitlist' : 'Register for this event'}
        </h2>

        <CapacityMeter availability={availability} seatsLeft={seatsLeft} />

        {isFull ? (
          <p className="mt-4 rounded-md border border-warning bg-warning-muted p-4 text-sm leading-6 text-warning">
            Every place has gone. You can still join the waitlist — if someone drops out
            the team works down the list in order and emails you to confirm. You will not
            get a calendar invite until that happens.
          </p>
        ) : event.registrationDeadline ? (
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-fg-muted">
            <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>Registration closes {formatDateInIST(event.registrationDeadline)}.</span>
          </p>
        ) : null}

        {event.restrictToInstituteEmail ? (
          <p className="mt-3 text-sm leading-6 text-fg-muted">
            This one is open to IIMA email addresses only.
          </p>
        ) : null}

        {!expanded ? (
          <Button size="lg" onClick={open} className="mt-6 w-full">
            {isFull ? 'Join the waitlist' : 'Register'}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <form onSubmit={submit} noValidate className="mt-7 grid gap-5">
            <div>
              <Label htmlFor={`${formId}-name`}>Full name</Label>
              <Input
                id={`${formId}-name`}
                className="mt-2"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                {...register('name')}
              />
              {errors.name ? (
                <p id={`${formId}-name-error`} role="alert" className="mt-2 text-sm text-danger">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${formId}-email`}>Email</Label>
              <Input
                id={`${formId}-email`}
                className="mt-2"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                {...register('email')}
              />
              {errors.email ? (
                <p id={`${formId}-email-error`} role="alert" className="mt-2 text-sm text-danger">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${formId}-phone`}>
                  Phone <span className="font-normal text-fg-subtle">(optional)</span>
                </Label>
                <Input
                  id={`${formId}-phone`}
                  className="mt-2"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone')}
                />
                {errors.phone ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor={`${formId}-attendee-type`}>You are</Label>
                <Select
                  id={`${formId}-attendee-type`}
                  className="mt-2"
                  aria-invalid={Boolean(errors.attendeeType)}
                  {...register('attendeeType')}
                >
                  {attendeeTypes.map((type) => (
                    <option key={type} value={type}>
                      {attendeeTypeLabels[type]}
                    </option>
                  ))}
                </Select>
                {errors.attendeeType ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.attendeeType.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label htmlFor={`${formId}-affiliation`}>
                Batch or organisation <span className="font-normal text-fg-subtle">(optional)</span>
              </Label>
              <Input
                id={`${formId}-affiliation`}
                className="mt-2"
                autoComplete="organization"
                placeholder="PGP 2025-27, or where you work"
                aria-invalid={Boolean(errors.batchOrOrganisation)}
                {...register('batchOrOrganisation')}
              />
              {errors.batchOrOrganisation ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {errors.batchOrOrganisation.message}
                </p>
              ) : null}
            </div>

            {event.registrationFields.map((field) => {
              const inputId = `${formId}-${field.id}`
              const path: Path<RegistrationFormValues> = `customAnswers.${field.id}`
              const message = errors.customAnswers?.[field.id]?.message

              return (
                <div key={field.id}>
                  {field.type === 'checkbox' ? (
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={inputId}
                        className="mt-1"
                        aria-invalid={Boolean(message)}
                        {...register(path)}
                      />
                      <Label htmlFor={inputId} className="font-normal leading-6 text-fg-muted">
                        {field.label}
                        {field.required ? null : (
                          <span className="text-fg-subtle"> (optional)</span>
                        )}
                      </Label>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={inputId}>
                        {field.label}
                        {field.required ? null : (
                          <span className="font-normal text-fg-subtle"> (optional)</span>
                        )}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={inputId}
                          className="mt-2 min-h-28"
                          rows={4}
                          aria-invalid={Boolean(message)}
                          {...register(path)}
                        />
                      ) : field.type === 'select' ? (
                        <Select
                          id={inputId}
                          className="mt-2"
                          defaultValue=""
                          aria-invalid={Boolean(message)}
                          {...register(path)}
                        >
                          <option value="" disabled>
                            Choose one
                          </option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          id={inputId}
                          className="mt-2"
                          aria-invalid={Boolean(message)}
                          {...register(path)}
                        />
                      )}
                    </>
                  )}
                  {message ? (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {String(message)}
                    </p>
                  ) : null}
                </div>
              )
            })}

            <div className="flex items-start gap-3 border-t border-border pt-5">
              <Checkbox
                id={`${formId}-consent`}
                className="mt-1"
                aria-invalid={Boolean(errors.consentGiven)}
                {...register('consentGiven')}
              />
              <div>
                <Label htmlFor={`${formId}-consent`} className="font-normal leading-6 text-fg-muted">
                  I agree to EntreVC storing the details above to manage my registration for
                  this event.
                </Label>
                {errors.consentGiven ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.consentGiven.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Honeypot. Never visible, never focusable, never read aloud. */}
            <div className="sr-only" aria-hidden="true">
              <Label htmlFor={`${formId}-website`}>Website</Label>
              <Input id={`${formId}-website`} tabIndex={-1} autoComplete="off" {...register('website')} />
            </div>

            {failure ? (
              <p
                role="alert"
                className="rounded-md border border-danger bg-danger-muted p-4 text-sm leading-6 text-danger"
              >
                {failure.message}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? 'Sending…'
                : isFull
                  ? 'Join the waitlist'
                  : 'Confirm my place'}
              {isSubmitting ? null : <ArrowRight aria-hidden="true" className="size-4" />}
            </Button>

            <p className="text-xs leading-5 text-fg-subtle">
              We use these details only to run this event and will never pass them on.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function CapacityMeter({
  availability,
  seatsLeft,
}: {
  availability: Availability | null
  seatsLeft: number | null
}) {
  // No capacity set means the event is uncapped — showing a meter would invent a limit
  // the club never asked for.
  if (!availability || availability.capacity === null || seatsLeft === null) return null

  const taken = Math.min(availability.registered, availability.capacity)
  const percentage = Math.round((taken / availability.capacity) * 100)
  const tight = seatsLeft > 0 && seatsLeft <= Math.max(3, Math.ceil(availability.capacity * 0.1))

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-fg-muted">
          <Users aria-hidden="true" className="size-4 text-accent" />
          {seatsLeft > 0 ? (
            <span className={tight ? 'font-bold text-warning' : ''}>
              {seatsLeft} {seatsLeft === 1 ? 'place' : 'places'} left
            </span>
          ) : (
            <span className="font-bold text-warning">Full</span>
          )}
        </span>
        <span className="text-fg-subtle">
          {taken} of {availability.capacity}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={availability.capacity}
        aria-valuenow={taken}
        aria-label="Places taken"
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className={percentage >= 100 ? 'h-full bg-warning' : 'h-full bg-brand'}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
      {availability.waitlisted > 0 ? (
        <p className="mt-2 text-xs text-fg-subtle">
          {availability.waitlisted} on the waitlist
        </p>
      ) : null}
    </div>
  )
}

function SuccessPanel({
  event,
  result,
  className,
}: {
  event: Event
  result: RegistrationResult
  className?: string
}) {
  const waitlisted = result.status === 'waitlisted'

  return (
    <section className={className} aria-live="polite">
      <div
        className={
          waitlisted
            ? 'rounded-lg border border-warning bg-warning-muted p-5 shadow-sm sm:p-7'
            : 'rounded-lg border border-success bg-success-muted p-5 shadow-sm sm:p-7'
        }
      >
        <CheckCircle2
          aria-hidden="true"
          className={waitlisted ? 'size-8 text-warning' : 'size-8 text-success'}
        />
        <h2 className="display-type mt-5 text-3xl font-semibold text-fg">
          {waitlisted ? 'You’re on the waitlist' : 'You’re registered'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          {waitlisted
            ? `This event is at capacity, so we have held you at position #${result.waitlistPosition ?? 1}. If someone drops out the team works down the list in order and emails you to confirm — there is nothing else you need to do.`
            : 'Your place is held and a confirmation is on its way to your inbox, with the calendar file attached.'}
        </p>

        <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <dt className="text-fg-subtle">When</dt>
            <dd className="font-semibold text-fg">
              {formatDateRangeInIST(event.startDateTime, event.endDateTime)}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <dt className="text-fg-subtle">Where</dt>
            <dd className="font-semibold text-fg">
              {event.venue ? event.venue.name : 'Online — the link is in your email'}
            </dd>
          </div>
        </dl>

        {/* Offered inline because a good share of people never open the email. */}
        {waitlisted ? null : (
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={result.icsUrl}
              download={`${event.slug}.ics`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-strong bg-transparent px-5 text-sm font-bold text-fg transition hover:border-brand hover:text-accent"
            >
              <Download aria-hidden="true" className="size-4" /> Download invite
            </a>
            {result.addToCalendarUrl ? (
              <a
                href={result.addToCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-strong bg-transparent px-5 text-sm font-bold text-fg transition hover:border-brand hover:text-accent"
              >
                <CalendarPlus aria-hidden="true" className="size-4" /> Add to Google Calendar
              </a>
            ) : null}
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-fg-subtle">
          No email after a few minutes? Check your spam folder — and if it is not there,
          message the events team.
        </p>
      </div>
    </section>
  )
}
