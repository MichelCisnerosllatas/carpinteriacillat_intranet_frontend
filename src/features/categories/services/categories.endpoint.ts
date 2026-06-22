export const CATEGORIES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/category',
    post:   '/v1/intranet/category',
    put:    (id: number) => `/v1/intranet/category/${id}`,
    delete: (id: number) => `/v1/intranet/category/${id}`,
  },
}
