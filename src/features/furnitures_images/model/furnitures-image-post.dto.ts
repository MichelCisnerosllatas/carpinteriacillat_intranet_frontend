export type FurnitureImagePostRequestDto = {
  id_furniture: number
  id_image: number
  furnitureimage_order?: number
  furnitureimage_state?: number
  furnitureimage_created_at?: string
}

export type FurnitureImagePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: {
    id_furniture_image: number
    id_furniture: number
    id_image: number
    furnitureimage_order: number | null
    furnitureimage_state: number
    furnitureimage_created_at: string | null
    furnitureimage_updated_at: string | null
  }
  errors?: Record<string, string[]>
}
