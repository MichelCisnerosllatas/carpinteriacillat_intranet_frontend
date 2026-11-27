'use client'

import { useEffect } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { DashboardStoreState } from '../stores/createDashboardStore'
import { toDashboardRequest, useDashboardFiltersStore } from '../stores/useDashboardFiltersStore'

// Hook común de las 5 páginas: escucha los filtros compartidos (periodo, moneda y vendedor)
// y recarga el store del módulo.
export function useDashboardData<T>(useStore: UseBoundStore<StoreApi<DashboardStoreState<T>>>) {
  const filters = useDashboardFiltersStore((s) => s.filters)
  const sellerId = useDashboardFiltersStore((s) => s.sellerId)
  const branchIds = useDashboardFiltersStore((s) => s.branchIds)
  const state = useStore()
  const load = useStore((s) => s.load)

  useEffect(() => {
    const params = toDashboardRequest(filters, sellerId, branchIds)
    if (!params) return
    // Pequeña espera (debounce) para no pedir datos en cada tecla al escribir fechas a mano.
    const timer = window.setTimeout(() => load(params), 400)
    return () => window.clearTimeout(timer)
  }, [filters, sellerId, branchIds, load])

  return { ...state, filters, sellerId, branchIds }
}
