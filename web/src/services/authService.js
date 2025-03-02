// src/services/authService.js
import axios from '@/services/axios'
import tokenService from '@/services/tokenService'

export default {
  async login(email, password) {
    const response = await axios.post('/auth/jwt/create/', {
      email,
      password,
    })

    const { access, refresh } = response.data
    tokenService.saveToken(access)
    tokenService.saveRefreshToken(refresh)

    return response
  },

  async register(userData) {
    return axios.post('/auth/users/', userData)
  },

  async logout() {
    tokenService.removeToken()
  },

  async getUserInfo() {
    return axios.get('/auth/users/me/')
  },

  async refreshToken() {
    try {
      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post('/auth/jwt/refresh/', {
        refresh: refreshToken,
      })

      tokenService.saveToken(response.data.access)
      return response
    } catch (error) {
      tokenService.removeToken()
      throw error
    }
  },

  isAuthenticated() {
    return tokenService.hasValidToken()
  },
}
