// src/shared/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AUTH_ENDPOINTS } from '@/features/auth/services/auth.endpoints';
import { TokenStorage } from '@/features/auth/storage/token.storage';
import { ActiveBranchStorage } from '@/features/auth/storage/active-branch.storage';
import { SessionExpired } from '@/shared/api/sessionExpired'
import { getAppPlatform, getAppVersion, getClientType } from '@/shared/device/appInfo'
import { toastError } from '@/shared/lib/toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 40000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    "X-Client" : getClientType(),
    "X-Platform" : getAppPlatform(),
    "X-App-Version" : getAppVersion()
    // internal_token: AppConfig.internalToken,
  },
});

// Endpoints públicos de autenticación: un 401 aquí significa credenciales rechazadas
// (ej. correo de Google no registrado), NO una sesión expirada — no deben disparar el
// refresh ni `SessionExpired` (que redirige y recarga el navegador).
const PUBLIC_AUTH_ENDPOINTS = [
  AUTH_ENDPOINTS.v1.login,
  AUTH_ENDPOINTS.v1.loginWithGoogle,
  AUTH_ENDPOINTS.v1.refresh,
  AUTH_ENDPOINTS.v1.forgotPassword,
  AUTH_ENDPOINTS.v1.reset_password,
];

const isPublicAuthEndpoint = (url?: string) => {
  if (!url) return false;

  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const shouldSkipAuthToken = isPublicAuthEndpoint;

const shouldSkipRefresh = isPublicAuthEndpoint;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenStorage.getAccessToken();

    if (token && !shouldSkipAuthToken(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;

      // Sucursal activa de la sesión: el backend la usa al registrar ventas/proformas.
      const branchId = ActiveBranchStorage.get();
      if (branchId) config.headers['X-Branch-Id'] = String(branchId);
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

// ─── 403: sin permiso ────────────────────────────────────────────────────────
// Cuando el backend responde 403 (el rol no tiene el permiso) se muestra un toast con su
// mensaje. Para no llenar la pantalla si varias peticiones fallan a la vez, el mismo
// mensaje no se repite antes de 3 segundos.
let lastForbiddenMessage = '';
let lastForbiddenAt = 0;

const showForbiddenToast = (error: AxiosError) => {
  const data: any = error.response?.data;
  const message = data?.message || 'No tienes permiso para realizar esta acción.';

  const now = Date.now();
  if (message === lastForbiddenMessage && now - lastForbiddenAt < 3000) return;

  lastForbiddenMessage = message;
  lastForbiddenAt = now;
  toastError('Sin permiso', message);
};

// ─── 401: refresh del token ──────────────────────────────────────────────────
// Si varias peticiones reciben 401 al mismo tiempo, solo UNA hace el refresh y las demás
// esperan esa misma promesa (antes las demás fallaban directamente con 401).
let refreshPromise: Promise<string | null> | null = null;

/** Pide un access_token nuevo. Devuelve null si no se pudo (y en ese caso cierra la sesión). */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await TokenStorage.getRefreshToken();
    if (!refreshToken) {
      await TokenStorage.clearTokens();
      SessionExpired.execute();
      return null;
    }

    const response = await axios.post(
      `${API_URL}${AUTH_ENDPOINTS.v1.refresh}`,
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

    return newAccessToken;
  } catch {
    TokenStorage.clearTokens()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user')
    }

    SessionExpired.execute()
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // 403 → el usuario no tiene permiso: se avisa con un toast y el error sigue su camino
    // normal (cada store decide qué más hacer con él).
    if (error.response?.status === 403) {
      showForbiddenToast(error);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      originalRequest._retry = true;

      // Si ya hay un refresh en curso lo esperamos; si no, lo iniciamos.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        // EXTRAER MENSAJE DEL BACKEND
        if (error.response?.data) {
          console.log("API ERROR:", error.response.data);
        }

        return Promise.reject(error);
      }

      // Reintenta la petición original con el token nuevo
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
