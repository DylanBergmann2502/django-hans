// src/services/authService.ts
import axios from '@/services/axios'
import tokenService from '@/services/tokenService'
import type { User, TokenResponse } from '@/types'

export interface RegisterData {
  email: string
  password: string
  [key: string]: string
}

const authService = {
  async login(email: string, password: string) {
    const response = await axios.post<TokenResponse>('/auth/jwt/create/', { email, password })
    const { access, refresh } = response.data
    tokenService.saveToken(access)
    tokenService.saveRefreshToken(refresh)
    return response
  },

  async register(userData: RegisterData) {
    return axios.post<User>('/auth/users/', userData)
  },

  logout(): void {
    tokenService.removeToken()
  },

  async getUserInfo() {
    return axios.get<User>('/auth/users/me/')
  },

  async refreshToken() {
    const refreshToken = tokenService.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post<TokenResponse>('/auth/jwt/refresh/', {
        refresh: refreshToken,
      })
      tokenService.saveToken(response.data.access)
      return response
    } catch (error) {
      tokenService.removeToken()
      throw error
    }
  },

  isAuthenticated(): boolean {
    return tokenService.hasValidToken()
  },
}

export default authService
