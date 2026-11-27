// src/features/auth/storage/session.storage.ts
// Guarda "la sesión" (respuesta de GET verify) en localStorage.
import type { AuthSession } from '@/features/auth/model/session.type'

const SESSION_KEY = 'auth_user'
const isBrowser = (): boolean => typeof window !== 'undefined'

// ¿Tiene la forma nueva? (user.role.permissions)
// Las sesiones guardadas antes del cambio de formato (role/permissions sueltos)
// no la tienen: se consideran inválidas y el usuario vuelve a iniciar sesión.
const isValidSession = (data: any): boolean => {
  return Array.isArray(data?.user?.role?.permissions)
}

export const AuthSessionStorage = {
  set: (session: AuthSession): void => {
    if (!isBrowser()) return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },

  // Devuelve null si no hay sesión, si está dañada o si tiene la forma vieja.
  get: (): AuthSession | null => {
    if (!isBrowser()) return null

    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    try {
      const data = JSON.parse(raw)
      if (!isValidSession(data)) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      return data as AuthSession
    } catch {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
  },

  clear: (): void => {
    if (!isBrowser()) return
    localStorage.removeItem(SESSION_KEY)
  },
}
