// src/stores/__tests__/auth.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Mock the services
vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getUserInfo: vi.fn(),
  }
}))

vi.mock('@/services/tokenService', () => ({
  default: {
    hasValidToken: vi.fn(),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
    getToken: vi.fn(),
  }
}))

import authService from '@/services/authService'
import tokenService from '@/services/tokenService'

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())

    // Reset mocks
    vi.resetAllMocks()
  })

  it('initializes with correct default state', () => {
    tokenService.hasValidToken.mockReturnValue(false)
    const store = useAuthStore()

    expect(store.user).toBe(null)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('sets isAuthenticated to true when token is valid', () => {
    tokenService.hasValidToken.mockReturnValue(true)
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
  })

  it('login action should set authenticated state', async () => {
    tokenService.hasValidToken.mockReturnValue(false)
    authService.login.mockResolvedValue({ data: { access: 'token', refresh: 'refresh' } })
    authService.getUserInfo.mockResolvedValue({ data: { email: 'test@example.com' } })

    const store = useAuthStore()
    await store.login('test@example.com', 'password')

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual({ email: 'test@example.com' })
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('logout action should clear auth state', async () => {
    tokenService.hasValidToken.mockReturnValue(true)
    const store = useAuthStore()
    store.user = { email: 'test@example.com' }

    await store.logout()

    expect(authService.logout).toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBe(null)
  })

  it('handles login failure', async () => {
    tokenService.hasValidToken.mockReturnValue(false)
    const errorResponse = { response: { data: { detail: 'Invalid credentials' } } }
    authService.login.mockRejectedValue(errorResponse)

    const store = useAuthStore()

    await expect(store.login('test@example.com', 'wrong')).rejects.toEqual(errorResponse)
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toEqual({ detail: 'Invalid credentials' })
    expect(store.loading).toBe(false)
  })
})
