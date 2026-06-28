// src/features/furnitures/model/furniture-api-item.dto.ts
export type FurnitureApiItem = {
  id_furniture: number
  furniture_name: string
  furniture_description: string | null
  furniture_largo: number | null
  furniture_ancho: number | null
  furniture_state: number
  id_category: number
  id_typecolor: number
  id_typewood: number
  id_image: number | null
  furniture_created_at: string
  furniture_updated_at: string | null
}

export type FurnitureJoinApiItem = FurnitureApiItem & {
  category: {
    id_category: number
    category_name: string
    category_description?: string | null
    category_state?: number
  } | null

  type_color: {
    id_typecolor: number
    typecolor_name: string
    typecolor_description?: string | null
    typecolor_state?: number
  } | null

  type_wood: {
    id_typewood: number
    typewood_name: string
    typewood_description?: string | null
    typewood_state?: number
  } | null

  images: {
    id_image: number
    image_name: string
    image_title: string | null
    image_alt: string | null
    image_patch: string | null
    image_type: string | null
  } | null

  gallery_images: Array<{
    id_furniture_image: number
    furnitureimage_order: number | null
    furnitureimage_state: number
    image: {
      id_image: number
      image_name: string | null
      image_title: string | null
      image_alt: string | null
      image_patch: string | null
      image_type: string | null
    } | null
  }>
}