export type SaleSettingApiItem = {
  id: number
  igv_rate: string
  igv_enabled_default: number
  status: number
  created_at: string | null
  updated_at: string | null
}

export type SaleSettingGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleSettingApiItem
}
