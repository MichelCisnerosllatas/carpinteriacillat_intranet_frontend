// src/features/sales/model/saleformdata.dto.ts

// GET /v1/intranet/sales/form-data (contrato §3) — todo lo que necesita la pantalla
// "Realizar venta" para arrancar, en una sola llamada.
export type SaleFormDataDocumentTypeDto = {
  id: number
  name: string
  code: string | null
  series: string | null
  /** Siguiente correlativo que tomará la serie (referencial: el número real lo asigna el backend
   * al emitir). Si el backend aún no lo envía, la pantalla muestra "N° al emitir". */
  next_correlative?: number | null
}

export type SaleFormDataOptionDto = {
  value: string
  label: string
}

export type SaleFormDataDto = {
  document_types: SaleFormDataDocumentTypeDto[]
  igv: { enabled: boolean; rate: number | string }
  currencies: SaleFormDataOptionDto[]
  payment_methods: SaleFormDataOptionDto[]
}

export type SaleFormDataResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleFormDataDto
}
