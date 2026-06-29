const BASE = '/v1/intranet/furniture-image'

export const FURNITURE_IMAGES_ENDPOINTS = {
  v1: {
    get:         BASE,
    getJoin:     `${BASE}_join`,
    post:        BASE,
    reorder:     `${BASE}/reorder`,
    put:         (id: number) => `${BASE}/${id}`,
    patch:       (id: number) => `${BASE}/${id}`,
    delete:      (id: number) => `${BASE}/${id}`,
    getJoinById: (id: number) => `${BASE}_join/${id}`,
  },
}
