import type { CompanyBankAccountApiItem } from './companybankaccountget.dto'

export type CompanyBankAccountPutRequestDto = {
  bank: string
  account_number: string
  account_type?: string
  currency: string
  logo?: string
  order: number
  status: number
}

export type CompanyBankAccountPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyBankAccountApiItem
  errors?: Record<string, string[]>
}
