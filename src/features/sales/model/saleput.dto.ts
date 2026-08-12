import type { SaleApiItem, SaleStatusApi } from './sale-api-item.dto'
import type { SalePostRequestDto } from './salepost.dto'

// is_taxed no aparece acá — es inmutable después de crear (ver salepost.dto.ts) y ni siquiera
// existe en el formulario de edición (ver useSyncSaleFormValues).
//
// status sí aparece acá (a diferencia de SalePostRequestDto) — pero el formulario general de
// cabecera JAMÁS lo incluye en su payload; solo lo usa `useSaleDeleteStore.changeStatus` vía un
// PATCH dedicado, igual mecanismo que en proformas.
export type SalePutRequestDto = Omit<SalePostRequestDto, 'is_taxed'> & {
  status?: SaleStatusApi
}

export type SalePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleApiItem
  errors?: Record<string, string[]>
}
