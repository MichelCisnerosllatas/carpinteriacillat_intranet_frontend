const BASE = '/v1/intranet/google-access-requests'

export const GOOGLE_ACCESS_REQUEST_ENDPOINTS = {
  v1: {
    get: BASE,
    getById: (id: number) => `${BASE}/${id}`,
    approve: (id: number) => `${BASE}/${id}/approve`,
    reject: (id: number) => `${BASE}/${id}/reject`,
  },
}
