import type { LoginCredentials, LoginResult } from '@/types'
import { apiRequest } from './api'
import { normalizeLoginResult } from './normalizers'

export async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    url: '/users/login',
    data: {
      username: credentials.username.trim(),
      password: credentials.password,
      rememberMe: credentials.rememberMe ?? false,
    },
  })
  return normalizeLoginResult(response)
}
