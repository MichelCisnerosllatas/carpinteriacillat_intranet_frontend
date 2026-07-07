import type { CompanySocialNetworkApiItem } from './companysocialnetworkget.dto'

export type CompanySocialNetworkPutRequestDto = {
  name: string
  link: string
  show_on_website: 0 | 1
  order: number
  status: number
}

export type CompanySocialNetworkPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySocialNetworkApiItem
  errors?: Record<string, string[]>
}
