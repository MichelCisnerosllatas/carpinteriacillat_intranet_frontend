import type { CompanySignatureApiItem } from './companysignatureget.dto'

export type CompanySignaturePostRequestDto = {
  signer_name: string
  position?: string
  phone?: string
  signature_image?: string
  status?: number
}

export type CompanySignaturePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySignatureApiItem
  errors?: Record<string, string[]>
}
