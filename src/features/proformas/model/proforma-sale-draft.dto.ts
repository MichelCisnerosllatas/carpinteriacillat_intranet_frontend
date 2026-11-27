// src/features/proformas/model/proforma-sale-draft.dto.ts
import type { ProformaApiItem } from './proforma-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

// GET /v1/intranet/proformas/{id}/sale-draft — lo que el backend arma para precargar una venta
// (contrato §6). Los montos pueden venir como string decimal, el front los pasa por Number().
export type ProformaSaleDraftDetailDto = {
  product_service_id: number | null
  description: string
  unit: string | null
  quantity: number | string
  unit_price: number | string
  discount: number | string
}

export type ProformaSaleDraftDto = {
  proforma_id: number
  proforma_code: string
  currency: string
  client: {
    id: number
    business_name: string
    document_number: string | null
  } | null
  details: ProformaSaleDraftDetailDto[]
}

export type ProformaSaleDraftResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaSaleDraftDto
}

// GET /v1/intranet/proformas?status=ACEPTADA — index plano (sin relaciones) que usa el modal
// "Importar proforma" de ventas para listar las proformas que se pueden convertir.
export type ProformaPlainListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
