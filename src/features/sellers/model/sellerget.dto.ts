// src/features/sellers/model/sellerget.dto.ts

// GET /v1/intranet/sellers (contrato §11.4) — usuarios activos que pueden figurar como vendedor.
// Solo responde con el permiso `sales.view_all`.
export type SellerApiItem = {
  id: number
  name: string
  email: string
  role: string | null
}

export type SellerListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SellerApiItem[]
}
