// src/features/furnitures/stores/useFurnitureListStore.ts
import { create } from 'zustand'
import { furnituresService } from '../services/furnitures.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { FurnitureListRequestDto } from '../model/furnitureget.dto'
import type { FurnitureJoinApiItem } from '../model/furniture-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { FurnitureWebApiItem } from '../model/furniture-web.dto'
import type { Furniture, FurnitureWeb } from '../data/schema'
import { buildImageUrl } from '@/shared/lib/images'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Furniture[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: FurnitureListRequestDto
  currentItem: Furniture | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: FurnitureListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: Furniture | null) => void
  reset: () => void
}

const defaultFilters: FurnitureListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

// Convierte el objeto `web` del backend (nombres largos) a uno simple para la UI.
const mapWebFromApi = (web: FurnitureWebApiItem | null | undefined): FurnitureWeb | null => {
  if (!web) return null
  return {
    id: web.id_furniture_web,
    title: web.furnitureweb_title,
    style: web.furnitureweb_style,
    measures: web.furnitureweb_measures,
    finish: web.furnitureweb_finish,
    buildTime: web.furnitureweb_build_time,
    location: web.furnitureweb_location,
    // El backend puede mandar "2026-05-10" o con hora; el input date solo entiende YYYY-MM-DD.
    deliveredAt: web.furnitureweb_delivered_at ? web.furnitureweb_delivered_at.slice(0, 10) : null,
    // Los decimal de Laravel pueden llegar como string, por eso Number().
    priceApprox: web.furnitureweb_price_approx != null ? Number(web.furnitureweb_price_approx) : null,
    order: web.furnitureweb_order,
    state: web.furnitureweb_state,
  }
}

const mapFromApi = (item: FurnitureJoinApiItem): Furniture => {
  const stateOpt = getStateOption(item.furniture_state)
  const web = mapWebFromApi(item.web)
  return {
    id: item.id_furniture,
    name: item.furniture_name,
    title: item.furniture_title ?? null,
    description: item.furniture_description,
    largo: item.furniture_largo !== null && item.furniture_largo !== undefined ? Number(item.furniture_largo) : null,
    ancho: item.furniture_ancho !== null && item.furniture_ancho !== undefined ? Number(item.furniture_ancho) : null,
    idCategory: item.category?.id_category ?? 0,
    categoryName: item.category?.category_name ?? '',
    idTypecolor: item.type_color?.id_typecolor ?? 0,
    typecolorName: item.type_color?.typecolor_name ?? '',

    idTypewood: item.type_wood?.id_typewood ?? 0,
    typewoodName: item.type_wood?.typewood_name ?? '',

    idImage: item.images?.id_image ?? null,
    imageName: item.images?.image_name ?? null,
    imageUrl: buildImageUrl(item.images?.image_patch ?? null),
    galleryImages: (item.gallery_images ?? []).map((g) => ({
      id: g.id_furniture_image,
      imageId: g.image?.id_image ?? 0,
      imageUrl: buildImageUrl(g.image?.image_patch ?? null),
      imageName: g.image?.image_name ?? null,
      caption: g.web?.furnitureimageweb_caption ?? null,
      variant: g.web?.furnitureimageweb_variant ?? null,
    })),
    web,
    isPublishedOnWeb: web?.state === 1,
    // Portada en la tarjeta de su categoría (carrusel «Muebles a medida»)
    categoryCard: item.category_card
      ? { showCover: item.category_card.show_cover, idSection: item.category_card.id_section, categoryName: item.category_card.category_name }
      : null,
    // Tarjeta en «Restauración» (comparador antes/después)
    restorationCard: item.restoration_card
      ? { show: item.restoration_card.show, idSection: item.restoration_card.id_section, hasBeforeAfter: item.restoration_card.has_before_after }
      : null,
    status: item.furniture_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.furniture_state,
    createdAt: item.furniture_created_at,
    updatedAt: item.furniture_updated_at ?? '',
  }
}

export const useFurnitureListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await furnituresService.getById(id)
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
      const response = await furnituresService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, 
        isInitialLoading: false, 
        isFetching: false, 
        isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ 
        hasLoaded: true, 
        isInitialLoading: false, 
        isFetching: false, 
        isError: true, 
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' 
      })
      return false
    }
  },

  reset: () => set({ 
    hasLoaded: false, 
    isInitialLoading: false, 
    isFetching: false, 
    isError: false, 
    message: null, 
    items: [], 
    links: null, 
    meta: null, 
    filters: defaultFilters 
  }),
}))
