// src/features/products-services/model/product-service-api-item.dto.ts
export type ProductServiceType = 'product' | 'service'

export type ProductServiceApiItem = {
  id: number
  furniture_id: number | null
  name: string
  description: string | null
  unit: string | null
  default_price: number
  type: ProductServiceType
  status: number
  created_at: string
  updated_at: string | null
}

export type ProductServiceFurnitureJoin = {
  id_furniture: number
  furniture_name: string
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
  type_color: {
    id_typecolor: number
    typecolor_name: string
    typecolor_description: string | null
    typecolor_state: number
  } | null
  type_wood: {
    id_typewood: number
    typewood_name: string
    typewood_description: string | null
    typewood_state: number
  } | null
  category: {
    id_category: number
    category_name: string
    category_description: string | null
    category_state: number
  } | null
}

export type ProductServiceJoinApiItem = ProductServiceApiItem & {
  furniture: ProductServiceFurnitureJoin | null
}
