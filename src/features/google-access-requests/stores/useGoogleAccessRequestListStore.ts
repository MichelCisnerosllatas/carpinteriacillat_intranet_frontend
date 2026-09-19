import { create } from 'zustand'
import { googleAccessRequestService } from '../services/googleaccessrequest.service'
import type { GoogleAccessRequestListRequestDto, GoogleAccessRequestApiItem } from '../model/googleaccessrequestget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { GoogleAccessRequest } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: GoogleAccessRequest[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: GoogleAccessRequestListRequestDto
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: GoogleAccessRequestListRequestDto) => Promise<boolean>
  reset: () => void
}

const defaultFilters: GoogleAccessRequestListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined,
}

export const mapGoogleAccessRequestFromApi = (item: GoogleAccessRequestApiItem): GoogleAccessRequest => ({
  id: item.id,
  name: item.name,
  email: item.email,
  photoUrl: item.photo_url,
  providerUid: item.provider_uid,
  provider: item.provider,
  emailVerified: item.email_verified,
  status: item.status,
  attempts: item.attempts,
  lastAttemptAtFormatted: item.last_attempt_at_formatted,
  reviewedAtFormatted: item.reviewed_at_formatted,
  reviewerEmail: item.reviewer?.email ?? null,
  idUser: item.id_user,
  createdAtFormatted: item.created_at_formatted,
})

export const useGoogleAccessRequestListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await googleAccessRequestService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapGoogleAccessRequestFromApi),
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
