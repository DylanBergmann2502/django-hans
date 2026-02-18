// src/stores/auth.ts
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import axiosInstance from '@/services/axios'
import type { User, TokenResponse, ApiError } from '@/types'

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
      const response = await axiosInstance.post<TokenResponse>('/auth/jwt/create/', {
        email,
        password,
      })
      accessToken.value = response.data.access
      refreshToken.value = response.data.refresh
      isAuthenticated.value = true
      await fetchUserProfile()
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
      return await axiosInstance.post<User>('/auth/users/', userData)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ApiError } }
      error.value = axiosError.response?.data ?? { detail: 'Registration failed' }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    clearTokens()
    user.value = null
    isAuthenticated.value = false
  }

  async function fetchUserProfile() {
    if (!isAuthenticated.value) return

    loading.value = true
    try {
      const response = await axiosInstance.get<User>('/auth/users/me/')
      user.value = response.data
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
