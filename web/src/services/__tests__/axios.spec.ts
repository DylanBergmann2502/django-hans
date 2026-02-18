// src/services/__tests__/axios.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

vi.mock('../tokenService', () => ({
  default: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
  },
}))

import tokenService from '../tokenService'

const mockedTokenService = vi.mocked(tokenService)

describe('Axios Service', () => {
  const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = mockedTokenService.getToken()
    if (token) {
      config.headers = config.headers ?? ({} as InternalAxiosRequestConfig['headers'])
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }

  interface MockError {
    config?: { headers: Record<string, string>; _retry?: boolean }
    response?: { status: number }
  }

  const responseErrorInterceptor = async (error: MockError) => {
    const originalRequest = error.config ?? { headers: {} }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      mockedTokenService.getRefreshToken()
    ) {
      originalRequest._retry = true

      try {
        const response = { data: { access: 'new-access-token' } }
        mockedTokenService.saveToken(response.data.access)
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`
        return 'success'
      } catch (refreshError) {
        mockedTokenService.removeToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('adds authorization header when token exists', () => {
    mockedTokenService.getToken.mockReturnValue('test-token')

    const config = { headers: {} } as unknown as InternalAxiosRequestConfig
    const result = requestInterceptor(config)

    expect(mockedTokenService.getToken).toHaveBeenCalled()
    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add authorization header when token does not exist', () => {
    mockedTokenService.getToken.mockReturnValue(null)

    const config = { headers: {} } as unknown as InternalAxiosRequestConfig
    const result = requestInterceptor(config)

    expect(mockedTokenService.getToken).toHaveBeenCalled()
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('passes through successful responses', () => {
    const response = { data: { success: true } }
    expect(response).toEqual(response)
  })

  it('attempts to refresh token on 401 error', async () => {
    mockedTokenService.getRefreshToken.mockReturnValue('refresh-token')

    const originalRequest: { headers: Record<string, string>; _retry: boolean } = {
      headers: {},
      _retry: false,
    }
    const error: MockError = { config: originalRequest, response: { status: 401 } }

    const result = await responseErrorInterceptor(error)

    expect(mockedTokenService.saveToken).toHaveBeenCalledWith('new-access-token')
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token')
    expect(originalRequest._retry).toBe(true)
    expect(result).toBe('success')
  })

  it('redirects to login on token refresh failure', async () => {
    mockedTokenService.getRefreshToken.mockReturnValue('refresh-token')

    const originalHref = window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: originalHref },
      writable: true,
    })

    const originalRequest = { headers: {}, _retry: false }
    const error: MockError = { config: originalRequest, response: { status: 401 } }

    const testInterceptor = async (err: MockError) => {
      const req = err.config ?? { headers: {} }
      if (err.response?.status === 401 && !req._retry && mockedTokenService.getRefreshToken()) {
        req._retry = true
        mockedTokenService.removeToken()
        window.location.href = '/login'
        throw new Error('Refresh failed')
      }
      return Promise.reject(err)
    }

    await expect(testInterceptor(error)).rejects.toThrow('Refresh failed')
    expect(mockedTokenService.removeToken).toHaveBeenCalled()
    expect(window.location.href).toBe('/login')

    window.location.href = originalHref
  })
})
