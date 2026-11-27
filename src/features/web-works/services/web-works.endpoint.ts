const BASE = '/v1/intranet/web-work'

export const WEB_WORKS_ENDPOINTS = {
  v1: {
    get:     BASE,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
    getById: (id: number) => `${BASE}/${id}`,
    reorder: `${BASE}/reorder`,
    styles:  `${BASE}/styles`,
  },
}
