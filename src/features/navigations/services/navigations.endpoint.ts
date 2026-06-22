export const NAVIGATIONS_ENDPOINTS = {
  v1: {
    get:    '/v1/public/navigation',
    post:   '/v1/public/navigation',
    put:    (id: number) => `/v1/public/navigation/${id}`,
    patch:  (id: number) => `/v1/public/navigation/${id}`,
    delete: (id: number) => `/v1/public/navigation/${id}`,
  },
}
