import type { CompanySignatureApiItem } from './companysignatureget.dto'

export type CompanySignaturePutRequestDto = {
  signer_name: string
  position?: string
  phone?: string
  signature_image?: string
  status: number
}

export type CompanySignaturePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySignatureApiItem
  errors?: Record<string, string[]>
}
