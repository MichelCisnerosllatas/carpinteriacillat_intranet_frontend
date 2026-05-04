// src/feature/auth/storage/auth.storage.ts
import { TokenStorage } from './token.storage';
import { UserStorage } from './user.storage';
import { LoginDataDTO } from '@/features/auth/model/logindto/login.dto'

export const AuthStorage = {
  saveOnlyTokens: async ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) => {
    await TokenStorage.setAccessToken(accessToken);
    await TokenStorage.setRefreshToken(refreshToken);
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
    await TokenStorage.setAccessToken(accessToken);
    await TokenStorage.setRefreshToken(refreshToken);
    await UserStorage.setUser(user_login);
  },

  getSession: async () => {
    const accessToken = await TokenStorage.getAccessToken();
    const refreshToken = await TokenStorage.getRefreshToken();
    const user_login = await UserStorage.getUser();

    return {
      accessToken,
      refreshToken,
      user_login,
    };
  },

  clearSession: async () => {
    await TokenStorage.clearTokens();
    await UserStorage.deleteUser();
  },
};