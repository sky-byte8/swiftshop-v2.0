import { describe, expect, it } from 'vitest'

import {
  SESSION_KEYS,
  getReturnUrl,
  getUserSession,
  normalizeReturnUrl,
  setAuthSession,
  takeReturnUrl,
} from './session'

describe('session helpers', () => {
  it('stores auth data under the legacy-compatible keys', () => {
    setAuthSession({ token: 'jwt', userId: '1901849567409209344', username: 'swift', balance: 8000 })

    expect(sessionStorage.getItem(SESSION_KEYS.token)).toBe('jwt')
    expect(getUserSession()?.userId).toBe('1901849567409209344')
  })

  it('reads the old JSON-encoded return URL and consumes it', () => {
    sessionStorage.setItem(SESSION_KEYS.returnUrl, JSON.stringify('/cart.html?from=legacy'))

    expect(getReturnUrl()).toBe('/cart.html?from=legacy')
    expect(takeReturnUrl()).toBe('/cart.html?from=legacy')
    expect(sessionStorage.getItem(SESSION_KEYS.returnUrl)).toBeNull()
  })

  it('rejects cross-origin return URLs', () => {
    expect(normalizeReturnUrl('https://example.com/steal')).toBe('/')
  })
})
