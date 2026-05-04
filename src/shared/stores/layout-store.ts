import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'
export type SidebarVariant = 'inset' | 'sidebar' | 'floating'

type LayoutState = {
  collapsible: SidebarCollapsible
  variant: SidebarVariant
  setCollapsible: (collapsible: SidebarCollapsible) => void
  setVariant: (variant: SidebarVariant) => void
  reset: () => void
}

const DEFAULT_COLLAPSIBLE: SidebarCollapsible = 'icon'
const DEFAULT_VARIANT: SidebarVariant = 'inset'
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function setBrowserCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${LAYOUT_COOKIE_MAX_AGE}`
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      collapsible: DEFAULT_COLLAPSIBLE,
      variant: DEFAULT_VARIANT,
      setCollapsible: (collapsible) => {
        set({ collapsible })
        setBrowserCookie('layout_collapsible', collapsible)
      },
      setVariant: (variant) => {
        set({ variant })
        setBrowserCookie('layout_variant', variant)
      },
      reset: () => {
        set({ collapsible: DEFAULT_COLLAPSIBLE, variant: DEFAULT_VARIANT })
        setBrowserCookie('layout_collapsible', DEFAULT_COLLAPSIBLE)
        setBrowserCookie('layout_variant', DEFAULT_VARIANT)
      },
    }),
    {
      name: 'layout-settings',
    }
  )
)
