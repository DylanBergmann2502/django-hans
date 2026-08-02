// src/services/axios.ts
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { accessToken, refreshToken, clearTokens } from '@/stores/auth'

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

axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken.value) {
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken.value) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/${apiVersion}/_allauth/app/v1/tokens/refresh`,
          { refresh_token: refreshToken.value },
        )
        const { access_token, refresh_token } = response.data.data as {
          access_token: string
          refresh_token?: string
        }
        accessToken.value = access_token
        if (refresh_token) refreshToken.value = refresh_token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
