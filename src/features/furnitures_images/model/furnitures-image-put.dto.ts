export type FurnitureImagePutRequestDto = {
  id_furniture?: number
  id_image?: number
  furnitureimage_order?: number | null
  furnitureimage_state?: number
  furnitureimage_updated_at?: string
}

export type FurnitureImagePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_furniture_image: number }
  errors?: Record<string, string[]>
}
