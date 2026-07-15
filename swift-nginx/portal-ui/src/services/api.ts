import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import JSONbigFactory from 'json-bigint'

import { ApiError } from '@/types'
import { clearAuthSession, getToken } from '@/utils/session'

type UnauthorizedHandler = () => void | Promise<void>

const JSONbig = JSONbigFactory({ storeAsString: true })
let unauthorizedHandler: UnauthorizedHandler | null = null

export function parseJsonPreservingIds(data: unknown): unknown {
  if (typeof data !== 'string' || data.trim() === '') {
    return data
  }

  try {
    return JSONbig.parse(data) as unknown
  } catch {
    return data
  }
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  paramsSerializer: { indexes: null },
  transformResponse: [parseJsonPreservingIds],
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()

  if (token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('authorization', token)
    config.headers = headers
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeApiError(error)

    if (normalized.status === 401) {
      clearAuthSession()
      await unauthorizedHandler?.()
    }

    return Promise.reject(normalized)
  },
)

export function configureUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

function errorPayload(value: unknown): { code?: number | string; message?: string } {
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? { message: value } : {}
  }

  const record = value as Record<string, unknown>
  const code = typeof record.code === 'number' || typeof record.code === 'string' ? record.code : undefined
  const messageValue = record.msg ?? record.message
  const message = typeof messageValue === 'string' ? messageValue : undefined
  return { code, message }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>
    const payload = errorPayload(axiosError.response?.data)
    const message = payload.message
      ?? (axiosError.code === AxiosError.ETIMEDOUT ? '请求超时，请稍后重试' : undefined)
      ?? (axiosError.response ? '请求失败，请稍后重试' : '网络连接失败，请检查网络')

    return new ApiError(message, {
      status: axiosError.response?.status,
      code: payload.code ?? axiosError.code,
      details: axiosError.response?.data,
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { cause: error })
  }

  return new ApiError('发生未知错误', { details: error })
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config)
  return response.data
}
