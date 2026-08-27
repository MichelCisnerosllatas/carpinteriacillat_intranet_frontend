import type { CompanyBranchApiItem } from './companybranchget.dto'

export type CompanyBranchPostRequestDto = {
  name: string
  address: string
  schedule?: string
  latitude?: number
  longitude?: number
  status?: number
}

export type CompanyBranchPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyBranchApiItem
  errors?: Record<string, string[]>
}
