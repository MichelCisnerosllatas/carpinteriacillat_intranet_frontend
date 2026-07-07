import type { CompanySocialNetworkApiItem } from './companysocialnetworkget.dto'

export type CompanySocialNetworkPostRequestDto = {
  name: string
  link: string
  show_on_website?: 0 | 1
  order?: number
  status?: number
}

export type CompanySocialNetworkPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySocialNetworkApiItem
  errors?: Record<string, string[]>
}
