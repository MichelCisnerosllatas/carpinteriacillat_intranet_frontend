// Módulo genérico PdfTemplate — esta feature lo consume filtrado por module="proforma".
const BASE = '/v1/intranet/pdf-templates'

export const PROFORMA_TEMPLATES_ENDPOINTS = {
  v1: {
    get:     BASE,
    getJoin: `${BASE}-join`,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
  },
}
