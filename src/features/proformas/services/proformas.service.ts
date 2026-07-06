import apiClient from '@/shared/api/apiClient'
import { PROFORMAS_ENDPOINTS } from './proformas.endpoint'
import type {
  ProformaListRequestDto,
  ProformaJoinListResponseDto,
  ProformaGetByIdResponseDto,
} from '../model/proformaget.dto'
import type { ProformaPostRequestDto, ProformaPostResponseDto } from '../model/proformapost.dto'
import type { ProformaPutRequestDto, ProformaPutResponseDto } from '../model/proformaput.dto'

export const proformasService = {
  // Tabla principal y detalle: usa el endpoint -join (cliente, plantilla, firma, tipo y detalles).
  getList: async (param: ProformaListRequestDto): Promise<ProformaJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaJoinListResponseDto>(PROFORMAS_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<ProformaGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProformaGetByIdResponseDto>(`${PROFORMAS_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  post: async (param: ProformaPostRequestDto): Promise<ProformaPostResponseDto> => {
    const { data } = await apiClient.post<ProformaPostResponseDto>(PROFORMAS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ProformaPutRequestDto): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.put<ProformaPutResponseDto>(PROFORMAS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ProformaPutRequestDto>): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaPutResponseDto>(PROFORMAS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMAS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  // GET /proformas/{id}/pdf — PDF binario en línea, no usa el sobre JSON estándar.
  viewPdf: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(PROFORMAS_ENDPOINTS.v1.pdf(id), { responseType: 'blob' })
    return data
  },

  // GET /proformas/{id}/pdfdownload — PDF binario forzando descarga (Content-Disposition: attachment).
  downloadPdf: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(PROFORMAS_ENDPOINTS.v1.pdfDownload(id), { responseType: 'blob' })
    return data
  },

  // PATCH /proformas/{id}/pdf-path — corrección manual de la ruta guardada del PDF.
  updatePdfPath: async (id: number, pdfPath: string): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaPutResponseDto>(PROFORMAS_ENDPOINTS.v1.pdfPath(id), { pdf_path: pdfPath })
    return data
  },

  // GET /proformas/preview-style/{templateId}/url — URL firmada (30 min) para previsualizar una plantilla
  // YA GUARDADA (ej. desde el listado, sin pasar por el formulario de edición).
  getPreviewStyleUrl: async (templateId: number): Promise<string> => {
    const { data } = await apiClient.get<{ success: boolean; status: number; message: string; data: { url: string } }>(
      PROFORMAS_ENDPOINTS.v1.previewStyleUrl(templateId)
    )
    return data.data.url
  },

  // POST /proformas/preview-style — PDF de vista previa al vuelo a partir de estilos sin guardar
  // (no persiste nada). Es el mecanismo recomendado para el formulario de edición de plantillas:
  // se llama en cada cambio, con o sin id de plantilla. La generación del PDF puede tardar más
  // que el timeout default del cliente (15s), por eso se sube a 30s; y acepta un AbortSignal
  // para poder cancelar una llamada anterior si el usuario sigue editando.
  getPreviewStylePdf: async (styles: Record<string, unknown>, signal?: AbortSignal): Promise<Blob> => {
    const { data } = await apiClient.post(PROFORMAS_ENDPOINTS.v1.previewStyle, styles, {
      responseType: 'blob',
      timeout: 30000,
      signal,
    })
    return data
  },
}
