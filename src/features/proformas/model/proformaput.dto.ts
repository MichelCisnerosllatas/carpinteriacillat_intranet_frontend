import type { ProformaApiItem } from './proforma-api-item.dto'
import type { ProformaDetailPostDto, ProformaPostRequestDto } from './proformapost.dto'

export type { ProformaDetailPostDto }

// Si se envía `details`, reemplaza TODOS los detalles existentes (borra y recrea).
export type ProformaPutRequestDto = ProformaPostRequestDto

export type ProformaPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem
  errors?: Record<string, string[]>
}
