import type { ProformaTemplateApiItem } from './proformatemplate-api-item.dto'
import type { ProformaTemplatePostRequestDto } from './proformatemplatepost.dto'

export type ProformaTemplatePutRequestDto = ProformaTemplatePostRequestDto

export type ProformaTemplatePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateApiItem
  errors?: Record<string, string[]>
}
