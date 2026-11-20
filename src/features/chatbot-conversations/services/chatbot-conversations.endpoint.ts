const BASE = '/v1/intranet/chatbot-conversations'

export const CHATBOT_CONVERSATIONS_ENDPOINTS = {
  v1: {
    get:     BASE,
    getById: (id: number) => `${BASE}/${id}`,
    status:  (id: number) => `${BASE}/${id}/status`,
    delete:  (id: number) => `${BASE}/${id}`,
  },
}
