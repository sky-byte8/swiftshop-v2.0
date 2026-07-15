import type { Money } from '@/types'

const CURRENCY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCents(cents: Money): string {
  if (!Number.isFinite(cents)) {
    return CURRENCY_FORMATTER.format(0)
  }

  return CURRENCY_FORMATTER.format(cents / 100)
}

export function yuanToCents(value: string | number): Money | null {
  const normalized = typeof value === 'number' ? String(value) : value.trim()

  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) {
    return null
  }

  const cents = Math.round(Number(normalized) * 100)
  return Number.isSafeInteger(cents) ? cents : null
}
