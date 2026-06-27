export const IMAGES_ENDPOINTS = {
  v1: {
    get:           '/v1/public/image',
    post:           '/v1/public/image',
    patch:           '/v1/public/image',
    upload:        '/v1/public/image/upload',
    getById:       (id: number) => `/v1/public/image/${id}`,
    delete:        (id: number) => `/v1/public/image/${id}`,
    storageAll:    '/v1/public/image/storage-all',
    storageDelete: '/v1/public/image/delete',
  },
}
