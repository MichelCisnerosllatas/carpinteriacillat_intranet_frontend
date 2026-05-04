// src/feature/auth/api/auth.endpoints.ts
export const AUTH_ENDPOINTS = {
  v1 : {
    login: '/v1/intranet/auth/login',
    verify: '/v1/intranet/auth/verify',
    refresh: '/v1/intranet/auth/refresh',
    forgotPassword: '/v1/intranet/auth/forgot-password',
    reset_password: '/v1/intranet/auth/reset-password',
    logout: '/v1/intranet/auth/logout',
  }
};