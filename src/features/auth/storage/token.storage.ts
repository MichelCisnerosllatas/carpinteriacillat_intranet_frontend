// src/feature/auth/storage/token.storage.ts
import { CookieStorage } from '@/shared/config/cookie.storage'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const TokenStorage = {
  getAccessToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setAccessToken(token: string) {
    if (typeof window === 'undefined') return

    localStorage.setItem(ACCESS_TOKEN_KEY, token)

    // Cookie usada por middleware
    CookieStorage.set(ACCESS_TOKEN_KEY, token)
  },

  setRefreshToken(token: string) {
    if (typeof window === 'undefined') return

    localStorage.setItem(REFRESH_TOKEN_KEY, token)

    // No recomiendo guardar refresh_token en cookie JS
  },

  clearTokens() {
    if (typeof window === 'undefined') return

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)

    CookieStorage.remove(ACCESS_TOKEN_KEY)
  },
}