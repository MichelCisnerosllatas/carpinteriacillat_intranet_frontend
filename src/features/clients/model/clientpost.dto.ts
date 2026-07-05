export type ClientPostRequestDto = {
  id_typedoc?: number | null
  business_name: string
  document_number?: string
  address?: string
  contact_person?: string
  phone?: string
  email?: string
  status?: number
}

export type ClientPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id: number }
  errors?: Record<string, string[]>
}
