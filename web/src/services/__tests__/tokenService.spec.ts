// src/services/__tests__/tokenService.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import tokenService from '../tokenService'

describe('Token Service', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
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
    localStorageMock.getItem.mockReturnValueOnce('valid-token')
    expect(tokenService.hasValidToken()).toBe(true)

    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(tokenService.hasValidToken()).toBe(false)
  })
})
