export const TYPESECTIONS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typesection',
    post:   '/v1/intranet/typesection',
    put:    (id: number) => `/v1/intranet/typesection/${id}`,
    patch:  (id: number) => `/v1/intranet/typesection/${id}`,
    delete: (id: number) => `/v1/intranet/typesection/${id}`,
  },
}
