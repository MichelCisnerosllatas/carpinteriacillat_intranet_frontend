import { create } from 'zustand'
import { permissionsService } from '../services/permissions.service'
import type { PermissionTreeDto } from '../model/permissiontree.dto'
import { buildKeyIndex, type KeyIndex } from '../lib/permission-tree'

type State = {
  hasLoaded: boolean
  isLoading: boolean
  isError: boolean
  message: string | null
  /** Árbol tal como llega del backend. */
  tree: PermissionTreeDto | null
  /** Índice key → nodo, para aplicar la regla de 'view' al marcar/desmarcar. */
  keyIndex: KeyIndex
}

type Action = {
  /** Carga el árbol una sola vez (casi nunca cambia). force = volver a pedirlo. */
  load: (force?: boolean) => Promise<boolean>
}

export const usePermissionTreeStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isLoading: false,
  isError: false,
  message: null,
  tree: null,
  keyIndex: new Map(),

  load: async (force = false) => {
    if (get().isLoading) return false
    if (get().hasLoaded && !force) return true

    set({ isLoading: true, isError: false, message: null })

    try {
      const response = await permissionsService.getTree()

      if (!response.success) {
        throw new Error(response.message || 'No se pudo cargar el árbol de permisos.')
      }

      set({
        hasLoaded: true,
        isLoading: false,
        tree: response.data,
        keyIndex: buildKeyIndex(response.data.platforms),
      })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar el árbol de permisos.',
      })
      return false
    }
  },
}))
