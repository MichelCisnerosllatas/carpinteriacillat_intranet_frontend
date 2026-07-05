const BASE = '/v1/intranet/proforma-details'

export const PROFORMA_DETAILS_ENDPOINTS = {
  v1: {
    get: BASE,
    post: BASE,
    put: (id: number) => `${BASE}/${id}`,
    patch: (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
  },
}
