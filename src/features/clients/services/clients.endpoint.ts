const BASE = '/v1/intranet/clients'

export const CLIENTS_ENDPOINTS = {
  v1: {
    get:     BASE,
    getJoin: `${BASE}-join`,
    post:    BASE,
    put:     (id: number) => `${BASE}/${id}`,
    patch:   (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
  },
}
