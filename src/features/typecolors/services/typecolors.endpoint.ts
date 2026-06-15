export const TYPECOLORS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typecolor',
    post:   '/v1/intranet/typecolor',
    put:    (id: number) => `/v1/intranet/typecolor/${id}`,
    patch:  (id: number) => `/v1/intranet/typecolor/${id}`,
    delete: (id: number) => `/v1/intranet/typecolor/${id}`,
  },
}
