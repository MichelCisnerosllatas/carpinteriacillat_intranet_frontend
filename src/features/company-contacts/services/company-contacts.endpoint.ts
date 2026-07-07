export const COMPANY_CONTACTS_ENDPOINTS = {
  v1: {
    get: '/v1/intranet/company-contacts',
    post: '/v1/intranet/company-contacts',
    put: (id: number) => `/v1/intranet/company-contacts/${id}`,
    patch: (id: number) => `/v1/intranet/company-contacts/${id}`,
    delete: (id: number) => `/v1/intranet/company-contacts/${id}`,
  },
}
