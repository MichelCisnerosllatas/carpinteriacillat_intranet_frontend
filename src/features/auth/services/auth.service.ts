// src/features/auth/auth.service.ts
import apiClient from '@/shared/api/apiClient';
import { LoginRequestDTO, LoginResponseDTO } from '@/features/auth/model/logindto/login.dto'
import { AUTH_ENDPOINTS } from './auth.endpoints';
import { VerifyResponseDTO } from '@/features/auth/model/verifydto/verify.dto'

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const { data } = await apiClient.post<LoginResponseDTO>(
      AUTH_ENDPOINTS.v1.login,
      credentials
    );

    return data;
  },

  verifyToken: async (): Promise<VerifyResponseDTO> => {
    const { data } = await apiClient.get<VerifyResponseDTO>(AUTH_ENDPOINTS.v1.verify);
    return data;
  },

  forgotPassword: async (email: string) => {
    return apiClient.post(AUTH_ENDPOINTS.v1.forgotPassword, { email });
  },

  resetPassword: async (data: {
    token: string;
    password: string;
  }) => {
    return apiClient.post(AUTH_ENDPOINTS.v1.reset_password, data);
  },

  refresh: async (refresh_token: string) => {
    return apiClient.post(AUTH_ENDPOINTS.v1.refresh, {
      refresh_token,
    });
  },

  logout: async (): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.v1.logout);
  },
};