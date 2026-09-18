const BASE = '/v1/intranet/section-item'

export const SECTIONITEMS_ENDPOINTS = {
  v1: {
    get:      BASE,
    post:     BASE,
    getById:  (id: number) => `${BASE}/${id}`,
    put:      (id: number) => `${BASE}/${id}`,
    patch:    (id: number) => `${BASE}/${id}`,
    delete:   (id: number) => `${BASE}/${id}`,
    reorder:  `${BASE}/reorder`,
  },
}
