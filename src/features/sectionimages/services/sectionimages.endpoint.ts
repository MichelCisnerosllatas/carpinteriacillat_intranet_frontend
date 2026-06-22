const BASE = '/v1/public/sectionimage'

export const SECTIONIMAGES_ENDPOINTS = {
  v1: {
    get:     BASE,
    getJoin: `${BASE}_join`,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
  },
}
