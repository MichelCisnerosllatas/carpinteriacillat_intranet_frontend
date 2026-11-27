import { create } from 'zustand'
import { permissionsService } from '../services/permissions.service'
import { applyToggle } from '../lib/permission-tree'
import { usePermissionTreeStore } from './usePermissionTreeStore'

type State = {
  /** Rol que se está editando (null = ninguno elegido). */
  roleId: number | null
  roleName: string
  /** true = rol del sistema (superadmin): sus permisos no se editan. */
  isSystem: boolean
  /** Keys completas tal como están guardadas en el backend. */
  originalKeys: string[]
  /** Keys completas marcadas ahora en pantalla (pueden tener cambios sin guardar). */
  selectedKeys: string[]
  isLoading: boolean
  isError: boolean
  message: string | null
  isSaving: boolean
}

type Action = {
  load: (roleId: number) => Promise<boolean>
  /** Marca/desmarca varias keys a la vez (aplica la regla de 'view'). */
  toggleKeys: (keys: string[], checked: boolean) => void
  /** Reemplaza TODAS las keys de una plataforma (se usa al copiar de la otra plataforma). */
  replacePlatformKeys: (platform: string, keys: string[]) => void
  /** Vuelve a lo guardado. */
  discard: () => void
  /** PUT con TODAS las keys marcadas de las dos plataformas. */
  save: () => Promise<{ ok: boolean; message: string }>
  reset: () => void
}

const initialState: State = {
  roleId: null,
  roleName: '',
  isSystem: false,
  originalKeys: [],
  selectedKeys: [],
  isLoading: false,
  isError: false,
  message: null,
  isSaving: false,
}

export const useRolePermissionsStore = create<State & Action>((set, get) => ({
  ...initialState,

  load: async (roleId) => {
    set({ ...initialState, roleId, isLoading: true })

    try {
      const response = await permissionsService.getRolePermissions(roleId)

      // Si mientras cargaba se eligió otro rol, se ignora esta respuesta.
      if (get().roleId !== roleId) return false

      if (!response.success) {
        throw new Error(response.message || 'No se pudieron cargar los permisos del rol.')
      }

      // Solo se usan las keys que existen en el árbol (por si quedó alguna antigua en la BD).
      const keyIndex = usePermissionTreeStore.getState().keyIndex
      const keys = keyIndex.size > 0
        ? response.data.permissions.filter((key) => keyIndex.has(key))
        : response.data.permissions

      set({
        isLoading: false,
        roleName: response.data.role_name,
        isSystem: response.data.role_is_system === 1,
        originalKeys: keys,
        selectedKeys: keys,
      })
      return true
    } catch (error: any) {
      if (get().roleId !== roleId) return false
      set({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'No se pudieron cargar los permisos del rol.',
      })
      return false
    }
  },

  toggleKeys: (keys, checked) => {
    if (get().isSystem) return
    const keyIndex = usePermissionTreeStore.getState().keyIndex
    set({ selectedKeys: applyToggle(get().selectedKeys, keys, checked, keyIndex) })
  },

  replacePlatformKeys: (platform, keys) => {
    if (get().isSystem) return
    // Se quitan las keys de esa plataforma y se ponen las nuevas; la otra plataforma no cambia.
    const others = get().selectedKeys.filter((key) => !key.startsWith(`${platform}.`))
    set({ selectedKeys: [...others, ...keys] })
  },

  discard: () => set({ selectedKeys: get().originalKeys }),

  save: async () => {
    const { roleId, selectedKeys, isSystem } = get()
    if (!roleId || isSystem) return { ok: false, message: 'Este rol no se puede editar.' }

    set({ isSaving: true })

    try {
      const response = await permissionsService.putRolePermissions(roleId, { permissions: selectedKeys })

      if (!response.success) {
        set({ isSaving: false })
        return { ok: false, message: response.message || 'No se pudieron guardar los permisos.' }
      }

      // Lo que devuelve el backend pasa a ser "lo guardado".
      const saved = response.data?.permissions ?? selectedKeys
      set({ isSaving: false, originalKeys: saved, selectedKeys: saved })
      return { ok: true, message: response.message || 'Permisos actualizados.' }
    } catch (error: any) {
      set({ isSaving: false })
      const data = error?.response?.data
      // Si vino un 422, se muestra el primer error de validación.
      const fieldErrors = data?.errors as Record<string, string[]> | undefined
      const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0]?.[0] : undefined
      return {
        ok: false,
        message: firstFieldError ?? data?.message ?? error?.message ?? 'No se pudieron guardar los permisos.',
      }
    }
  },

  reset: () => set(initialState),
}))
