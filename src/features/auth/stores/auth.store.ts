//src/features/auth/stores/auth.store.ts;
import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { TokenStorage } from '../storage/token.storage';
import { AuthStorage } from '@/features/auth/storage/auth.storage'
import { LoginDataDTO } from '@/features/auth/model/logindto/login.dto'

interface AuthState {
  loginDataDTO: LoginDataDTO | null;
  isAuthenticated: boolean;
  loadingLogin: boolean;
  logoutLoading: boolean;
  loadingSplash: boolean;
  error: string | null;

  verify: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  return ({
    loginDataDTO: null,
    loadingLogin: false,
    isAuthenticated: false,
    logoutLoading: false,
    loadingSplash: false,
    error: null,

    verify: async () => {
      set({
        loginDataDTO: null,
        loadingSplash: false,
      });

      const session = await AuthStorage.getSession();
      if (session.accessToken && session.user_login) {
        set({
          loginDataDTO: session.user_login,
          isAuthenticated: true,
          loadingSplash: true,
        });
      } else {
        set({
          loginDataDTO: null,
          isAuthenticated: false,
        });
      }
    },

    login: async (email, password) => {
      set({ loadingLogin: true, error: null })

      try {
        const response = await authService.login({
          email: email,
          password: password,
        })

        if(!response.success){
          throw new Error(response.message);
        }

        if (response.data === null) {
          throw new Error('Respuesta de login vacía')
        }

        if (response.data?.user === null) {
          throw new Error('Usuario no encontrado en la respuesta de login')
        }

        TokenStorage.setAccessToken(response.data?.access_token || '')
        TokenStorage.setRefreshToken(response.data?.refresh_token || '')

        set({
          loginDataDTO: response.data,
          loadingLogin: false,
        })

        return true
      } catch (error: any) {
        console.log('LOGIN ERROR:', error?.response?.data)

        set({
          error:
            error?.response?.data?.message ||
            'Error al iniciar sesión',
          loadingLogin: false,
        })

        return false
      }
    },

    logout: async () => {
      try {
        await authService.logout()
      } catch {
      }

      await TokenStorage.clearTokens()
      set({ loginDataDTO: null })
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
// export const useAuthStore = create<AuthState>()((set, get) => {
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
//         const { user, accessToken } = get().auth
//         return !!accessToken && !!user && user.exp > Date.now()
//       },
//     },
//   }
// })
