const BASE = '/v1/intranet/proforma-template-texts'

export const PROFORMA_TEMPLATE_TEXTS_ENDPOINTS = {
  v1: {
    get:    BASE,
    post:   BASE,
    put:    (id: number) => `${BASE}/${id}`,
    patch:  (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
  },
}
