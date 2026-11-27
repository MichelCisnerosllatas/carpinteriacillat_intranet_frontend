const BASE = '/v1/intranet/chatbot-visitors'

export const CHATBOT_VISITORS_ENDPOINTS = {
  v1: {
    get:     BASE,
    getById: (id: number) => `${BASE}/${id}`,
    delete:  (id: number) => `${BASE}/${id}`,
  },
}
