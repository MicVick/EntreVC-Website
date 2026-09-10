/* THIS FILE IS PAYLOAD BOILERPLATE — do not add logic here.
 *
 * Mounted at /api/cms (see payload.config.ts `routes.api`) rather than the
 * default /api, so it cannot shadow the public write endpoints that live in
 * app/api/ — register, contact, subscribe, ics. See CONTRACT.md §5.
 */
import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
