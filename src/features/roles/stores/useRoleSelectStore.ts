import { create } from 'zustand'
import { rolesService } from '../services/roles.service'
import type { RoleType } from '@/entities/role/model/role.type'

type State = {
  options:   RoleType[]
  isLoading: boolean
  isError:   boolean
  hasLoaded: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useRoleSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,
  hasLoaded: false,

  load: async () => {
    if (get().isLoading || get().hasLoaded) return
    set({ isLoading: true, isError: false })
    try {
      const res = await rolesService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.role_state === 1), isLoading: false, hasLoaded: true })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
