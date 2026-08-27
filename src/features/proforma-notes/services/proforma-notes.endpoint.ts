const BASE = '/v1/intranet/proforma-notes'

export const PROFORMA_NOTES_ENDPOINTS = {
  v1: {
    get: BASE,
    post: BASE,
    put: (id: number) => `${BASE}/${id}`,
    patch: (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
  },
}
