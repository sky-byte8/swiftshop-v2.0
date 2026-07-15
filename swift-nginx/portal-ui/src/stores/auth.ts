import { defineStore } from 'pinia'

import { loginUser } from '@/services/auth'
import { normalizeApiError } from '@/services/api'
import type { LoginCredentials, UserSession } from '@/types'
import {
  clearAuthSession,
  getToken,
  getUserSession,
  setAuthSession,
  takeReturnUrl,
} from '@/utils/session'

interface AuthState {
  token: string | null
  user: UserSession | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getToken(),
    user: getUserSession(),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    async login(credentials: LoginCredentials): Promise<string> {
      this.loading = true
      this.error = null

      try {
        const result = await loginUser(credentials)
        setAuthSession(result)
        const { token, ...user } = result
        this.token = token
        this.user = user
        return takeReturnUrl('/')
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    logout(): void {
      clearAuthSession()
      this.token = null
      this.user = null
      this.error = null
    },
    refreshFromSession(): void {
      this.token = getToken()
      this.user = getUserSession()
    },
  },
})
