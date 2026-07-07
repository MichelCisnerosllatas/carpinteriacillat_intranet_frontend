import { create } from 'zustand'
import { proformaTemplatesService } from '../services/proforma-templates.service'
import { getStateOption } from '@/shared/config/entity-states'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import { PDF_TEMPLATE_MODULE } from '../data/data'
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
  page: 1,
  per_page: 10,
  search: '',
  status: undefined,
  module: PDF_TEMPLATE_MODULE,
  module_type_id: undefined,
}

// PdfTemplate no anida el nombre/código del module_type — se resuelve por cruce con
// las opciones ya cargadas de ProformaType (ver pdf-templates.md, esquema del objeto).
const resolveProformaType = (moduleTypeId: number | null) => {
  if (moduleTypeId == null) return null
  return useProformaTypeSelectStore.getState().options.find((o) => o.id === moduleTypeId) ?? null
}

export const mapProformaTemplateFromApi = (item: ProformaTemplateJoinApiItem): ProformaTemplate => {
  const stateOpt = getStateOption(item.status)
  const type = resolveProformaType(item.module_type_id)
  const sections = item.sections ?? {}
  return {
    id: item.id,
    moduleTypeId: item.module_type_id,
    proformaTypeId: item.module_type_id,
    proformaTypeName: type?.name ?? null,
    proformaTypeCode: type?.code ?? null,
    name: item.name,

    headerBgColor: item.header.background_color,
    headerTextColor: item.header.text_color,
    headerTitleSize: item.header.title_size,
    headerHeight: item.header.height,
    headerLogoWidth: item.header.logo_width,
    headerLogoHeight: item.header.logo_height,
    headerLayout: item.header.layout,
    headerFontFamily: item.header.font_family,

    bodyBgColor: item.body.background_color,
    bodyTextColor: item.body.text_color,
    bodyBorderColor: item.body.border_color,
    bodyFontFamily: item.body.font_family,
    bodySubtitleSize: item.body.subtitle_size,
    bodyTextSize: item.body.text_size,
    bodyTableSize: item.body.table_size,

    footerBgColor: item.footer.background_color,
    footerTextColor: item.footer.text_color,
    footerTextSize: item.footer.text_size,
    footerFontFamily: item.footer.font_family,
    footerText: item.footer.text,

    sections: {
      showLogo: sections.show_logo ?? true,
      showDate: sections.show_date ?? true,
      showCompanyData: sections.show_company_data ?? true,
      showBranches: sections.show_branches ?? true,
      showPaymentMethod: sections.show_payment_method ?? true,
      showBankAccounts: sections.show_bank_accounts ?? true,
      showCompanySocialNetworks: sections.show_company_social_networks ?? true,
      showCompanyContacts: sections.show_company_contacts ?? true,
      showSignature: sections.show_signature ?? true,
      showFooter: sections.show_footer ?? true,
    },

    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.status,
    textsCount: item.texts?.length ?? 0,
    texts: (item.texts ?? []).map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      content: t.content,
      visible: t.visible,
      order: t.order,
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useProformaTemplateListStore = create<State & Action>((set, get) => ({
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
      set({
        isFetching: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
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
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: false,
        message: response.message,
        items: response.data.map(mapProformaTemplateFromApi),
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
