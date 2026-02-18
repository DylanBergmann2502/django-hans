// src/stores/auth.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import authService, { type RegisterData } from '@/services/authService'
import tokenService from '@/services/tokenService'
import type { User, ApiError } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const isAuthenticated = ref(tokenService.hasValidToken())

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      await authService.login(email, password)
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
      return await authService.register(userData)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ApiError } }
      error.value = axiosError.response?.data ?? { detail: 'Registration failed' }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    authService.logout()
    user.value = null
    isAuthenticated.value = false
  }

  async function fetchUserProfile() {
    if (!isAuthenticated.value) return

    loading.value = true
    try {
      const response = await authService.getUserInfo()
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

  function handleStorageChange(event: StorageEvent) {
    if (event.key === 'access_token' && !event.newValue) {
      user.value = null
      isAuthenticated.value = false
    }
    if (event.key === 'access_token' && event.newValue && !isAuthenticated.value) {
      isAuthenticated.value = true
      fetchUserProfile()
    }
  }

  async function initialize() {
    window.addEventListener('storage', handleStorageChange)
    if (isAuthenticated.value) {
      await fetchUserProfile()
    }
  }

  function clearListeners() {
    window.removeEventListener('storage', handleStorageChange)
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
    clearListeners,
  }
})
