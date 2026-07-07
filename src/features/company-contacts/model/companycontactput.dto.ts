import type { CompanyContactApiItem, CompanyContactType } from './companycontactget.dto'

export type CompanyContactPutRequestDto = {
  name?: string
  phone: string
  type: CompanyContactType
  email?: string
  is_primary: 0 | 1
  show_on_website: 0 | 1
  order: number
  status: number
}

export type CompanyContactPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyContactApiItem
  errors?: Record<string, string[]>
}
