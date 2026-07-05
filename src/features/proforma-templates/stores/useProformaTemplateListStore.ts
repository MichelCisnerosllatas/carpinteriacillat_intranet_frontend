import { create } from 'zustand'
import { proformaTemplatesService } from '../services/proforma-templates.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { ProformaTemplateListRequestDto } from '../model/proformatemplateget.dto'
import type { ProformaTemplateJoinApiItem } from '../model/proformatemplate-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaTemplate } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProformaTemplate[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProformaTemplateListRequestDto
  currentItem: ProformaTemplate | null
}

type Action = {
  load: (params?: ProformaTemplateListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: ProformaTemplate | null) => void
  reset: () => void
}

const defaultFilters: ProformaTemplateListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined, proforma_type_id: undefined,
}

export const mapProformaTemplateFromApi = (item: ProformaTemplateJoinApiItem): ProformaTemplate => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    proformaTypeId: item.proforma_type_id,
    proformaTypeName: item.proforma_type?.name ?? null,
    proformaTypeCode: item.proforma_type?.code ?? null,
    name: item.name,
    colorPrimary: item.color_primary,
    colorSecondary: item.color_secondary,
    colorText: item.color_text,
    colorBorder: item.color_border,
    fontFamily: item.font_family,
    titleSize: item.title_size,
    subtitleSize: item.subtitle_size,
    textSize: item.text_size,
    tableSize: item.table_size,
    headerHeight: item.header_height,
    logoWidth: item.logo_width,
    logoHeight: item.logo_height,
    showLogo: !!item.show_logo,
    showDate: !!item.show_date,
    showCompanyData: !!item.show_company_data,
    showBranches: !!item.show_branches,
    showPaymentMethod: !!item.show_payment_method,
    showBankAccounts: !!item.show_bank_accounts,
    showSignature: !!item.show_signature,
    showFooter: !!item.show_footer,
    footerText: item.footer_text,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.status,
    textsCount: item.texts?.length ?? 0,
    texts: (item.texts ?? []).map((t) => ({
      id: t.id, key: t.key, title: t.title, content: t.content, visible: t.visible, order: t.order,
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useProformaTemplateListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true, isError: false, message: null })
    try {
      const response = await proformaTemplatesService.getById(id)
      if (!response.success) throw new Error(response.message)
      const mapped = mapProformaTemplateFromApi(response.data)
      set({ isFetching: false, hasLoaded: true, currentItem: mapped })
      return true
    } catch (error: any) {
      set({ isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await proformaTemplatesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapProformaTemplateFromApi),
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
