// src/stores/auth.ts
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import axiosInstance from '@/services/axios'
import type { AuthResponse, User, ApiError } from '@/types'

export interface RegisterData {
  email: string
  password: string
  [key: string]: string
}

// Reactive token refs backed by localStorage — shared with axios interceptors
export const accessToken = useStorage<string | null>('access_token', null)
export const refreshToken = useStorage<string | null>('refresh_token', null)

export function clearTokens() {
  accessToken.value = null
  refreshToken.value = null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const isAuthenticated = ref(!!accessToken.value)

  // Keep isAuthenticated in sync with the token — handles cross-tab logout/login
  watch(accessToken, (token) => {
    if (!token) {
      user.value = null
      isAuthenticated.value = false
    } else if (!isAuthenticated.value) {
      isAuthenticated.value = true
      fetchUserProfile()
    }
  })

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post<AuthResponse>('/_allauth/app/v1/auth/login', {
        email,
        password,
      })
      const meta = response.data.meta
      if (!meta?.access_token || !meta.refresh_token) {
        throw new Error('Authentication response did not contain JWT tokens')
      }
      accessToken.value = meta.access_token
      refreshToken.value = meta.refresh_token
      isAuthenticated.value = true
      user.value = response.data.data?.user ?? null
      if (!user.value) await fetchUserProfile()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ApiError } }
      error.value = axiosError.response?.data ?? { detail: 'Login failed' }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData: RegisterData) {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/_allauth/app/v1/auth/signup',
        userData,
      )
      // allauth completes signup by logging the user in. The frontend owns
      // the UX decision, so discard that response's JWT pair and let the
      // explicit login flow create the session we actually use.
      clearTokens()
      user.value = null
      isAuthenticated.value = false
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ApiError } }
      error.value = axiosError.response?.data ?? { detail: 'Registration failed' }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await axiosInstance.delete('/_allauth/app/v1/auth/session')
    } catch {
      // best-effort — clear locally regardless
    }
    clearTokens()
    user.value = null
    isAuthenticated.value = false
  }

  async function fetchUserProfile() {
    if (!isAuthenticated.value) return

    loading.value = true
    try {
      const response = await axiosInstance.get<AuthResponse>('/_allauth/app/v1/auth/session')
      user.value = response.data.data?.user ?? null
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number } }
      if (axiosError.response?.status === 401) {
        await logout()
      }
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    if (isAuthenticated.value) {
      await fetchUserProfile()
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUserProfile,
    initialize,
  }
})
