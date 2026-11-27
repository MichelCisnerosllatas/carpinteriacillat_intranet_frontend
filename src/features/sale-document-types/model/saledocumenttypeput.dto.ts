import type { SaleDocumentTypeApiItem } from './saledocumenttypeget.dto'

export type SaleDocumentTypePutRequestDto = {
  name: string
  code?: string
  series: string
  description?: string | null
  status: number
}

export type SaleDocumentTypePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDocumentTypeApiItem
  errors?: Record<string, string[]>
}
