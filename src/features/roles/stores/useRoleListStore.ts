import { create } from 'zustand'
import { rolesService } from '@/features/roles/services/roles.service'
import type { RoleListRequestDto } from '@/features/roles/model/roleget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Role, RoleStatus } from '@/features/roles/data/schema'
import type { RoleType } from '@/entities/role/model/role.type'

type RoleListFilters = RoleListRequestDto

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  roles: Role[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: RoleListFilters
  currentRole: Role | null
}

type Action = {
  load: (params?: RoleListFilters) => Promise<boolean>
  setCurrentRole: (role: Role | null) => void
  reset: () => void
}

const defaultFilters: RoleListFilters = {
  page: 1,
  per_page: 10,
  search: '',
  state: undefined,
  date_from: '',
  date_to: '',
}

const normalizeStatus = (state?: number | null): RoleStatus =>
  state === 1 ? 'active' : 'inactive'

const mapRoleFromApi = (role: RoleType): Role => {
  const status = normalizeStatus(role.role_state)
  return {
    id: role.id_role,
    name: role.role_name,
    description: role.role_description,
    status,
    statusLabel: status === 'active' ? 'Activo' : 'Inactivo',
    createdAt: role.role_created_at,
    updatedAt: role.role_updated_at ?? '',
  }
}

export const useRoleListStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isInitialLoading: false,
  isFetching: false,
  isError: false,
  message: null,
  roles: [],
  links: null,
  meta: null,
  filters: defaultFilters,
  currentRole: null,

  setCurrentRole: (role) => set({ currentRole: role }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }

    set({ filters: nextFilters, isFetching: true, isError: false, message: null })

    try {
      const response = await rolesService.getList(nextFilters)

      if (!response.success) {
        throw new Error(response.message || 'No se pudo cargar la lista de roles.')
      }

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: false,
        message: response.message,
        roles: response.data.map(mapRoleFromApi),
        links: response.links,
        meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })

      return true
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar la lista de roles.'

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: true,
        message,
      })

      return false
    }
  },

  reset: () =>
    set({
      hasLoaded: false,
      isInitialLoading: false,
      isFetching: false,
      isError: false,
      message: null,
      roles: [],
      links: null,
      meta: null,
      filters: defaultFilters,
    }),
}))
