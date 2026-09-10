/**
 * The envelope every public endpoint returns (CONTRACT.md §5).
 *
 * Agent B renders `fieldErrors` inline against react-hook-form and `error` as a
 * form-level message. `code` lets the UI pick a specific treatment — a duplicate
 * registration gets a resend link, a closed one hides the form entirely — without
 * string-matching the message.
 */

export const actionErrorCodes = [
  /** Validation failed. `fieldErrors` is populated. */
  'INVALID',
  /** Already registered for this event / already subscribed. */
  'DUPLICATE',
  /** Past the registration deadline, or registration disabled. */
  'CLOSED',
  /** At capacity and the waitlist is not available. */
  'FULL',
  'RATE_LIMITED',
  'NOT_FOUND',
  'SERVER_ERROR',
] as const

export type ActionErrorCode = (typeof actionErrorCodes)[number]

export type ActionSuccess<T> = { ok: true; data: T }

export type ActionFailure = {
  ok: false
  error: string
  code: ActionErrorCode
  fieldErrors?: Record<string, string[]>
}

export type ActionResult<T> = ActionSuccess<T> | ActionFailure

export function actionOk<T>(data: T): ActionSuccess<T> {
  return { ok: true, data }
}

export function actionFail(
  code: ActionErrorCode,
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionFailure {
  return fieldErrors ? { ok: false, code, error, fieldErrors } : { ok: false, code, error }
}

/** Copy shown when an endpoint fails. Kept in one place so wording stays consistent. */
export const actionErrorMessages: Record<ActionErrorCode, string> = {
  INVALID: 'Please check the highlighted fields and try again.',
  DUPLICATE: "You're already registered — check your inbox.",
  CLOSED: 'Registrations for this event have closed.',
  FULL: 'This event is full.',
  RATE_LIMITED: 'Too many attempts. Please wait a minute and try again.',
  NOT_FOUND: 'We could not find that.',
  SERVER_ERROR: 'Something went wrong at our end. Please try again in a moment.',
}
