// src/services/__tests__/authService.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '../authService'
import axios from '@/services/axios'
import tokenService from '@/services/tokenService'

// Mock dependencies
vi.mock('@/services/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/services/tokenService', () => ({
  default: {
    saveToken: vi.fn(),
    saveRefreshToken: vi.fn(),
    removeToken: vi.fn(),
    getRefreshToken: vi.fn(),
    hasValidToken: vi.fn(),
  },
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('login should make API call and save tokens', async () => {
    const mockResponse = { data: { access: 'access-token', refresh: 'refresh-token' } }
    axios.post.mockResolvedValue(mockResponse)

    const response = await authService.login('test@example.com', 'password')

    expect(axios.post).toHaveBeenCalledWith('/auth/jwt/create/', {
      email: 'test@example.com',
      password: 'password',
    })
    expect(tokenService.saveToken).toHaveBeenCalledWith('access-token')
    expect(tokenService.saveRefreshToken).toHaveBeenCalledWith('refresh-token')
    expect(response).toEqual(mockResponse)
  })

  it('register should make API call with user data', async () => {
    const userData = { email: 'new@example.com', password: 'password' }
    const mockResponse = { data: { id: 1, email: 'new@example.com' } }
    axios.post.mockResolvedValue(mockResponse)

    const response = await authService.register(userData)

    expect(axios.post).toHaveBeenCalledWith('/auth/users/', userData)
    expect(response).toEqual(mockResponse)
  })

  it('logout should remove tokens', async () => {
    await authService.logout()

    expect(tokenService.removeToken).toHaveBeenCalled()
  })

  it('getUserInfo should make API call', async () => {
    const mockResponse = { data: { id: 1, email: 'test@example.com' } }
    axios.get.mockResolvedValue(mockResponse)

    const response = await authService.getUserInfo()

    expect(axios.get).toHaveBeenCalledWith('/auth/users/me/')
    expect(response).toEqual(mockResponse)
  })

  it('refreshToken should make API call and save new token', async () => {
    tokenService.getRefreshToken.mockReturnValue('old-refresh-token')
    const mockResponse = { data: { access: 'new-access-token' } }
    axios.post.mockResolvedValue(mockResponse)

    const response = await authService.refreshToken()

    expect(axios.post).toHaveBeenCalledWith('/auth/jwt/refresh/', {
      refresh: 'old-refresh-token',
    })
    expect(tokenService.saveToken).toHaveBeenCalledWith('new-access-token')
    expect(response).toEqual(mockResponse)
  })

  it('refreshToken should throw error if no refresh token', async () => {
    tokenService.getRefreshToken.mockReturnValue(null)

    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available')
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('isAuthenticated should check token validity', () => {
    tokenService.hasValidToken.mockReturnValue(true)

    const result = authService.isAuthenticated()

    expect(tokenService.hasValidToken).toHaveBeenCalled()
    expect(result).toBe(true)
  })
})
