export const COMPANY_BANK_ACCOUNTS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/company-bank-accounts',
    post:   '/v1/intranet/company-bank-accounts',
    put:    (id: number) => `/v1/intranet/company-bank-accounts/${id}`,
    patch:  (id: number) => `/v1/intranet/company-bank-accounts/${id}`,
    delete: (id: number) => `/v1/intranet/company-bank-accounts/${id}`,
  },
}
