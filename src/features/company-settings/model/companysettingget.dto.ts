export type CompanySettingApiItem = {
  id: number
  business_name: string
  trade_name: string | null
  tax_id: string | null
  tax_address: string | null
  logo: string | null
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanySettingGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySettingApiItem
}
