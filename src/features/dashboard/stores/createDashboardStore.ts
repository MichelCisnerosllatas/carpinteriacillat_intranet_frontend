import { create } from 'zustand'
import type { DashboardApiResponse, DashboardRequestDto } from '../model/dashboard-common.dto'

// Los 5 dashboards se cargan exactamente igual (GET con filtros → guardar data), así que en vez
// de copiar el mismo store 5 veces usamos esta "fábrica" y creamos un store por módulo.
export type DashboardStoreState<T> = {
  hasLoaded: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  data: T | null
  lastParams: DashboardRequestDto | null
  load: (params: DashboardRequestDto) => Promise<boolean>
  reload: () => Promise<boolean>
  reset: () => void
}

export function createDashboardStore<T>(
  fetcher: (params: DashboardRequestDto) => Promise<DashboardApiResponse<T>>
) {
  // Contador de peticiones: si el usuario cambia el filtro rápido, solo se guarda la respuesta
  // de la ÚLTIMA petición (una respuesta lenta anterior no debe pisar a la nueva).
  let lastRequestId = 0

  return create<DashboardStoreState<T>>((set, get) => ({
    hasLoaded: false,
    isFetching: false,
    isError: false,
    message: null,
    data: null,
    lastParams: null,

    load: async (params) => {
      const requestId = ++lastRequestId
      set({ isFetching: true, isError: false, lastParams: params })
      try {
        const response = await fetcher(params)
        if (!response.success) throw new Error(response.message)
        if (requestId !== lastRequestId) return false
        set({ hasLoaded: true, isFetching: false, isError: false, message: response.message, data: response.data })
        return true
      } catch (error: any) {
        if (requestId !== lastRequestId) return false
        set({
          hasLoaded: true,
          isFetching: false,
          isError: true,
          message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar el dashboard.',
        })
        return false
      }
    },

    reload: async () => {
      const params = get().lastParams
      return params ? get().load(params) : false
    },

    reset: () => set({ hasLoaded: false, isFetching: false, isError: false, message: null, data: null, lastParams: null }),
  }))
}
