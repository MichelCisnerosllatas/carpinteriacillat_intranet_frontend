import { create } from 'zustand'
import { getPresetRange, isValidRange, type DashboardFiltersValue } from '@/shared/ui/dashboard'
import type { DashboardRequestDto } from '../model/dashboard-common.dto'

// Filtros COMPARTIDOS por los 5 dashboards: si el usuario elige "Últimos 90 días" en el Resumen
// y luego entra a Rendimiento de ventas, ve el mismo periodo sin volver a elegirlo.
type State = {
  filters: DashboardFiltersValue
  /**
   * Vendedor elegido (null = todos). Solo se muestra el selector a quien tiene `sales.view_all`;
   * sin ese permiso el backend ya devuelve únicamente las ventas propias.
   */
  sellerId: number | null
  /**
   * Sucursales elegidas ([] = todas las que el usuario puede ver). Solo se muestra el filtro si
   * puede ver más de una; el backend recorta igual a sus sucursales (BranchScope).
   */
  branchIds: number[]
}

type Action = {
  setFilters: (filters: DashboardFiltersValue) => void
  setSellerId: (sellerId: number | null) => void
  setBranchIds: (branchIds: number[]) => void
  reset: () => void
}

const defaultFilters = (): DashboardFiltersValue => ({
  preset: 'this_month',
  currency: 'PEN',
  ...getPresetRange('this_month'),
})

export const useDashboardFiltersStore = create<State & Action>((set) => ({
  filters: defaultFilters(),
  sellerId: null,
  branchIds: [],
  setFilters: (filters) => set({ filters }),
  setSellerId: (sellerId) => set({ sellerId }),
  setBranchIds: (branchIds) => set({ branchIds }),
  reset: () => set({ filters: defaultFilters(), sellerId: null, branchIds: [] }),
}))

// Convierte los filtros de la UI al formato del API. Devuelve null si el rango personalizado
// todavía está incompleto (así no se dispara una petición inválida mientras el usuario escribe).
export function toDashboardRequest(
  filters: DashboardFiltersValue,
  sellerId: number | null = null,
  branchIds: number[] = []
): DashboardRequestDto | null {
  if (!isValidRange(filters)) return null
  return {
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    currency: filters.currency,
    // null no se envía: el backend lo interpreta como "todos" (o "mis ventas" sin view_all).
    ...(sellerId ? { user_id: sellerId } : {}),
    // [] no se envía: el backend lo interpreta como "todas las sucursales que puede ver".
    ...(branchIds.length ? { branch_ids: branchIds } : {}),
  }
}
