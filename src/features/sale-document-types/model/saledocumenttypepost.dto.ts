import type { SaleDocumentTypeApiItem } from './saledocumenttypeget.dto'

export type SaleDocumentTypePostRequestDto = {
  name: string
  code?: string
  series: string
  status?: number
}

export type SaleDocumentTypePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDocumentTypeApiItem
  errors?: Record<string, string[]>
}
