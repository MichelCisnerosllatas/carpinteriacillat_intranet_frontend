const BASE = '/v1/intranet/chatbot-options'

export const CHATBOT_OPTIONS_ENDPOINTS = {
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
