import type { CompanySettingApiItem } from './companysettingget.dto'

export type CompanySettingPutRequestDto = {
  business_name: string
  trade_name?: string
  tax_id?: string
  tax_address?: string
  phone?: string
  email?: string
  facebook?: string
  website?: string
  logo?: string
  status: number
}

export type CompanySettingPatchRequestDto = Partial<CompanySettingPutRequestDto>

export type CompanySettingPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySettingApiItem
  errors?: Record<string, string[]>
}
