export const NAVIGATIONS_ENDPOINTS = {
  v1: {
    get:     '/v1/intranet/navigation',
    post:    '/v1/intranet/navigation',
    put:     (id: number) => `/v1/intranet/navigation/${id}`,
    patch:   (id: number) => `/v1/intranet/navigation/${id}`,
    delete:  (id: number) => `/v1/intranet/navigation/${id}`,
    reorder: '/v1/intranet/navigation/reorder',
  },
}
