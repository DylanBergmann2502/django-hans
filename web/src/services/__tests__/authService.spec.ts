// src/services/__tests__/authService.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '../authService'
import axios from '@/services/axios'
import tokenService from '@/services/tokenService'

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

const mockedAxiosPost = vi.mocked(axios.post)
const mockedAxiosGet = vi.mocked(axios.get)
const mockedTokenService = vi.mocked(tokenService)

describe('Auth Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('login should make API call and save tokens', async () => {
    const mockResponse = { data: { access: 'access-token', refresh: 'refresh-token' } }
    mockedAxiosPost.mockResolvedValue(mockResponse)

    const response = await authService.login('test@example.com', 'password')

    expect(mockedAxiosPost).toHaveBeenCalledWith('/auth/jwt/create/', {
      email: 'test@example.com',
      password: 'password',
    })
    expect(mockedTokenService.saveToken).toHaveBeenCalledWith('access-token')
    expect(mockedTokenService.saveRefreshToken).toHaveBeenCalledWith('refresh-token')
    expect(response).toEqual(mockResponse)
  })

  it('register should make API call with user data', async () => {
    const userData = { email: 'new@example.com', password: 'password' }
    const mockResponse = { data: { id: 1, email: 'new@example.com' } }
    mockedAxiosPost.mockResolvedValue(mockResponse)

    const response = await authService.register(userData)

    expect(mockedAxiosPost).toHaveBeenCalledWith('/auth/users/', userData)
    expect(response).toEqual(mockResponse)
  })

  it('logout should remove tokens', () => {
    authService.logout()

    expect(mockedTokenService.removeToken).toHaveBeenCalled()
  })

  it('getUserInfo should make API call', async () => {
    const mockResponse = { data: { id: 1, email: 'test@example.com' } }
    mockedAxiosGet.mockResolvedValue(mockResponse)

    const response = await authService.getUserInfo()

    expect(mockedAxiosGet).toHaveBeenCalledWith('/auth/users/me/')
    expect(response).toEqual(mockResponse)
  })

  it('refreshToken should make API call and save new token', async () => {
    mockedTokenService.getRefreshToken.mockReturnValue('old-refresh-token')
    const mockResponse = { data: { access: 'new-access-token', refresh: '' } }
    mockedAxiosPost.mockResolvedValue(mockResponse)

    const response = await authService.refreshToken()

    expect(mockedAxiosPost).toHaveBeenCalledWith('/auth/jwt/refresh/', {
      refresh: 'old-refresh-token',
    })
    expect(mockedTokenService.saveToken).toHaveBeenCalledWith('new-access-token')
    expect(response).toEqual(mockResponse)
  })

  it('refreshToken should throw error if no refresh token', async () => {
    mockedTokenService.getRefreshToken.mockReturnValue(null)

    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available')
    expect(mockedAxiosPost).not.toHaveBeenCalled()
  })

  it('isAuthenticated should check token validity', () => {
    mockedTokenService.hasValidToken.mockReturnValue(true)

    const result = authService.isAuthenticated()

    expect(mockedTokenService.hasValidToken).toHaveBeenCalled()
    expect(result).toBe(true)
  })
})
