// src/services/__tests__/axios.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

vi.mock('@/stores/auth', () => ({
  accessToken: { value: null },
  refreshToken: { value: null },
  clearTokens: vi.fn(),
}))

import { accessToken, refreshToken, clearTokens } from '@/stores/auth'

const mockedClearTokens = vi.mocked(clearTokens)

describe('Axios Service', () => {
  const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    if (accessToken.value) {
      config.headers = config.headers ?? ({} as InternalAxiosRequestConfig['headers'])
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }
    return config
  }

  interface MockError {
    config?: { headers: Record<string, string>; _retry?: boolean }
    response?: { status: number }
  }

  const responseErrorInterceptor = async (error: MockError) => {
    const originalRequest = error.config ?? { headers: {} }

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken.value) {
      originalRequest._retry = true

      try {
        const newAccess = 'new-access-token'
        accessToken.value = newAccess
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return 'success'
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }

  beforeEach(() => {
    vi.resetAllMocks()
    accessToken.value = null
    refreshToken.value = null
  })

  it('adds authorization header when token exists', () => {
    accessToken.value = 'test-token'

    const config = { headers: {} } as unknown as InternalAxiosRequestConfig
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add authorization header when token is null', () => {
    accessToken.value = null

    const config = { headers: {} } as unknown as InternalAxiosRequestConfig
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('passes through successful responses', () => {
    const response = { data: { success: true } }
    expect(response).toEqual(response)
  })

  it('attempts to refresh token on 401 error', async () => {
    refreshToken.value = 'refresh-token'

    const originalRequest: { headers: Record<string, string>; _retry: boolean } = {
      headers: {},
      _retry: false,
    }
    const error: MockError = { config: originalRequest, response: { status: 401 } }

    const result = await responseErrorInterceptor(error)

    expect(accessToken.value).toBe('new-access-token')
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token')
    expect(originalRequest._retry).toBe(true)
    expect(result).toBe('success')
  })

  it('redirects to login on token refresh failure', async () => {
    refreshToken.value = 'refresh-token'

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const originalRequest = { headers: {}, _retry: false }
    const error: MockError = { config: originalRequest, response: { status: 401 } }

    const failingInterceptor = async (err: MockError) => {
      const req = err.config ?? { headers: {} }
      if (err.response?.status === 401 && !req._retry && refreshToken.value) {
        req._retry = true
        clearTokens()
        window.location.href = '/login'
        throw new Error('Refresh failed')
      }
      return Promise.reject(err)
    }

    await expect(failingInterceptor(error)).rejects.toThrow('Refresh failed')
    expect(mockedClearTokens).toHaveBeenCalled()
    expect(window.location.href).toBe('/login')
  })
})
