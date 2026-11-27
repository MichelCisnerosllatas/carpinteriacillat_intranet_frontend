import { create } from 'zustand'
import { reportsService } from '../services/reports.service'
import type { ReportDetailDto, ReportKey, ReportRequestDto } from '../model/report.dto'

export type ReportDetailEntry = {
  isLoading: boolean
  isError: boolean
  message: string | null
  data: ReportDetailDto | null
}

type State = {
  /** Detalles ya pedidos, por clave "reporte:id". Así, cerrar y volver a abrir una fila no repite la petición. */
  details: Record<string, ReportDetailEntry>
}

type Action = {
  /** Pide el detalle solo si todavía no se tiene (carga perezosa al expandir la fila). */
  loadDetail: (report: ReportKey, id: number, params: ReportRequestDto) => Promise<void>
  /** Se llama cada vez que se recarga el reporte: los detalles guardados pueden haber cambiado. */
  clear: () => void
}

export const detailKey = (report: ReportKey, id: number) => `${report}:${id}`

export const useReportDetailStore = create<State & Action>((set, get) => ({
  details: {},

  loadDetail: async (report, id, params) => {
    const key = detailKey(report, id)
    const current = get().details[key]
    if (current?.isLoading || current?.data) return

    const setEntry = (entry: ReportDetailEntry) => set((state) => ({ details: { ...state.details, [key]: entry } }))

    setEntry({ isLoading: true, isError: false, message: null, data: null })
    try {
      const response = await reportsService.getDetail(report, id, params)
      if (!response.success) throw new Error(response.message)
      setEntry({ isLoading: false, isError: false, message: null, data: response.data })
    } catch (error: any) {
      setEntry({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar el detalle.',
        data: null,
      })
    }
  },

  clear: () => set({ details: {} }),
}))
