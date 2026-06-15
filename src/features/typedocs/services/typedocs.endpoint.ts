export const TYPEDOCS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typedoc',
    post:   '/v1/intranet/typedoc',
    put:    (id: number) => `/v1/intranet/typedoc/${id}`,
    patch:  (id: number) => `/v1/intranet/typedoc/${id}`,
    delete: (id: number) => `/v1/intranet/typedoc/${id}`,
  },
}
