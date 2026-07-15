import { describe, expect, it } from 'vitest'

import { formatCents, yuanToCents } from './money'

describe('money helpers', () => {
  it('formats integer cents as CNY', () => {
    expect(formatCents(1299)).toContain('12.99')
  })

  it('converts valid yuan input to cents', () => {
    expect(yuanToCents('19.90')).toBe(1990)
    expect(yuanToCents('19.999')).toBeNull()
    expect(yuanToCents('free')).toBeNull()
  })
})
