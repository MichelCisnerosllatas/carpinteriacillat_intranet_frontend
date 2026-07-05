export const TYPEFONTS_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/typefont',
    post:   '/v1/intranet/typefont',
    put:    (id: number) => `/v1/intranet/typefont/${id}`,
    patch:  (id: number) => `/v1/intranet/typefont/${id}`,
    delete: (id: number) => `/v1/intranet/typefont/${id}`,
  },
}
