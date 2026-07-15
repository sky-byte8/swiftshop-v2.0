import { afterEach, beforeEach, vi } from 'vitest'

import { configureUnauthorizedHandler } from '@/services/api'

beforeEach(() => {
  window.sessionStorage.clear()
  window.scrollTo = vi.fn()
})

afterEach(() => {
  configureUnauthorizedHandler(null)
})
