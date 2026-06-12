export const PERSON_ENDPOINTS = {
  v1: {
    post:  '/v1/intranet/person',
    patch: (id: number) => `/v1/intranet/person/${id}`,
    put:   (id: number) => `/v1/intranet/person/${id}`,
  },
}
