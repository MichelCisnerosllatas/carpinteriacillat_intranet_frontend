// src/features/auth/storage/auth.storage.ts
// Junta en un solo lugar: tokens (TokenStorage) + sesión (AuthSessionStorage).
import { TokenStorage } from './token.storage'
import { AuthSessionStorage } from './session.storage'
import type { AuthSession } from '@/features/auth/model/session.type'
import { CookieStorage } from '@/shared/config/cookie.storage'
import { ActiveBranchStorage } from './active-branch.storage'

export const AuthStorage = {
  // Paso 1 del login: guardar los tokens (el access_token también va a la cookie).
  saveTokens: (accessToken: string, refreshToken: string | null) => {
    TokenStorage.clearTokens()
    TokenStorage.setAccessToken(accessToken)
    // Con Google no hay refresh_token
    if (refreshToken) TokenStorage.setRefreshToken(refreshToken)
  },

  // Paso 2 del login (y cada verify): guardar la sesión.
  saveSession: (session: AuthSession) => {
    AuthSessionStorage.set(session)
  },

  getSession: () => {
    return {
      accessToken: TokenStorage.getAccessToken(),
      refreshToken: TokenStorage.getRefreshToken(),
      session: AuthSessionStorage.get(),
    }
  },

  clearSession: () => {
    TokenStorage.clearTokens()
    // Borra la cookie antigua 'auth_role' por si quedó de una sesión anterior.
    CookieStorage.remove('auth_role')
    ActiveBranchStorage.clear()
    AuthSessionStorage.clear()
  },
}
