export type FurnitureImagePutRequestDto = {
  id_furniture?: number
  id_image?: number
  furnitureimage_order?: number | null
  furnitureimage_state?: number
  furnitureimage_updated_at?: string
  // Datos web opcionales (pie de foto y antes/después). Si ambos quedan null, el backend borra la fila web.
  furnitureimageweb_caption?: string | null
  furnitureimageweb_variant?: 'before' | 'after' | null
}

export type FurnitureImagePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_furniture_image: number }
  errors?: Record<string, string[]>
}
