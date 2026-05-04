// src/feature/auth/storage/user.storage.ts

import { LoginDataDTO } from '@/features/auth/model/logindto/login.dto'

const USER_KEY = 'auth_user';
const isBrowser = (): boolean => typeof window !== 'undefined';

export const UserStorage = {
  setUser: async (user: LoginDataDTO): Promise<void> => {
    if (!isBrowser()) return;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: async (): Promise<LoginDataDTO | null> => {
    if (!isBrowser()) return null;

    const data = localStorage.getItem(USER_KEY);

    if (!data) return null;

    try {
      return JSON.parse(data) as LoginDataDTO;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  deleteUser: async (): Promise<void> => {
    if (!isBrowser()) return;

    localStorage.removeItem(USER_KEY);
  },
};