import { create } from 'zustand'
import { salesService } from '../services/sales.service'
import type { SaleListRequestDto, SaleJoinApiItem } from '../model/saleget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Sale } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Sale[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SaleListRequestDto
  currentItem: Sale | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SaleListRequestDto) => Promise<boolean>
  loadOne: (id: number) => Promise<boolean>
  setCurrentItem: (item: Sale | null) => void
  reset: () => void
}

const defaultFilters: SaleListRequestDto = {
  page: 1,
  per_page: 10,
  search: '',
  status: undefined,
  payment_status: undefined,
  client_id: undefined,
  date_from: '',
  date_to: '',
}

export const mapSaleFromApi = (item: SaleJoinApiItem): Sale => ({
  // El endpoint -join (detalle por id) no siempre trae los ids planos (client_id,
  // sale_document_type_id) — solo el objeto anidado (client.id, sale_document_type.id...). Se usa
  // ese como respaldo, si no, los selects de la cabecera quedan sin valor al editar aunque el
  // resto del formulario cargue bien (mismo criterio que proformas).
  id: item.id,
  clientId: item.client_id ?? item.client?.id ?? null,
  clientBusinessName: item.client?.business_name ?? null,
  saleDocumentTypeId: item.sale_document_type_id ?? item.sale_document_type?.id ?? null,
  saleDocumentTypeName: item.sale_document_type?.name ?? null,
  saleDocumentTypeCode: item.sale_document_type?.code ?? null,
  series: item.series,
  correlative: item.correlative,
  code: item.code,
  issueDate: item.issue_date,
  issueDateFormatted: item.issue_date_formatted,
  dueDate: item.due_date,
  dueDateFormatted: item.due_date_formatted,
  isTaxed: item.is_taxed,
  igvRateApplied: item.igv_rate_applied !== null ? Number(item.igv_rate_applied) : null,
  paymentMethod: item.payment_method,
  subtotal: Number(item.subtotal),
  tax: Number(item.tax),
  total: Number(item.total),
  amountPaid: Number(item.amount_paid),
  balance: Number(item.balance),
  paymentStatus: item.payment_status,
  currency: item.currency,
  status: item.status,
  observation: item.observation,
  details: (item.details ?? []).map((d) => ({
    id: d.id,
    productServiceId: d.product_service_id,
    description: d.description,
    unit: d.unit,
    quantity: Number(d.quantity),
    unitPrice: Number(d.unit_price),
    subtotal: Number(d.subtotal),
    tax: d.tax !== null ? Number(d.tax) : null,
    total: Number(d.total),
    order: d.order,
  })),
  payments: (item.payments ?? []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    paymentDate: p.payment_date,
    paymentMethod: p.payment_method,
    observation: p.observation,
  })),
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useSaleListStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isInitialLoading: false,
  isFetching: false,
  isError: false,
  message: null,
  items: [],
  links: null,
  meta: null,
  filters: defaultFilters,
  currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await salesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: false,
        message: response.message,
        items: response.data.map(mapSaleFromApi),
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
      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  loadOne: async (id) => {
    set({ isFetching: true, isError: false, message: null })
    try {
      const response = await salesService.getById(id)
      if (!response.success) throw new Error(response.message)
      set({ isFetching: false, currentItem: mapSaleFromApi(response.data) })
      return true
    } catch (error: any) {
      set({
        isFetching: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
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
      items: [],
      links: null,
      meta: null,
      filters: defaultFilters,
    }),
}))
