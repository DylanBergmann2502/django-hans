// src/stores/__tests__/auth.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import type { User } from '@/types'

vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getUserInfo: vi.fn(),
  },
}))

vi.mock('@/services/tokenService', () => ({
  default: {
    hasValidToken: vi.fn(),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
    getToken: vi.fn(),
  },
}))

import authService from '@/services/authService'
import tokenService from '@/services/tokenService'

const mockedAuthService = vi.mocked(authService)
const mockedTokenService = vi.mocked(tokenService)

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with correct default state', () => {
    mockedTokenService.hasValidToken.mockReturnValue(false)
    const store = useAuthStore()

    expect(store.user).toBe(null)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('sets isAuthenticated to true when token is valid', () => {
    mockedTokenService.hasValidToken.mockReturnValue(true)
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
  })

  it('login action should set authenticated state', async () => {
    mockedTokenService.hasValidToken.mockReturnValue(false)
    mockedAuthService.login.mockResolvedValue({
      data: { access: 'token', refresh: 'refresh' },
    } as never)
    mockedAuthService.getUserInfo.mockResolvedValue({
      data: { id: 1, email: 'test@example.com' } satisfies User,
    } as never)

    const store = useAuthStore()
    await store.login('test@example.com', 'password')

    expect(mockedAuthService.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual({ id: 1, email: 'test@example.com' })
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('logout action should clear auth state', async () => {
    mockedTokenService.hasValidToken.mockReturnValue(true)
    const store = useAuthStore()
    store.user = { id: 1, email: 'test@example.com' }

    await store.logout()

    expect(mockedAuthService.logout).toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBe(null)
  })

  it('handles login failure', async () => {
    mockedTokenService.hasValidToken.mockReturnValue(false)
    const errorResponse = { response: { data: { detail: 'Invalid credentials' } } }
    mockedAuthService.login.mockRejectedValue(errorResponse)

    const store = useAuthStore()

    await expect(store.login('test@example.com', 'wrong')).rejects.toEqual(errorResponse)
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toEqual({ detail: 'Invalid credentials' })
    expect(store.loading).toBe(false)
  })
})
