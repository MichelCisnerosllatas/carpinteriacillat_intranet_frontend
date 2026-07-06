const BASE = '/v1/intranet/proformas'

export const PROFORMAS_ENDPOINTS = {
  v1: {
    get: BASE,
    getJoin: `${BASE}-join`,
    post: BASE,
    put: (id: number) => `${BASE}/${id}`,
    patch: (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
    pdf: (id: number) => `${BASE}/${id}/pdf`,
    pdfDownload: (id: number) => `${BASE}/${id}/pdfdownload`,
    pdfPath: (id: number) => `${BASE}/${id}/pdf-path`,
    previewStyleUrl: (templateId: number) => `${BASE}/preview-style/${templateId}/url`,
    previewStyle: `${BASE}/preview-style`,
  },
}
