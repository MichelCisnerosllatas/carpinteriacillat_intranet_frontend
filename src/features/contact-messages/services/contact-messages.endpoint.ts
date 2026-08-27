export const CONTACT_MESSAGES_ENDPOINTS = {
  v1: {
    get:          '/v1/intranet/contact-messages',
    getById:      (id: number) => `/v1/intranet/contact-messages/${id}`,
    patchStatus:  (id: number) => `/v1/intranet/contact-messages/${id}/status`,
    delete:       (id: number) => `/v1/intranet/contact-messages/${id}`,
  },
}
