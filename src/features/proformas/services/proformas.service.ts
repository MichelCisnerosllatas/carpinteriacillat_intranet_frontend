import apiClient from '@/shared/api/apiClient'
import { PROFORMAS_ENDPOINTS } from './proformas.endpoint'
import type {
  ProformaListRequestDto,
  ProformaJoinListResponseDto,
  ProformaGetByIdResponseDto,
} from '../model/proformaget.dto'
import type { ProformaPostRequestDto, ProformaPostResponseDto } from '../model/proformapost.dto'
import type { ProformaPutRequestDto, ProformaPutResponseDto } from '../model/proformaput.dto'

// La generación del PDF de preview (con datos ficticios de cliente/ítems + datos reales de
// empresa) puede tardar bastante, sobre todo en el primer render tras levantar el backend
// (cold start del motor de PDF). Se le da margen amplio para no cortar la request a mitad.
// También se usa para `pdf-guardado`: normalmente es instantáneo (sirve el archivo tal cual),
// pero si el PDF quedó desactualizado por una edición previa, regenera una sola vez ahí mismo
// antes de responder — ver «Cómo funciona el PDF» en proformas.md.
const PREVIEW_TIMEOUT_MS = 120000

// Solo POST regenera el PDF real de la proforma dentro de la misma transacción de registro
// (ver proformas.md). PUT/PATCH ya NO regeneran nada — quedan con el timeout default del
// cliente porque ahora solo persisten la tabla `proformas`, sin tocar el motor de PDF.
const PROFORMA_CREATE_TIMEOUT_MS = 120000

export const proformasService = {
  // Tabla principal y detalle: usa el endpoint -join (cliente, plantilla, firma, tipo y detalles).
  getList: async (param: ProformaListRequestDto): Promise<ProformaJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaJoinListResponseDto>(
      PROFORMAS_ENDPOINTS.v1.getJoin,
      { params }
    )
    return data
  },

  getById: async (id: number): Promise<ProformaGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProformaGetByIdResponseDto>(
      `${PROFORMAS_ENDPOINTS.v1.getJoin}/${id}`
    )
    return data
  },

  post: async (param: ProformaPostRequestDto): Promise<ProformaPostResponseDto> => {
    const { data } = await apiClient.post<ProformaPostResponseDto>(
      PROFORMAS_ENDPOINTS.v1.post,
      param,
      { timeout: PROFORMA_CREATE_TIMEOUT_MS }
    )
    return data
  },

  put: async (id: number, param: ProformaPutRequestDto): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.put<ProformaPutResponseDto>(
      PROFORMAS_ENDPOINTS.v1.put(id),
      param
    )
    return data
  },

  patch: async (
    id: number,
    param: Partial<ProformaPutRequestDto>
  ): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaPutResponseDto>(
      PROFORMAS_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMAS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  // GET /proformas/{id}/pdf-guardado — sirve el PDF ya guardado en disco (rápido, casi
  // siempre instantáneo). Solo si el backend detecta que quedó desactualizado por una edición
  // previa (PUT/PATCH ya no regeneran nada, ver arriba) lo regenera una vez, ahí mismo, antes
  // de responder — de ahí el mismo margen amplio que el preview. `/pdf` (sin "-guardado")
  // sigue existiendo pero SIEMPRE regenera desde cero — queda como fallback/debug, no usar acá.
  viewPdf: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(PROFORMAS_ENDPOINTS.v1.pdfGuardado(id), {
      responseType: 'blob',
      timeout: PREVIEW_TIMEOUT_MS,
    })
    return data
  },

  // GET /proformas/{id}/pdf-guardado/download — igual que arriba, forzando descarga
  // (Content-Disposition: attachment).
  downloadPdf: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(PROFORMAS_ENDPOINTS.v1.pdfGuardadoDownload(id), {
      responseType: 'blob',
      timeout: PREVIEW_TIMEOUT_MS,
    })
    return data
  },

  // PATCH /proformas/{id}/pdf-path — corrección manual de la ruta guardada del PDF.
  updatePdfPath: async (id: number, pdfPath: string): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaPutResponseDto>(
      PROFORMAS_ENDPOINTS.v1.pdfPath(id),
      { pdf_path: pdfPath }
    )
    return data
  },

  // GET /proformas/pdf-preview-style/{templateId}/url — URL firmada (30 min) para previsualizar una
  // plantilla YA GUARDADA (ej. desde el listado, sin pasar por el formulario de edición). Igual que
  // el POST de preview, la generación puede tardar más que el timeout default del cliente (15s).
  getPreviewStyleUrl: async (templateId: number): Promise<string> => {
    const { data } = await apiClient.get<{
      success: boolean
      status: number
      message: string
      data: { url: string }
    }>(PROFORMAS_ENDPOINTS.v1.previewStyleUrl(templateId), { timeout: PREVIEW_TIMEOUT_MS })
    return data.data.url
  },

  // POST /proformas/pdf-preview-style — PDF de vista previa al vuelo a partir de estilos sin
  // guardar (no persiste nada). Acepta un `texts` opcional (array de { key, content, visible,
  // order }) para pintar los borradores del tab "Textos extra" — ver stylePayloadWithTexts en
  // proforma-template-form.tsx. Es el mecanismo recomendado para el formulario de edición de
  // plantillas: se llama en cada cambio, con o sin id de plantilla. Acepta un AbortSignal para
  // poder cancelar una llamada anterior si el usuario sigue editando.
  getPreviewStylePdf: async (
    styles: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<Blob> => {
    const { data } = await apiClient.post(PROFORMAS_ENDPOINTS.v1.previewStyle, styles, {
      responseType: 'blob',
      timeout: PREVIEW_TIMEOUT_MS,
      signal,
    })
    return data
  },
}
