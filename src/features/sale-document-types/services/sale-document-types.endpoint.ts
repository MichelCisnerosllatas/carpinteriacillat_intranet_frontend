export const SALE_DOCUMENT_TYPES_ENDPOINTS = {
  v1: {
    get:    '/v1/intranet/sale-document-types',
    post:   '/v1/intranet/sale-document-types',
    put:    (id: number) => `/v1/intranet/sale-document-types/${id}`,
    patch:  (id: number) => `/v1/intranet/sale-document-types/${id}`,
    delete: (id: number) => `/v1/intranet/sale-document-types/${id}`,
  },
}
