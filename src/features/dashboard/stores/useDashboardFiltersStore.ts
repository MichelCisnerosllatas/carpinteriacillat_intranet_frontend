import { create } from 'zustand'
import { getPresetRange, isValidRange, type DashboardFiltersValue } from '@/shared/ui/dashboard'
import type { DashboardRequestDto } from '../model/dashboard-common.dto'

// Filtros COMPARTIDOS por los 5 dashboards: si el usuario elige "Últimos 90 días" en el Resumen
// y luego entra a Rendimiento de ventas, ve el mismo periodo sin volver a elegirlo.
type State = {
  filters: DashboardFiltersValue
}

type Action = {
  setFilters: (filters: DashboardFiltersValue) => void
  reset: () => void
}

const defaultFilters = (): DashboardFiltersValue => ({
  preset: 'this_month',
  currency: 'PEN',
  ...getPresetRange('this_month'),
})

export const useDashboardFiltersStore = create<State & Action>((set) => ({
  filters: defaultFilters(),
  setFilters: (filters) => set({ filters }),
  reset: () => set({ filters: defaultFilters() }),
}))

// Convierte los filtros de la UI al formato del API. Devuelve null si el rango personalizado
// todavía está incompleto (así no se dispara una petición inválida mientras el usuario escribe).
export function toDashboardRequest(filters: DashboardFiltersValue): DashboardRequestDto | null {
  if (!isValidRange(filters)) return null
  return { date_from: filters.dateFrom, date_to: filters.dateTo, currency: filters.currency }
}
