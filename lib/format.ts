import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { isSameDay } from 'date-fns'

import { IST_TIMEZONE } from '@/lib/schemas'

const INVALID_DATE_LABEL = 'Date unavailable'

function validDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateInIST(value: string): string {
  const date = validDate(value)
  return date ? formatInTimeZone(date, IST_TIMEZONE, 'd MMMM yyyy') : INVALID_DATE_LABEL
}

export function formatShortDateInIST(value: string): string {
  const date = validDate(value)
  return date ? formatInTimeZone(date, IST_TIMEZONE, 'd MMM yyyy') : INVALID_DATE_LABEL
}

export function formatTimeInIST(value: string): string {
  const date = validDate(value)
  return date ? `${formatInTimeZone(date, IST_TIMEZONE, 'h:mm a')} IST` : INVALID_DATE_LABEL
}

export function formatDateTimeInIST(value: string): string {
  const date = validDate(value)
  return date
    ? `${formatInTimeZone(date, IST_TIMEZONE, 'EEEE, d MMMM yyyy · h:mm a')} IST`
    : INVALID_DATE_LABEL
}

export function formatDateRangeInIST(start: string, end: string): string {
  const startDate = validDate(start)
  const endDate = validDate(end)

  if (!startDate || !endDate) return INVALID_DATE_LABEL

  const zonedStart = toZonedTime(startDate, IST_TIMEZONE)
  const zonedEnd = toZonedTime(endDate, IST_TIMEZONE)

  if (isSameDay(zonedStart, zonedEnd)) {
    return `${formatInTimeZone(startDate, IST_TIMEZONE, 'd MMM yyyy')} · ${formatInTimeZone(startDate, IST_TIMEZONE, 'h:mm a')}–${formatInTimeZone(endDate, IST_TIMEZONE, 'h:mm a')} IST`
  }

  return `${formatInTimeZone(startDate, IST_TIMEZONE, 'd MMM, h:mm a')} – ${formatInTimeZone(endDate, IST_TIMEZONE, 'd MMM yyyy, h:mm a')} IST`
}

/** Convert a date entered as local IST into the UTC ISO string expected by the CMS. */
export function istToUtcIso(value: string): string | null {
  const date = fromZonedTime(value, IST_TIMEZONE)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
