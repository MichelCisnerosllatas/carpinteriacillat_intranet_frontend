export const SALE_PAYMENTS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/sale-payments',
    post:   '/v1/intranet/sale-payments',
    put:    (id: number) => `/v1/intranet/sale-payments/${id}`,
    patch:  (id: number) => `/v1/intranet/sale-payments/${id}`,
    delete: (id: number) => `/v1/intranet/sale-payments/${id}`,
  },
}
