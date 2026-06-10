// src/shared/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AUTH_ENDPOINTS } from '@/features/auth/services/auth.endpoints';
import { TokenStorage } from '@/features/auth/storage/token.storage';
import { SessionExpired } from '@/shared/api/sessionExpired'
import { AppConfig } from '@/shared/api/env'
import { getAppPlatform, getAppVersion, getClientType } from '@/shared/device/appInfo'

const apiClient = axios.create({
  baseURL: AppConfig.apiUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    "X-Client" : getClientType(),
    "X-Platform" : getAppPlatform(),
    "X-App-Version" : getAppVersion()
    // internal_token: AppConfig.internalToken,
  },
});

const shouldSkipAuthToken = (url?: string) => {
  if (!url) return false;

  return (
    url.includes(AUTH_ENDPOINTS.v1.login) ||
    url.includes(AUTH_ENDPOINTS.v1.refresh)
  );
};

const shouldSkipRefresh = (url?: string) => {
  if (!url) return false;

  return (
    url.includes(AUTH_ENDPOINTS.v1.login) ||
    url.includes(AUTH_ENDPOINTS.v1.refresh)
  );
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenStorage.getAccessToken();

    if (token && !shouldSkipAuthToken(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log('API FULL URL:', axios.getUri(config));
    // console.log('API BODY:', config.data);
    // console.log('HAS TOKEN:', Boolean(token));
    // console.log('SEND AUTH HEADER:', Boolean(config.headers.Authorization));
    // console.log('API HEADERS:', config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = await TokenStorage.getRefreshToken();
          if (!refreshToken) {
            await TokenStorage.clearTokens();
            SessionExpired.execute();
            // EXTRAER MENSAJE DEL BACKEND
            if (error.response?.data) {
              console.log("API ERROR:", error.response.data);
            }

            return Promise.reject(error);
          }

          const response = await axios.post(
            `${AppConfig.apiUrl}${AUTH_ENDPOINTS.v1.refresh}`,
            {
              refresh_token: refreshToken,
            },
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );

          const newAccessToken = response.data.access_token;
          const newRefreshToken = response.data.refresh_token;

          TokenStorage.setAccessToken(newAccessToken);

          if (newRefreshToken) {
            TokenStorage.setRefreshToken(newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } 
        catch (refreshError) {
          TokenStorage.clearTokens()

          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_user')
          }

          SessionExpired.execute()
          return Promise.reject(refreshError)
        } 
        finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;