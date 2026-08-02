// src/stores/__tests__/auth.spec.ts
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import type { User } from '@/types'

vi.mock('@/services/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((_, defaultValue) => ref(defaultValue)),
}))

import axiosInstance from '@/services/axios'
import { accessToken, refreshToken, clearTokens, useAuthStore } from '../auth'

const mockedPost = axiosInstance.post as Mock
const mockedDelete = axiosInstance.delete as Mock

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

  it('login sets tokens and user profile', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        data: { user: { id: 1, email: 'test@example.com' } satisfies User },
        meta: { access_token: 'access-token', refresh_token: 'refresh-token' },
      },
    })

    const store = useAuthStore()
    await store.login('test@example.com', 'password')

    expect(mockedPost).toHaveBeenCalledWith('/_allauth/app/v1/auth/login', {
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

  it('logout calls the headless session endpoint, clears tokens and resets state', async () => {
    accessToken.value = 'some-token'
    mockedDelete.mockResolvedValueOnce({})
    const store = useAuthStore()
    store.user = { id: 1, email: 'test@example.com' }

    await store.logout()

    expect(mockedDelete).toHaveBeenCalledWith('/_allauth/app/v1/auth/session')
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

  it('register calls the headless signup endpoint', async () => {
    const userData = { email: 'new@example.com', password: 'password' }
    mockedPost.mockResolvedValueOnce({
      data: {
        data: { user: { id: 2, email: 'new@example.com' } },
        meta: { access_token: 'access-token', refresh_token: 'refresh-token' },
      },
    })

    const store = useAuthStore()
    const response = await store.register(userData)

    expect(mockedPost).toHaveBeenCalledWith('/_allauth/app/v1/auth/signup', userData)
    expect(mockedDelete).not.toHaveBeenCalled()
    expect(accessToken.value).toBe(null)
    expect(refreshToken.value).toBe(null)
    expect(store.isAuthenticated).toBe(false)
    expect(response?.data.data?.user).toEqual({ id: 2, email: 'new@example.com' })
  })
})
