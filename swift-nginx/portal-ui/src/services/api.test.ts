import { describe, expect, it } from 'vitest'

import { normalizeApiError, parseJsonPreservingIds } from './api'

describe('API utilities', () => {
  it('parses unsafe JSON integers as exact strings', () => {
    expect(parseJsonPreservingIds('{"id":1901849567409209344,"price":1299}')).toEqual({
      id: '1901849567409209344',
      price: 1299,
    })
  })

  it('uses the backend message when normalizing an Axios error', () => {
    const error = normalizeApiError({
      isAxiosError: true,
      response: { status: 400, data: { code: 400, msg: '库存不足' } },
    })

    expect(error.message).toBe('库存不足')
    expect(error.status).toBe(400)
    expect(error.code).toBe(400)
  })
})
