import apiClient from '@/shared/api/apiClient'
import { REPORTS_ENDPOINTS } from './reports.endpoint'
import type {
  ReportDetailResponseDto,
  ReportKey,
  ReportRequestDto,
  ReportResponseDto,
} from '../model/report.dto'

// Quita filtros vacíos (cliente "Todos", estado "Todos") para no mandar client_id= al backend.
function cleanParams(params: ReportRequestDto) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

// Lee el nombre de archivo de la cabecera Content-Disposition, ej.:
//   attachment; filename="sales-register_2026-11-01_2026-11-18.xlsx"
//   attachment; filename*=UTF-8''sales-register_2026-11-01_2026-11-18.xlsx
// OJO: el navegador solo deja leer esa cabecera si el backend la expone por CORS
// (Access-Control-Expose-Headers: Content-Disposition); si no, se usa el nombre por defecto.
function getFileName(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
  if (utf8?.[1]) return decodeURIComponent(utf8[1].trim())
  const plain = /filename="?([^";]+)"?/i.exec(contentDisposition)
  return plain?.[1]?.trim() || fallback
}

export const reportsService = {
  get: async (report: ReportKey, params: ReportRequestDto): Promise<ReportResponseDto> => {
    const { data } = await apiClient.get<ReportResponseDto>(REPORTS_ENDPOINTS.v1.get(report), {
      params: cleanParams({ ...params, format: 'json' }),
    })
    return data
  },

  // Detalle de UNA fila (se pide recién cuando el usuario la expande). Se envían los mismos
  // filtros por si el backend los usa (ej. las ventas del cliente dentro del periodo).
  getDetail: async (report: ReportKey, id: number, params: ReportRequestDto): Promise<ReportDetailResponseDto> => {
    const { data } = await apiClient.get<ReportDetailResponseDto>(REPORTS_ENDPOINTS.v1.detail(report, id), {
      params: cleanParams(params),
    })
    return data
  },

  // Descarga Excel/PDF: se pide como blob (binario) porque la respuesta NO es JSON.
  download: async (
    report: ReportKey,
    params: ReportRequestDto,
    format: 'xlsx' | 'pdf'
  ): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get<Blob>(REPORTS_ENDPOINTS.v1.get(report), {
      params: cleanParams({ ...params, format }),
      responseType: 'blob',
      // Los reportes grandes (hasta 5000 filas en PDF) pueden tardar más que el timeout normal.
      timeout: 120000,
    })
    const fallback = `${report}_${params.date_from}_${params.date_to}.${format}`
    const header = response.headers['content-disposition'] as string | undefined
    return { blob: response.data, fileName: getFileName(header, fallback) }
  },
}

// Cuando una descarga falla, el backend responde un JSON de error, pero como pedimos
// responseType 'blob' llega como Blob: hay que leerlo como texto para obtener el mensaje.
export async function getBlobErrorMessage(error: unknown): Promise<string> {
  const axiosError = error as { response?: { data?: unknown }; message?: string } | null
  const data = axiosError?.response?.data
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text())
      if (json?.message) return json.message
    } catch {
      // No era JSON: se usa el mensaje genérico de abajo.
    }
  }
  return axiosError?.message ?? 'No se pudo descargar el archivo.'
}
