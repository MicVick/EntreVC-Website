import { describe, expect, it } from 'vitest'

import { clubStorySchema, splitFigure } from '@/lib/schemas'

describe('splitFigure', () => {
  it('separates a whole number from the text around it, so it can count up', () => {
    expect(splitFigure('15+')).toEqual({ prefix: '', value: 15, suffix: '+' })
    expect(splitFigure('2K+')).toEqual({ prefix: '', value: 2, suffix: 'K+' })
    expect(splitFigure('$24 Bn+')).toEqual({ prefix: '$', value: 24, suffix: ' Bn+' })
    expect(splitFigure('4')).toEqual({ prefix: '', value: 4, suffix: '' })
  })

  it('leaves figures with separators, decimals or no digits to display as written', () => {
    expect(splitFigure('1,300+').value).toBeNull()
    expect(splitFigure('2.5K').value).toBeNull()
    expect(splitFigure('Award').value).toBeNull()
    expect(splitFigure('1,300+').suffix).toBe('1,300+')
  })
})

describe('clubStorySchema', () => {
  it('accepts an empty story, which hides every section', () => {
    const empty = {
      pillars: [],
      highlights: { yearLabel: null, stats: [], flagships: [], otherEvents: [] },
      founderWall: { stats: [], companies: [], source: null },
      roadmap: { yearLabel: null, phases: [] },
    }
    expect(clubStorySchema.safeParse(empty).success).toBe(true)
  })

  it('rejects a founder-wall company without founders', () => {
    const story = {
      pillars: [],
      highlights: { yearLabel: null, stats: [], flagships: [], otherEvents: [] },
      founderWall: { stats: [], companies: [{ name: 'Nykaa', founders: '', description: null, foundedYear: 2012 }], source: null },
      roadmap: { yearLabel: null, phases: [] },
    }
    expect(clubStorySchema.safeParse(story).success).toBe(false)
  })
})
