// src/stores/auth.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import tokenService from '@/services/tokenService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: tokenService.hasValidToken(),
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        await authService.login(email, password)
        this.isAuthenticated = true
        await this.fetchUserProfile()
      } catch (error) {
        this.error = error.response?.data || { detail: 'Login failed' }
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        return await authService.register(userData)
      } catch (error) {
        this.error = error.response?.data || { detail: 'Registration failed' }
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      authService.logout()
      this.user = null
      this.isAuthenticated = false
    },

    async fetchUserProfile() {
      if (!this.isAuthenticated) return

      this.loading = true
      try {
        const response = await authService.getUserInfo()
        this.user = response.data
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },

    async initialize() {
      // Set up storage event listener for cross-tab synchronization
      window.addEventListener('storage', this.handleStorageChange)

      if (this.isAuthenticated) {
        await this.fetchUserProfile()
      }
    },

    // Handle storage events from other tabs
    handleStorageChange(event) {
      // If tokens were removed in another tab (logout)
      if (event.key === 'access_token' && !event.newValue) {
        this.user = null
        this.isAuthenticated = false
      }

      // If tokens were added in another tab (login)
      if (event.key === 'access_token' && event.newValue && !this.isAuthenticated) {
        this.isAuthenticated = true
        this.fetchUserProfile()
      }
    },

    // Method to clean up event listeners
    clearListeners() {
      window.removeEventListener('storage', this.handleStorageChange)
    }
  },
})
