// src/services/__tests__/tokenService.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import tokenService from '../tokenService'

describe('Token Service', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn(key => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      })
    }
  })()

  beforeEach(() => {
    // Set up localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Clear mock store before each test
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('gets token from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-token')

    const token = tokenService.getToken()

    expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token')
    expect(token).toBe('test-token')
  })

  it('gets refresh token from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-refresh-token')

    const token = tokenService.getRefreshToken()

    expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token')
    expect(token).toBe('test-refresh-token')
  })

  it('saves token to localStorage', () => {
    tokenService.saveToken('new-token')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-token')
  })

  it('saves refresh token to localStorage', () => {
    tokenService.saveRefreshToken('new-refresh-token')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token')
  })

  it('removes tokens from localStorage', () => {
    tokenService.removeToken()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
  })

  it('checks if token is valid', () => {
    // Test when token exists
    localStorageMock.getItem.mockReturnValueOnce('valid-token')
    expect(tokenService.hasValidToken()).toBe(true)

    // Test when token doesn't exist
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(tokenService.hasValidToken()).toBe(false)
  })
})
