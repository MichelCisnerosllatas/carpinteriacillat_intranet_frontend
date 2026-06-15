export const TYPEWOODS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typewood',
    post:   '/v1/intranet/typewood',
    put:    (id: number) => `/v1/intranet/typewood/${id}`,
    patch:  (id: number) => `/v1/intranet/typewood/${id}`,
    delete: (id: number) => `/v1/intranet/typewood/${id}`,
  },
}
