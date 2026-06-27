export type FurniturePostRequestDto = {
  furniture_name: string
  furniture_description?: string
  furniture_largo?: number | null
  furniture_ancho?: number | null
  furniture_state: number
  furniture_order: number
  id_category: number
  id_typecolor: number
  id_typewood: number
  id_image?: number | null
  furniture_created_at: string
}

export type FurniturePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_furniture: number }
  errors?: Record<string, string[]>
}
