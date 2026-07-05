export const PROFORMA_TYPES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/proforma-types',
    post:   '/v1/intranet/proforma-types',
    put:    (id: number) => `/v1/intranet/proforma-types/${id}`,
    patch:  (id: number) => `/v1/intranet/proforma-types/${id}`,
    delete: (id: number) => `/v1/intranet/proforma-types/${id}`,
  },
}
