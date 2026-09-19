//src/features/auth/stores/auth.store.ts;
import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { TokenStorage } from '../storage/token.storage';
import { AuthStorage } from '@/features/auth/storage/auth.storage'
import { GoogleAuthRejectionDataDTO, LoginDataDTO } from '@/features/auth/model/logindto/login.dto'

interface AuthState {
  loginDataDTO: LoginDataDTO | null;
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

  verify: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string, _name: string, _email: string, _photo: string) => Promise<boolean>;
  clearGoogleRejection: () => void;
  logout: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => {
  return ({
    loginDataDTO: null,
    loadingLogin: false,
    loadingGoogleLogin: false,
    isAuthenticated: false,
    logoutLoading: false,
    loadingSplash: false,
    error: null,
    googleRejection: null,


    verify: async () => {
      set({ loadingSplash: true })

      const session = await AuthStorage.getSession()

      // console.log('VERIFY SESSION:', {
      //   hasAccessToken: Boolean(session.accessToken),
      //   hasRefreshToken: Boolean(session.refreshToken),
      //   hasUser: Boolean(session.user_login),
      //   user: session.user_login,
      // })

      if (session.accessToken && session.user_login) {
        set({
          loginDataDTO: session.user_login,
          isAuthenticated: true,
          loadingSplash: false,
          error: null,
        })

        return
      }

      set({
        loginDataDTO: null,
        isAuthenticated: false,
        loadingSplash: false,
      })
    },

    login: async (email, password) => {
      set({
        loadingLogin: true,
        error: null,
      })

      try {
        const response = await authService.login({
          email,
          password,
        })

        if (!response.success) {
          throw new Error(response.message || 'No se pudo iniciar sesión')
        }

        if (!response.data) {
          throw new Error('Respuesta de login vacía')
        }

        if (!response.data.user) {
          throw new Error('Usuario no encontrado en la respuesta de login')
        }
        //
        // TokenStorage.setAccessToken(response.data.access_token || '')
        // TokenStorage.setRefreshToken(response.data.refresh_token || '')
        await AuthStorage.saveSession({
          accessToken: response.data.access_token || '',
          refreshToken: response.data.refresh_token || '',
          user_login: response.data,
        })

        set({
          loginDataDTO: response.data,
          isAuthenticated: true,
          loadingLogin: false,
          error: null,
        })

        return true
      } catch (error: any) {
        console.log('LOGIN ERROR FULL:', error)
        console.log('LOGIN ERROR RESPONSE:', error?.response?.data)

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Error al iniciar sesión'

        set({
          error: message,
          loadingLogin: false,
          isAuthenticated: false,
          loginDataDTO: null,
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
        const response = await authService.loginWithGoogle({ 
          id_token: idToken,
          name: _name,
          email: _email,
          photo_url: _photo
        })

        // El rechazo (correo no registrado / cuenta inactiva) no es una excepción de red: el
        // backend responde 401 con `success: false` y, en `data`, lo que Google entregó — se
        // captura acá para la alerta (GoogleAccessPendingAlert), no se descarta como un error genérico.
        if (!response.success || !response.data || !('user' in response.data)) {
          set({
            error: response.message || 'No se pudo iniciar sesión con Google',
            googleRejection: (response.data as any) ?? null,
            loadingGoogleLogin: false,
            isAuthenticated: false,
            loginDataDTO: null,
          })
          return false
        }

        await AuthStorage.saveSession({
          accessToken: response.data.access_token || '',
          refreshToken: response.data.refresh_token || '',
          user_login: response.data,
        })

        set({
          loginDataDTO: response.data,
          isAuthenticated: true,
          loadingGoogleLogin: false,
          error: null,
        })

        return true
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Error al iniciar sesión con Google'

        set({
          error: message,
          googleRejection: error?.response?.data?.data ?? null,
          loadingGoogleLogin: false,
          isAuthenticated: false,
          loginDataDTO: null,
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

      await AuthStorage.clearSession()

      set({
        loginDataDTO: null,
        isAuthenticated: false,
        logoutLoading: false,
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
