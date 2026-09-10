import type { Field, FieldHook } from 'payload'

/**
 * Turn a title into a URL-safe slug: lowercase, ASCII, hyphen-separated.
 * Must agree with `slugSchema` in lib/schemas/common.ts.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Auto-fill the slug from a source field, but leave it editable.
 *
 * Generating only when empty matters: a published event's URL has already been shared
 * into WhatsApp groups, and silently regenerating the slug when someone fixes a typo in
 * the title would break every one of those links.
 */
const formatSlug =
  (fallbackFrom: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    if (operation === 'create' || !value) {
      const fallback = data?.[fallbackFrom]
      if (typeof fallback === 'string' && fallback.length > 0) return slugify(fallback)
    }
    return value
  }

export function slugField(fallbackFrom = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description:
        'The web address for this page. Filled in from the title automatically. Once the page has been shared, changing this breaks every existing link — so avoid editing it after publishing.',
    },
    hooks: {
      beforeValidate: [formatSlug(fallbackFrom)],
    },
  }
}
