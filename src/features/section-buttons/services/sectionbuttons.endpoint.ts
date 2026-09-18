const BASE = '/v1/intranet/section-button'

export const SECTIONBUTTONS_ENDPOINTS = {
  v1: {
    get:     BASE,
    post:    BASE,
    getById: (id: number) => `${BASE}/${id}`,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
    reorder: `${BASE}/reorder`,
  },
}
