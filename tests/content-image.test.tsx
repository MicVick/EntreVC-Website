// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ContentImage } from '@/components/public/content-image'

afterEach(cleanup)

describe('content image recovery', () => {
  it('gives an absent portrait an accessible illustrated placeholder', () => {
    render(<ContentImage image={null} kind="person" label="Campus Builder" sizes="64px" />)
    expect(screen.getByRole('img', { name: 'Portrait placeholder for Campus Builder' }).getAttribute('data-image-fallback')).toBe('person')
  })

  it('replaces a legacy seed placeholder before requesting the image', () => {
    const { container } = render(<ContentImage image={{ url: '/seed.webp', alt: 'Placeholder: old event image', width: 1200, height: 675 }} kind="event" label="Demo Day" sizes="100vw" />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Image placeholder for Demo Day' })).toBeTruthy()
  })

  it('recovers from a failed upload and shows a replacement when its URL changes', () => {
    const image = { url: '/missing-upload.webp', alt: 'Demo Day on campus', width: 1200, height: 675 }
    const { rerender } = render(<ContentImage image={image} kind="event" label="Demo Day" sizes="100vw" />)
    fireEvent.error(screen.getByRole('img', { name: image.alt }))
    expect(screen.getByRole('img', { name: 'Image placeholder for Demo Day' })).toBeTruthy()
    rerender(<ContentImage image={{ ...image, url: '/replacement.webp' }} kind="event" label="Demo Day" sizes="100vw" />)
    expect(screen.getByRole('img', { name: image.alt }).getAttribute('src')).toContain('replacement.webp')
  })
})
