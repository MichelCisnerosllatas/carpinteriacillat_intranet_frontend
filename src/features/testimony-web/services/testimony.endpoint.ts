const BASE = '/v1/intranet/testimony'

export const TESTIMONY_ENDPOINTS = {
  v1: {
    get:         BASE,
    getJoin:     `${BASE}_join`,
    post:        BASE,
    getById:     (id: number) => `${BASE}/${id}`,
    getByIdJoin: (id: number) => `${BASE}_join/${id}`,
    put:         (id: number) => `${BASE}/${id}`,
    patch:       (id: number) => `${BASE}/${id}`,
    delete:      (id: number) => `${BASE}/${id}`,
    reorder:     `${BASE}/reorder`,
    section:     `${BASE}/section`,
  },
}
