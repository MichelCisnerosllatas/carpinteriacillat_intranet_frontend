export const COMPANY_SIGNATURES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/company-signatures',
    post:   '/v1/intranet/company-signatures',
    put:    (id: number) => `/v1/intranet/company-signatures/${id}`,
    patch:  (id: number) => `/v1/intranet/company-signatures/${id}`,
    delete: (id: number) => `/v1/intranet/company-signatures/${id}`,
  },
}
