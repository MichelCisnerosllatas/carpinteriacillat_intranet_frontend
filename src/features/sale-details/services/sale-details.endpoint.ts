const BASE = '/v1/intranet/sale-details'

export const SALE_DETAILS_ENDPOINTS = {
  v1: {
    get: BASE,
    post: BASE,
    put: (id: number) => `${BASE}/${id}`,
    patch: (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
  },
}
