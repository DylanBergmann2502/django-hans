// src/services/tokenService.js
export default {
  getToken() {
    return localStorage.getItem('access_token')
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  },

  saveToken(token) {
    localStorage.setItem('access_token', token)
    // This will trigger storage events in other tabs
  },

  saveRefreshToken(token) {
    localStorage.setItem('refresh_token', token)
    // This will trigger storage events in other tabs
  },

  removeToken() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // This will trigger storage events in other tabs
  },

  hasValidToken() {
    return !!this.getToken()
  },
}
