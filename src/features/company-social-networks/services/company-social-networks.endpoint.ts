export const COMPANY_SOCIAL_NETWORKS_ENDPOINTS = {
  v1: {
    get: '/v1/intranet/company-social-networks',
    post: '/v1/intranet/company-social-networks',
    put: (id: number) => `/v1/intranet/company-social-networks/${id}`,
    patch: (id: number) => `/v1/intranet/company-social-networks/${id}`,
    delete: (id: number) => `/v1/intranet/company-social-networks/${id}`,
  },
}
