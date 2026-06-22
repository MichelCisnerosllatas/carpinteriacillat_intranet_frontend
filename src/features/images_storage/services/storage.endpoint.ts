export const STORAGE_ENDPOINTS = {
  storageAll:    '/v1/public/image/storage-all',
  exists:        '/v1/public/image/exists',
  delete:        '/v1/public/image/delete',
  move:          '/v1/public/image/move',
  dbImages:      '/v1/public/image',
  dbImageById:   (id: number) => `/v1/public/image/${id}`,
}
