import { create } from 'zustand'
import { clientsService } from '../services/clients.service'
import type { ClientJoinApiItem } from '../model/clientget.dto'

type State = {
  options: ClientJoinApiItem[]
  isLoading: boolean
  isError: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useClientSelectStore = create<State & Action>((set, get) => ({
  options: [],
  isLoading: false,
  isError: false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await clientsService.getList({ per_page: 100, status: 1 })
      if (res.success) {
        set({ options: res.data, isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
