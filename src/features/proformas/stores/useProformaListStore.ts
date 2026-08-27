import { create } from 'zustand'
import { proformasService } from '../services/proformas.service'
import type { ProformaListRequestDto, ProformaJoinApiItem } from '../model/proformaget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Proforma } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Proforma[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProformaListRequestDto
  currentItem: Proforma | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: ProformaListRequestDto) => Promise<boolean>
  loadOne: (id: number) => Promise<boolean>
  setCurrentItem: (item: Proforma | null) => void
  reset: () => void
}

const defaultFilters: ProformaListRequestDto = {
  page: 1,
  per_page: 10,
  search: '',
  status: undefined,
  client_id: undefined,
  date_from: '',
  date_to: '',
}

export const mapProformaFromApi = (item: ProformaJoinApiItem): Proforma => ({
  // El endpoint -join (detalle por id) no siempre trae los ids planos (client_id, template_id,
  // etc.) — solo el objeto anidado (client.id, template.id...). Se usa ese como respaldo, si no,
  // los selects de la cabecera quedan sin valor al editar aunque el resto del formulario cargue bien.
  id: item.id,
  clientId: item.client_id ?? item.client?.id ?? null,
  clientBusinessName: item.client?.business_name ?? null,
  templateId: item.template_id ?? item.template?.id ?? null,
  templateName: item.template?.name ?? null,
  signatureId: item.signature_id ?? item.signature?.id ?? null,
  signerName: item.signature?.signer_name ?? null,
  proformaTypeId: item.proforma_type_id ?? item.proforma_type?.id ?? null,
  proformaTypeCode: item.proforma_type?.code ?? null,
  series: item.series,
  correlative: item.correlative,
  code: item.code,
  issueDate: item.issue_date,
  issueDateFormatted: item.issue_date_formatted,
  dueDate: item.due_date,
  dueDateFormatted: item.due_date_formatted,
  placeOfIssue: item.place_of_issue,
  clientAttention: item.client_attention,
  clientName: item.client_name,
  clientDocument: item.client_document,
  clientAddress: item.client_address,
  companyBusinessName: item.company_business_name,
  companyTradeName: item.company_trade_name,
  companyTaxId: item.company_tax_id,
  companyTaxAddress: item.company_tax_address,
  companyLogo: item.company_logo,
  introText: item.intro_text,
  finalText: item.final_text,
  finalGreeting: item.final_greeting,
  paymentMethod: item.payment_method,
  deliveryTime: item.delivery_time,
  subtotal: Number(item.subtotal),
  tax: Number(item.tax),
  total: Number(item.total),
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
  // Opcional en el DTO: si el backend todavía no manda `notes` en el join, se trata como vacía.
  notes: (item.notes ?? []).map((n) => ({
    id: n.id,
    text: n.text,
    order: n.order,
  })),
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useProformaListStore = create<State & Action>((set, get) => ({
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
      const response = await proformasService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: false,
        message: response.message,
        items: response.data.map(mapProformaFromApi),
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
      const response = await proformasService.getById(id)
      if (!response.success) throw new Error(response.message)
      set({ isFetching: false, currentItem: mapProformaFromApi(response.data) })
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
