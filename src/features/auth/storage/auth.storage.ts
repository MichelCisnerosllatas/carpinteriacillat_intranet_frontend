// src/feature/auth/storage/auth.storage.ts
import { TokenStorage } from './token.storage';
import { UserStorage } from './user.storage';
import { LoginDataDTO } from '@/features/auth/model/logindto/login.dto'
import { CookieStorage } from '@/shared/config/cookie.storage'

export const AuthStorage = {
  saveOnlyTokens: ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) => {
    TokenStorage.setAccessToken(accessToken);
    TokenStorage.setRefreshToken(refreshToken);
  },

  saveSession: async ({
    accessToken,
    refreshToken,
    user_login,
  }: {
    accessToken: string;
    refreshToken: string;
    user_login: LoginDataDTO;
  }) => {
    TokenStorage.setAccessToken(accessToken);
    TokenStorage.setRefreshToken(refreshToken);
    CookieStorage.set('auth_role', String(user_login.user?.id_rol))
    await UserStorage.setUser(user_login);
  },

  getSession: async () => {
    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const user_login = await UserStorage.getUser();

    return {
      accessToken,
      refreshToken,
      user_login,
    };
  },

  clearSession: async () => {
    TokenStorage.clearTokens();
    CookieStorage.remove('auth_role')
    await UserStorage.deleteUser();
  },
};