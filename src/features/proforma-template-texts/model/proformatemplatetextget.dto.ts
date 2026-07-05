import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ProformaTemplateTextApiItem = {
  id: number
  template_id: number
  key: string
  title: string | null
  content: string | null
  visible: boolean
  order: number
  created_at: string
  updated_at: string | null
}

export type ProformaTemplateTextListRequestDto = {
  template_id?: number
  per_page?: number
  page?: number
}

export type ProformaTemplateTextListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateTextApiItem[]
  links?: LinksPaginationType
  meta?: MetaPaginationType
}
