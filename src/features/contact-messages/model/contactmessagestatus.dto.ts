import type { ContactMessageApiItem } from './contactmessageget.dto'

export type ContactMessageStatusRequestDto = {
  status: 'nuevo' | 'atendido' | 'descartado'
}

export type ContactMessageStatusResponseDto = {
  success: boolean
  status: number
  message: string
  data: ContactMessageApiItem
  errors?: Record<string, string[]>
}
