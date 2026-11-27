//src/features/auth/stores/auth.store.ts;
import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { TokenStorage } from '../storage/token.storage';
import { AuthStorage } from '@/features/auth/storage/auth.storage'
import { SessionExpired } from '@/shared/api/sessionExpired'
import { ActiveBranchStorage } from '@/features/auth/storage/active-branch.storage'
import type { LoginDataDTO } from '@/features/auth/model/login.dto'
import type { GoogleAuthRejectionDataDTO } from '@/features/auth/model/login-google.dto'
import type { AuthSession } from '@/features/auth/model/session.type'

type AuthState = {
  /** La sesión (respuesta de GET verify). null = sin sesión. Ver model/session.type.ts */
  session: AuthSession | null;
  isAuthenticated: boolean;
  loadingLogin: boolean;
  loadingGoogleLogin: boolean;
  logoutLoading: boolean;
  loadingSplash: boolean;
  error: string | null;
  /** Lo que Google devolvió cuando el login se rechazó (correo no registrado / cuenta inactiva)
   * — para mostrar la alerta con foto/nombre/correo en vez de un error genérico. `null` en
   * cualquier otro caso (éxito, o un error que no trae estos datos). */
  googleRejection: GoogleAuthRejectionDataDTO | null;

  /** true mientras se pide GET verify al backend para refrescar los permisos. */
  isSyncingAccess: boolean;
  /** true cuando ya se intentó (con éxito o no) refrescar los permisos con el backend. */
  accessChecked: boolean;

  /** Sucursal activa (se envía como header X-Branch-Id). null = sin sucursal asignada. */
  activeBranchId: number | null;
  /** Cambia la sucursal activa (selector del sidebar). */
  setActiveBranch: (id: number) => void;

  /** Lee la sesión local y luego la refresca con el backend (loadLocalSession + syncAccess). */
  verify: () => Promise<void>;
  /** Solo lee la sesión guardada en localStorage (rápido, sin red). Devuelve true si hay sesión. */
  loadLocalSession: () => Promise<boolean>;
  /** Llama a GET verify y reemplaza la sesión guardada con la respuesta. */
  syncAccess: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string, _name: string, _email: string, _photo: string) => Promise<boolean>;
  clearGoogleRejection: () => void;
  logout: () => Promise<boolean>;
}

// Saca el mensaje de un error de axios (o de un Error normal).
const getErrorMessage = (error: any, fallback: string): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

export const useAuthStore = create<AuthState>((set, get) => {
  /**
   * El backend dijo que la sesión ya no es válida (token antiguo, usuario o rol desactivado):
   * se borra todo y se manda al login.
   */
  const expireSession = async () => {
    AuthStorage.clearSession()
    set({ session: null, isAuthenticated: false })
    // Si AuthSessionProvider registró el callback, redirige a /sign-in.
    SessionExpired.execute()
  }

  /**
   * Segunda parte del login (correo o Google):
   *   1) guarda los tokens (y la cookie access_token)
   *   2) pide GET verify y guarda la sesión
   * Devuelve null si salió bien, o el mensaje de error (en ese caso limpia los tokens).
   */
  const startSession = async (tokens: LoginDataDTO): Promise<string | null> => {
    // 1) Tokens
    AuthStorage.saveTokens(tokens.access_token, tokens.refresh_token)

    // 2) Sesión: usuario, rol, permisos, empresa y sucursales
    try {
      const response = await authService.verifyToken()

      if (!response.success || !response.data) {
        AuthStorage.clearSession()
        return response.message || 'No se pudo cargar la sesión'
      }

      AuthStorage.saveSession(response.data)
      set({
        session: response.data,
        isAuthenticated: true,
        accessChecked: true, // verify ya trajo los permisos
        error: null,
        activeBranchId: ActiveBranchStorage.reconcile(response.data),
      })
      return null
    } catch (error: any) {
      AuthStorage.clearSession()
      return getErrorMessage(error, 'No se pudo cargar la sesión')
    }
  }

  return ({
    session: null,
    loadingLogin: false,
    loadingGoogleLogin: false,
    isAuthenticated: false,
    logoutLoading: false,
    loadingSplash: false,
    isSyncingAccess: false,
    accessChecked: false,
    error: null,
    googleRejection: null,
    activeBranchId: null,

    setActiveBranch: (id) => {
      const branches = get().session?.user.branches ?? []
      if (!branches.some((b) => b.id === id)) return
      ActiveBranchStorage.set(id)
      set({ activeBranchId: id })
    },


    verify: async () => {
      // 1) Primero la sesión local: así la UI se pinta al instante.
      const hasSession = await get().loadLocalSession()

      // 2) Luego el backend: trae los permisos actuales del rol (por si cambiaron).
      if (hasSession) {
        await get().syncAccess()
      }
    },

    loadLocalSession: async () => {
      // Solo mostramos "Cargando..." si todavía no había sesión en memoria.
      if (!get().isAuthenticated) set({ loadingSplash: true })

      const { accessToken, session } = AuthStorage.getSession()

      if (accessToken && session) {
        set({
          session,
          isAuthenticated: true,
          loadingSplash: false,
          error: null,
          activeBranchId: ActiveBranchStorage.reconcile(session),
        })

        return true
      }

      set({
        session: null,
        isAuthenticated: false,
        loadingSplash: false,
        accessChecked: true, // no hay nada que verificar
      })

      // Hay token pero no una sesión válida. Pasa con las sesiones guardadas antes del
      // cambio de formato (login → verify): no traen user.role.permissions.
      // Se limpia todo y se manda a /sign-in para que vuelva a iniciar sesión.
      if (accessToken) {
        await expireSession()
      }

      return false
    },

    syncAccess: async () => {
      if (!TokenStorage.getAccessToken()) {
        set({ accessChecked: true })
        return
      }

      set({ isSyncingAccess: true })

      try {
        // Si el token expiró, el interceptor de apiClient intenta un refresh y reintenta solo.
        const response = await authService.verifyToken()

        if (!response.success || !response.data) {
          await expireSession()
          return
        }

        // Si mientras esperábamos el usuario cerró sesión, no hacemos nada.
        if (!get().session) return

        // La respuesta de verify ES la sesión: se reemplaza completa.
        AuthStorage.saveSession(response.data)
        set({ session: response.data, activeBranchId: ActiveBranchStorage.reconcile(response.data) })
      } catch (error: any) {
        // 401 = el backend rechazó la sesión (incluso después del refresh): se cierra.
        // Otros errores (sin internet, 500...) no cierran la sesión: se sigue con los
        // permisos guardados en localStorage.
        if (error?.response?.status === 401) {
          await expireSession()
        } else {
          console.log('VERIFY ERROR:', error?.response?.data ?? error?.message)
        }
      } finally {
        set({ isSyncingAccess: false, accessChecked: true })
      }
    },

    login: async (email, password) => {
      set({
        loadingLogin: true,
        error: null,
      })

      try {
        // 1) POST login → solo tokens
        const response = await authService.login({
          email,
          password,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'No se pudo iniciar sesión')
        }

        // 2) Guardar tokens + GET verify → sesión
        const sessionError = await startSession(response.data)
        if (sessionError) {
          throw new Error(sessionError)
        }

        set({ loadingLogin: false })
        return true
      } catch (error: any) {
        console.log('LOGIN ERROR:', error?.response?.data ?? error?.message)

        set({
          error: getErrorMessage(error, 'Error al iniciar sesión'),
          loadingLogin: false,
          isAuthenticated: false,
          session: null,
        })

        return false
      }
    },

    loginWithGoogle: async (idToken, _name, _email, _photo) => {
      set({
        loadingGoogleLogin: true,
        error: null,
        googleRejection: null,
      })

      try {
        // 1) POST google → solo tokens (o los datos de Google si fue rechazado)
        const response = await authService.loginWithGoogle({
          id_token: idToken,
          name: _name,
          email: _email,
          photo_url: _photo
        })

        // El rechazo (correo no registrado / cuenta inactiva) no es una excepción de red: el
        // backend responde 401 con `success: false` y, en `data`, lo que Google entregó — se
        // captura acá para la alerta (GoogleAccessPendingAlert), no se descarta como un error genérico.
        if (!response.success || !response.data || !('access_token' in response.data)) {
          set({
            error: response.message || 'No se pudo iniciar sesión con Google',
            googleRejection: (response.data as GoogleAuthRejectionDataDTO | null) ?? null,
            loadingGoogleLogin: false,
            isAuthenticated: false,
            session: null,
          })
          return false
        }

        // 2) Guardar tokens + GET verify → sesión
        const sessionError = await startSession(response.data)
        if (sessionError) {
          set({
            error: sessionError,
            loadingGoogleLogin: false,
            isAuthenticated: false,
            session: null,
          })
          return false
        }

        set({ loadingGoogleLogin: false })
        return true
      } catch (error: any) {
        set({
          error: getErrorMessage(error, 'Error al iniciar sesión con Google'),
          googleRejection: error?.response?.data?.data ?? null,
          loadingGoogleLogin: false,
          isAuthenticated: false,
          session: null,
        })

        return false
      }
    },

    clearGoogleRejection: () => set({ googleRejection: null, error: null }),

    logout: async () => {
      set({ logoutLoading: true })

      try {
        await authService.logout()
      } catch (error) {
        console.log('LOGOUT API ERROR:', error)
      }

      AuthStorage.clearSession()

      set({
        session: null,
        isAuthenticated: false,
        logoutLoading: false,
        accessChecked: false,
      })

      return true
    },
  })
});


// import { create } from 'zustand'
// import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
//
// const ACCESS_TOKEN_KEY = 'access_token'
//
// interface AuthUser {
//   accountNo: string
//   email: string
//   role: string[]
//   exp: number
// }
//
// interface AuthState {
//   auth: {
//     user: AuthUser | null
//     setUser: (user: AuthUser | null) => void
//     accessToken: string
//     setAccessToken: (accessToken: string) => void
//     resetAccessToken: () => void
//     reset: () => void
//     isAuthenticated: () => boolean
//   }
// }
//
// export const useAuthStore = create<AuthState>()((set, getdto) => {
//   const cookieToken = getCookie(ACCESS_TOKEN_KEY)
//   const initToken = cookieToken ? JSON.parse(cookieToken) : ''
//
//   return {
//     auth: {
//       user: null,
//       accessToken: initToken,
//
//       setUser: (user) =>
//         set((state) => ({ auth: { ...state.auth, user } })),
//
//       setAccessToken: (accessToken) =>
//         set((state) => {
//           setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
//           return { auth: { ...state.auth, accessToken } }
//         }),
//
//       resetAccessToken: () =>
//         set((state) => {
//           removeCookie(ACCESS_TOKEN_KEY)
//           return { auth: { ...state.auth, accessToken: '' } }
//         }),
//
//       reset: () =>
//         set((state) => {
//           removeCookie(ACCESS_TOKEN_KEY)
//           return { auth: { ...state.auth, user: null, accessToken: '' } }
//         }),
//
//       isAuthenticated: () => {
//         const { user, accessToken } = getdto().auth
//         return !!accessToken && !!user && user.exp > Date.now()
//       },
//     },
//   }
// })
