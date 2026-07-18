const BASE = '/v1/intranet/proformas'

export const PROFORMAS_ENDPOINTS = {
  v1: {
    get: BASE,
    getJoin: `${BASE}-join`,
    post: BASE,
    put: (id: number) => `${BASE}/${id}`,
    patch: (id: number) => `${BASE}/${id}`,
    delete: (id: number) => `${BASE}/${id}`,
    // Regeneran el PDF SIEMPRE en cada llamada (lento) — quedan como fallback/debug, ver
    // proformas.md. El front usa `pdfGuardado`/`pdfGuardadoDownload` para "Ver"/"Descargar".
    pdf: (id: number) => `${BASE}/${id}/pdf`,
    pdfDownload: (id: number) => `${BASE}/${id}/pdfdownload`,
    // Sirve el PDF ya guardado en disco (rápido) — solo regenera si está desactualizado
    // (`updated_at` más reciente que `pdf_generated_at`, o el archivo no existe).
    pdfGuardado: (id: number) => `${BASE}/${id}/pdf-guardado`,
    pdfGuardadoDownload: (id: number) => `${BASE}/${id}/pdf-guardado/download`,
    pdfPath: (id: number) => `${BASE}/${id}/pdf-path`,
    // El backend renombró estas dos rutas de "preview-style" a "pdf-preview-style" (ver
    // pdf-templates.md / proformas.md) — las rutas viejas ya no existen.
    previewStyleUrl: (templateId: number) => `${BASE}/pdf-preview-style/${templateId}/url`,
    previewStyle: `${BASE}/pdf-preview-style`,
  },
}
