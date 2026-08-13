import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Preferencias de vista de /images que conviene recordar entre sesiones —
// hoy solo si el sidebar de carpetas está contraído (mismo patrón que useLayoutStore).
type State = {
  folderSidebarCollapsed: boolean
  setFolderSidebarCollapsed: (collapsed: boolean) => void
}

export const useImagesViewStore = create<State>()(
  persist(
    (set) => ({
      folderSidebarCollapsed: false,
      setFolderSidebarCollapsed: (collapsed) => set({ folderSidebarCollapsed: collapsed }),
    }),
    { name: 'images-view-settings' },
  )
)
