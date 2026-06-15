export const ROLES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/role',
    post:   '/v1/intranet/role',
    put:    (id: number) => `/v1/intranet/role/${id}`,
    patch:  (id: number) => `/v1/intranet/role/${id}`,
    delete: (id: number) => `/v1/intranet/role/${id}`,
  },
}
