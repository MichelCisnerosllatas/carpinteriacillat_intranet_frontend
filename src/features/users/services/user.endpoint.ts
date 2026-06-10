// src/feature/user/services/user.endpoints.ts
export const USER_ENDPOINTS = {
  v1 : {
    get: '/v1/intranet/user_join',
    post: '/v1/intranet/user',
    patch: ( id: string) => `/v1/intranet/user/${id}`,
    put: ( id: string) => `/v1/intranet/user/${id}`,
    delete: ( id: number) => `/v1/intranet/user/${id}`
  }
};