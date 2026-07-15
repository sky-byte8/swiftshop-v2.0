import { describe, expect, it } from 'vitest'

import { parseSpec } from './spec'

describe('product spec parser', () => {
  it('normalizes primitive values to display strings', () => {
    expect(parseSpec('{"颜色":"黑色","容量":256,"现货":true}')).toEqual({
      颜色: '黑色',
      容量: '256',
      现货: 'true',
    })
  })

  it('returns an empty object for malformed or non-object JSON', () => {
    expect(parseSpec('not-json')).toEqual({})
    expect(parseSpec('["black"]')).toEqual({})
  })
})
