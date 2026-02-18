// src/stores/__tests__/auth.spec.ts
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { User } from '@/types'

vi.mock('@/services/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((_, defaultValue) => ({ value: defaultValue })),
}))

import axiosInstance from '@/services/axios'
import { accessToken, refreshToken, clearTokens, useAuthStore } from '../auth'

const mockedPost = axiosInstance.post as Mock
const mockedGet = axiosInstance.get as Mock

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    accessToken.value = null
    refreshToken.value = null
  })

  it('initializes with unauthenticated state when no token', () => {
    accessToken.value = null
    const store = useAuthStore()

    expect(store.user).toBe(null)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('initializes as authenticated when token exists', () => {
    accessToken.value = 'existing-token'
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
  })

  it('login sets tokens and fetches user profile', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { access: 'access-token', refresh: 'refresh-token' },
    })
    mockedGet.mockResolvedValueOnce({
      data: { id: 1, email: 'test@example.com' } satisfies User,
    })

    const store = useAuthStore()
    await store.login('test@example.com', 'password')

    expect(mockedPost).toHaveBeenCalledWith('/auth/jwt/create/', {
      email: 'test@example.com',
      password: 'password',
    })
    expect(accessToken.value).toBe('access-token')
    expect(refreshToken.value).toBe('refresh-token')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual({ id: 1, email: 'test@example.com' })
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('logout clears tokens and resets state', async () => {
    accessToken.value = 'some-token'
    const store = useAuthStore()
    store.user = { id: 1, email: 'test@example.com' }

    await store.logout()

    expect(accessToken.value).toBe(null)
    expect(refreshToken.value).toBe(null)
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBe(null)
  })

  it('clearTokens helper clears both tokens', () => {
    accessToken.value = 'access'
    refreshToken.value = 'refresh'

    clearTokens()

    expect(accessToken.value).toBe(null)
    expect(refreshToken.value).toBe(null)
  })

  it('handles login failure and sets error state', async () => {
    const errorResponse = { response: { data: { detail: 'Invalid credentials' } } }
    mockedPost.mockRejectedValue(errorResponse)

    const store = useAuthStore()

    await expect(store.login('test@example.com', 'wrong')).rejects.toEqual(errorResponse)
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toEqual({ detail: 'Invalid credentials' })
    expect(store.loading).toBe(false)
  })

  it('register calls POST /auth/users/', async () => {
    const userData = { email: 'new@example.com', password: 'password' }
    mockedPost.mockResolvedValueOnce({ data: { id: 2, email: 'new@example.com' } })

    const store = useAuthStore()
    const response = await store.register(userData)

    expect(mockedPost).toHaveBeenCalledWith('/auth/users/', userData)
    expect(response?.data).toEqual({ id: 2, email: 'new@example.com' })
  })
})
