import { create } from 'zustand'
import { productsServicesService } from '../services/products-services.service'
import type { ProductServiceApiItem } from '../model/productserviceget.dto'

type State = {
  options:   ProductServiceApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

// Usada por proformas para armar las líneas de detalle (productos/servicios facturables).
export const useProductServiceSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await productsServicesService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.status === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
