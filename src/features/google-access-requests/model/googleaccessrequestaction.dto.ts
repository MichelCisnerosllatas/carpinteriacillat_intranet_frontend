import type { GoogleAccessRequestApiItem } from './googleaccessrequestget.dto'

export type ApproveGoogleAccessRequestDto = {
  id_rol: number
}

export type GoogleAccessRequestActionResponseDto = {
  success: boolean
  status: number
  message: string
  data: GoogleAccessRequestApiItem | null
  errors?: Record<string, string[]>
}
