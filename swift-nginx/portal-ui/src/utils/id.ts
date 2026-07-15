import type { Identifier } from '@/types'

export function normalizeId(value: unknown, field = 'id'): Identifier {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return String(value)
  }

  throw new TypeError(`${field} must be a valid identifier`)
}

export function normalizeOptionalId(value: unknown): Identifier | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return normalizeId(value)
}
