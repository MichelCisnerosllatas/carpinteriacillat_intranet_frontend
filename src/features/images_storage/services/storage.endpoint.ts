export const STORAGE_ENDPOINTS = {
  storageAll:    '/v1/intranet/image/storage-all',
  exists:        '/v1/intranet/image/exists',
  delete:        '/v1/intranet/image/delete',
  move:          '/v1/intranet/image/move',
  dbImages:      '/v1/intranet/image',
  dbImageById:   (id: number) => `/v1/intranet/image/${id}`,
}
