// src/services/tokenService.ts
const tokenService = {
  getToken(): string | null {
    return localStorage.getItem('access_token')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  },

  saveToken(token: string): void {
    localStorage.setItem('access_token', token)
  },

  saveRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token)
  },

  removeToken(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  hasValidToken(): boolean {
    return !!this.getToken()
  },
}

export default tokenService
