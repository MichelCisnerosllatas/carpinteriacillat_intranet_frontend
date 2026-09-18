import { create } from 'zustand'
import { sectionImagesService } from '../services/sectionimages.service'
import { getStateOption } from '@/shared/config/entity-states'
import { buildImageUrl } from '@/shared/lib/images'
import type { SectionImageListRequestDto, SectionImageJoinApiItem } from '../model/sectionimageget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SectionImage } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SectionImage[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SectionImageListRequestDto
  currentItem: SectionImage | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SectionImageListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: SectionImage | null) => void
  reset: () => void
}

const defaultFilters: SectionImageListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: SectionImageJoinApiItem): SectionImage => {
  const stateOpt = getStateOption(item.sectionimage_state)
  return {
    id: item.id_section_image,
    // El endpoint `_join` (el único que usa este módulo, para lista y detalle) NO trae
    // `id_section`/`id_image` a nivel raíz — solo existen anidados dentro de `section`/`image`.
    // Leerlos como `item.id_section`/`item.id_image` daba siempre `undefined`.
    idSection: item.section?.id_section ?? 0,
    sectionName: item.section?.section_name ?? '',
    idImage: item.image?.id_image ?? 0,
    imageName: item.image?.image_name ?? '',
    imageUrl: buildImageUrl(item.image?.image_patch) ?? '',
    objectFit: item.sectionimage_fix ?? null,
    order: item.sectionimage_order ?? null,
    status: item.sectionimage_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.sectionimage_state,
    createdAt: item.sectionimage_created_at,
    updatedAt: item.sectionimage_updated_at ?? '',
    createdAtFormatted: item.sectionimage_created_at_format ?? null,
    updatedAtFormatted: item.sectionimage_updated_at_format ?? null,
  }
}

export const useSectionImageListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await sectionImagesService.getById(id)
      if (!response.success) throw new Error(response.message)
      const mapped = mapFromApi(response.data)
      set({ isFetching: false, currentItem: mapped, hasLoaded: true })
      return true
    } catch (error: any) {
      set({ isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await sectionImagesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
