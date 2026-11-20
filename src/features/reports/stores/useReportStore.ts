import { create } from 'zustand'
import { getPresetRange, isValidRange, type DashboardFiltersValue } from '@/shared/ui/dashboard'
import { saveFile } from '@/shared/lib/save-file'
import { getBlobErrorMessage, reportsService } from '../services/reports.service'
import { getTabReport, REPORTS, type PaymentsView, type ReportTab } from '../data/reports.config'
import type { ReportDataDto, ReportKey, ReportRequestDto } from '../model/report.dto'

const MIME_TYPES = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
} as const

type State = {
  tab: ReportTab
  paymentsView: PaymentsView
  /** Rango y moneda: los comparten TODAS las pestañas. */
  filters: DashboardFiltersValue
  /** Cliente elegido: se conserva entre pestañas (solo se envía si el reporte lo usa). */
  clientId: number | null
  /** Estado elegido: cambia por reporte, así que se limpia al cambiar de pestaña. */
  status: string | null
  data: ReportDataDto | null
  isFetching: boolean
  isError: boolean
  message: string | null
  exporting: 'xlsx' | 'pdf' | null
}

type Action = {
  setTab: (tab: ReportTab) => void
  setPaymentsView: (view: PaymentsView) => void
  setFilters: (filters: DashboardFiltersValue) => void
  setClientId: (clientId: number | null) => void
  setStatus: (status: string | null) => void
  load: () => Promise<boolean>
  exportFile: (format: 'xlsx' | 'pdf') => Promise<boolean>
}

const defaultFilters = (): DashboardFiltersValue => ({
  preset: 'this_month',
  currency: 'PEN',
  ...getPresetRange('this_month'),
})

// Reporte del backend que corresponde a lo que se ve en pantalla (pestaña + toggle de Pagos).
export function selectActiveReport(state: Pick<State, 'tab' | 'paymentsView'>): ReportKey {
  return getTabReport(state.tab, state.paymentsView)
}

// Arma los parámetros del API. Cliente y estado solo se envían si el reporte los usa.
export function buildReportParams(state: State): ReportRequestDto {
  const config = REPORTS[selectActiveReport(state)]
  return {
    date_from: state.filters.dateFrom,
    date_to: state.filters.dateTo,
    currency: state.filters.currency,
    client_id: config.usesClient ? state.clientId : null,
    status: config.statusOptions ? state.status : null,
  }
}

// Cada consulta lleva un número: si llega una respuesta vieja (el usuario cambió de pestaña
// o de filtro mientras cargaba) se descarta, así nunca se pinta un reporte que no corresponde.
let lastRequestId = 0

export const useReportStore = create<State & Action>((set, get) => ({
  tab: 'ventas',
  paymentsView: 'recibidos',
  filters: defaultFilters(),
  clientId: null,
  status: null,
  data: null,
  isFetching: false,
  isError: false,
  message: null,
  exporting: null,

  setTab: (tab) => {
    if (get().tab === tab) return
    set({ tab, status: null, data: null, isError: false, message: null })
  },
  setPaymentsView: (paymentsView) => {
    if (get().paymentsView === paymentsView) return
    set({ paymentsView, status: null, data: null, isError: false, message: null })
  },
  setFilters: (filters) => set({ filters }),
  setClientId: (clientId) => set({ clientId }),
  setStatus: (status) => set({ status }),

  load: async () => {
    const state = get()
    if (!isValidRange(state.filters)) return false
    const report = selectActiveReport(state)
    const requestId = ++lastRequestId

    set({ isFetching: true, isError: false, message: null })
    try {
      const response = await reportsService.get(report, buildReportParams(state))
      if (!response.success) throw new Error(response.message)
      if (requestId !== lastRequestId) return false
      set({ data: response.data, isFetching: false })
      return true
    } catch (error: any) {
      if (requestId !== lastRequestId) return false
      set({
        isFetching: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'No se pudo generar el reporte.',
      })
      return false
    }
  },

  // Exportar NO depende de lo que se ve: el backend genera el archivo con los filtros actuales.
  exportFile: async (format) => {
    const state = get()
    if (!isValidRange(state.filters)) return false
    const report = selectActiveReport(state)
    set({ exporting: format })
    try {
      const { blob, fileName } = await reportsService.download(report, buildReportParams(state), format)
      await saveFile(blob, fileName, MIME_TYPES[format])
      set({ exporting: null })
      return true
    } catch (error: any) {
      set({ exporting: null, message: await getBlobErrorMessage(error) })
      return false
    }
  },
}))
