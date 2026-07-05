export const COMPANY_BRANCHES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/company-branches',
    post:   '/v1/intranet/company-branches',
    put:    (id: number) => `/v1/intranet/company-branches/${id}`,
    patch:  (id: number) => `/v1/intranet/company-branches/${id}`,
    delete: (id: number) => `/v1/intranet/company-branches/${id}`,
  },
}
