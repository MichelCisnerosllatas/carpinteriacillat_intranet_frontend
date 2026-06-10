import { create } from 'zustand'
import { userService } from '@/features/users/services/user.service'
import type { userGetRequestDto } from '@/features/users/model/userget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { User, UserRole, UserStatus } from '@/features/users/data/schema'
import { UserJoinType } from '@/shared/type/user/userjoin.type'

type UserListFilters = userGetRequestDto

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  message: string | null
  users: User[]
  rawUsers: UserJoinType[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: UserListFilters
}

type Action = {
  load: (params?: UserListFilters) => Promise<boolean>
  reset: () => void
}

const defaultFilters: UserListFilters = {
  page: 1,
  per_page: 10,
  search: '',
  state: undefined,
  role: undefined,
  date_from: '',
  date_to: '',
}

const normalizeRole = (roleName?: string | null): UserRole => {
  const role = (roleName ?? '').toLowerCase()

  if (role.includes('super')) return 'superadmin'
  if (role.includes('admin')) return 'admin'
  if (role.includes('caj')) return 'cashier'
  if (role.includes('manager') || role.includes('ger')) return 'manager'

  return 'admin'
}

const normalizeStatus = (state?: number | null): UserStatus => {
  return state === 1 ? 'active' : 'inactive'
}

const mapUserFromApi = (user: UserJoinType): User => {
  const firstName = user.person?.person_name ?? ''
  const lastName = user.person?.person_lastname ?? ''
  const status = normalizeStatus(user.user_state)

  return {
    // IDs ocultos
    id: user.id,
    idPerson: user.person?.id_person ?? null,
    idRole: user.role?.id_rol ?? null,
    idTypeDoc: user.person?.id_typedoc ?? null,

    // Datos
    firstName,
    lastName,
    username: `${firstName} ${lastName}`.trim() || user.email,
    email: user.email,

    // Documento
    typeDocName: user.person?.type_doc?.typedoc_name ?? 'Sin documento',
    documentNumber: user.person?.person_numdoc ?? '-',

    // Foto por defecto
    photoUrl: null,

    // Estado
    status,
    statusLabel: status === 'active' ? 'Activo' : 'Inactivo',

    // Rol
    role: normalizeRole(user.role?.role_name),
    roleLabel: user.role?.role_name ?? 'Sin rol',

    // Fechas dinámicas
    createdAt: user.user_created_at_format ?? user.user_created_at,
    updatedAt: user.user_updated_at_format ?? user.user_updated_at,
  }
}

export const useUsuarioListStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isInitialLoading: false,
  isFetching: false,
  message: null,
  users: [],
  rawUsers: [],
  links: null,
  meta: null,
  filters: defaultFilters,

  load: async (params = {}) => {
    const nextFilters = {
      ...get().filters,
      ...params,
    }

    const isFirstLoad = !get().hasLoaded

    set({
      filters: nextFilters,
      isInitialLoading: isFirstLoad,
      isFetching: true,
      message: null,
    })

    try {
      const response = await userService.get(nextFilters)

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        message: response.message,
        rawUsers: response.data,
        users: response.data.map(mapUserFromApi),
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
      const message = error?.response?.data?.message ?? 'No se pudo cargar la lista de usuarios.'

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        message,
      })

      return false
    }
  },

  reset: () => {
    set({
      hasLoaded: false,
      isInitialLoading: false,
      isFetching: false,
      message: null,
      users: [],
      rawUsers: [],
      links: null,
      meta: null,
      filters: defaultFilters,
    })
  },
}))

// import { create } from 'zustand'
//
// type State = {
//   isload: boolean
//   isloading: boolean
//   message: string | null | undefined
//   userdata: null
// }
//
// type Action = {
//   load: () => Promise<boolean>
//   reset: () => void
// }
//
// export const useUsuarioListStore = create<State & Action>((set) => ({
//   isload: false,
//   isloading: false,
//   message: null,
//   userdata: null,
//
//   load: async () => {
//     set({
//       isload: true,
//       isloading: true,
//       message: null,
//     })
//
//     return true;
//   },
//
//   reset: () => {
//     set({
//       isload: false,
//       isloading: false,
//       message: null,
//       userdata: null,
//     })
//   },
// }))