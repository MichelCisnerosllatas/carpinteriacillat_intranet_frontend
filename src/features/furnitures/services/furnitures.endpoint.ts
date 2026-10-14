const BASE = '/v1/intranet/furniture'

export const FURNITURES_ENDPOINTS = {
  v1: {
    get:     BASE,
    getJoin: `${BASE}_join`,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
    // Estilos ya usados en la galería web (sugerencias para el campo "Estilo").
    webStyles: '/v1/intranet/furniture-web/styles',
  },
}
