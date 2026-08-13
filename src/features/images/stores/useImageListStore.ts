import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import { getImageUrl } from '../lib/image-url'
import type { ImageListRequestDto, ImageApiItem } from '../model/imageget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ImageItem } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ImageItem[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ImageListRequestDto
  currentItem: ImageItem | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: ImageListRequestDto) => Promise<boolean>
  setCurrentItem: (item: ImageItem | null) => void
  reset: () => void
}

// per_page alto a propósito: el filtrado por carpeta en ImagesGrid se hace en el
// cliente sobre la página cargada, así que necesita traer prácticamente todo de una
// vez para que el filtro no "pierda" imágenes que quedaron en otra página del server.
const defaultFilters: ImageListRequestDto = { page: 1, per_page: 100 }

// El back ya devuelve las imágenes más recientes primero (created_at desc) — este
// sort es solo una red de seguridad para que, si algo cambia server-side, el orden
// visible siga siendo el mismo. Ojo: createdAt viene de `created_at` (el timestamp
// real); el campo `image_created_at` casi siempre llega null, no usar ese para esto.
const sortNewestFirst = (items: ImageItem[]) =>
  [...items].sort((a, b) => {
    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return a.createdAt < b.createdAt ? 1 : -1
    }
    return b.id - a.id
  })

const mapFromApi = (item: ImageApiItem): ImageItem => ({
  id: item.id_image,
  name: item.image_name,
  title: item.image_title,
  alt: item.image_alt,
  patch: item.image_patch,
  url: getImageUrl(item.image_patch),
  type: item.image_type,
  size: item.image_size,
  width: item.image_width,
  height: item.image_height,
  createdAt: item.created_at ?? item.image_created_at,
  updatedAt: item.updated_at ?? item.image_updated_at,
})

export const useImageListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await imagesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: sortNewestFirst(response.data.map(mapFromApi)),
        links: response.links, meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  reset: () => set({
    hasLoaded: false, isInitialLoading: false, isFetching: false,
    isError: false, message: null, items: [], links: null, meta: null,
    filters: defaultFilters,
  }),
}))
