// src/services/axios.ts
import axios, { type InternalAxiosRequestConfig } from 'axios'
import tokenService from '@/services/tokenService'

// Extend axios config to support our retry flag
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const apiVersion = 'v1'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${apiVersion}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor for adding the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      tokenService.getRefreshToken()
    ) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/${apiVersion}/auth/jwt/refresh/`,
          { refresh: tokenService.getRefreshToken() },
        )

        const { access } = response.data as { access: string }
        tokenService.saveToken(access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        tokenService.removeToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
