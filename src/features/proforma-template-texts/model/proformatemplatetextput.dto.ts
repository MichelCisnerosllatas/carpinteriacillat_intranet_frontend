import type { ProformaTemplateTextApiItem } from './proformatemplatetextget.dto'

export type ProformaTemplateTextPutRequestDto = {
  template_id?: number
  key: string
  title?: string
  content?: string
  visible?: number
  order?: number
}

export type ProformaTemplateTextPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateTextApiItem
  errors?: Record<string, string[]>
}
