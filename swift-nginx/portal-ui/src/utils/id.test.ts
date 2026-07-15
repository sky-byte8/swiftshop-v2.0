import { describe, expect, it } from 'vitest'

import { normalizeId, normalizeOptionalId } from './id'

describe('identifier normalization', () => {
  it('keeps long identifiers as strings', () => {
    expect(normalizeId('1901849567409209344')).toBe('1901849567409209344')
    expect(normalizeId(42n)).toBe('42')
  })

  it('rejects empty identifiers', () => {
    expect(() => normalizeId('')).toThrow(TypeError)
    expect(() => normalizeId(Number.MAX_SAFE_INTEGER + 1)).toThrow(TypeError)
    expect(normalizeOptionalId(null)).toBeUndefined()
  })
})
