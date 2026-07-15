import type { LoginResult, UserSession } from '@/types'
import { normalizeId } from '@/utils/id'

export const SESSION_KEYS = {
  token: 'token',
  user: 'user-info',
  returnUrl: 'return-url',
} as const

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function getToken(): string | null {
  const token = storage()?.getItem(SESSION_KEYS.token)?.trim()
  return token || null
}

export function getUserSession(): UserSession | null {
  const value = parseJson<Record<string, unknown>>(storage()?.getItem(SESSION_KEYS.user) ?? null)

  if (!value || typeof value.username !== 'string') {
    return null
  }

  try {
    return {
      userId: normalizeId(value.userId, 'userId'),
      username: value.username,
      balance: Number(value.balance ?? 0),
    }
  } catch {
    return null
  }
}

export function setAuthSession(result: LoginResult): void {
  const { token, ...user } = result
  const target = storage()

  target?.setItem(SESSION_KEYS.token, token)
  target?.setItem(SESSION_KEYS.user, JSON.stringify(user))
}

export function clearAuthSession(): void {
  const target = storage()
  target?.removeItem(SESSION_KEYS.token)
  target?.removeItem(SESSION_KEYS.user)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && getUserSession())
}

export function normalizeReturnUrl(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback
  }

  const base = typeof window === 'undefined' ? 'http://localhost' : window.location.origin

  try {
    const url = new URL(value, base)
    if (url.origin !== base) {
      return fallback
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function setReturnUrl(value: string): void {
  storage()?.setItem(SESSION_KEYS.returnUrl, normalizeReturnUrl(value))
}

export function getReturnUrl(): string | null {
  const raw = storage()?.getItem(SESSION_KEYS.returnUrl) ?? null
  if (!raw) {
    return null
  }

  const legacyValue = parseJson<unknown>(raw)
  return normalizeReturnUrl(typeof legacyValue === 'string' ? legacyValue : raw)
}

export function takeReturnUrl(fallback = '/'): string {
  const target = storage()
  const returnUrl = getReturnUrl() ?? fallback
  target?.removeItem(SESSION_KEYS.returnUrl)
  return normalizeReturnUrl(returnUrl, fallback)
}

export function getCurrentReturnUrl(routeFullPath?: string): string {
  if (routeFullPath) {
    return normalizeReturnUrl(routeFullPath)
  }

  if (typeof window === 'undefined') {
    return '/'
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}
