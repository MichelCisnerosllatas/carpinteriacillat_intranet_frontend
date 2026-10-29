export const TYPEWORKS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typework',
    post:   '/v1/intranet/typework',
    put:    (id: number) => `/v1/intranet/typework/${id}`,
    patch:  (id: number) => `/v1/intranet/typework/${id}`,
    delete: (id: number) => `/v1/intranet/typework/${id}`,
  },
}
