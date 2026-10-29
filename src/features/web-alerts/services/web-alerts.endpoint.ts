// Direcciones (URLs) de la API de alertas del sitio.

const BASE = '/v1/intranet/web-alert'

export const WEB_ALERTS_ENDPOINTS = {
  v1: {
    get:     BASE,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
    getById: (id: number) => `${BASE}/${id}`,
    reorder: `${BASE}/reorder`,
  },
}
