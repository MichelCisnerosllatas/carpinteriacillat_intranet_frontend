import type { SaleSettingApiItem } from './salesettingget.dto'

export type SaleSettingPutRequestDto = {
  igv_rate: string
  igv_enabled_default: number
  status: number
}

export type SaleSettingPatchRequestDto = Partial<SaleSettingPutRequestDto>

export type SaleSettingPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleSettingApiItem
  errors?: Record<string, string[]>
}
