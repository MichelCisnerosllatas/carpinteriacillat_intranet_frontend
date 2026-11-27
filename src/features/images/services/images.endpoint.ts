export const IMAGES_ENDPOINTS = {
  v1: {
    get:           '/v1/intranet/image',
    post:           '/v1/intranet/image',
    patch:           '/v1/intranet/image',
    upload:        '/v1/intranet/image/upload',
    getById:       (id: number) => `/v1/intranet/image/${id}`,
    delete:        (id: number) => `/v1/intranet/image/${id}`,
  },
}
