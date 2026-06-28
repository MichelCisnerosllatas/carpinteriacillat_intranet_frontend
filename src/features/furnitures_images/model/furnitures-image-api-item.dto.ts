export type FurnitureImageApiItem = {
  id_furniture_image: number
  id_furniture: number
  id_image: number
  furnitureimage_order: number | null
  furnitureimage_state: number
  furnitureimage_created_at: string | null
  furnitureimage_updated_at: string | null
}

export type FurnitureImageJoinApiItem = {
  id_furniture_image: number
  furnitureimage_order: number | null
  furnitureimage_state: number
  furnitureimage_created_at: string | null
  furnitureimage_created_at_format: string | null
  furnitureimage_updated_at: string | null
  furnitureimage_updated_at_format: string | null
  furniture: {
    id_furniture: number
    furniture_name: string
    furniture_title: string | null
    furniture_state: number
  } | null
  image: {
    id_image: number
    image_name: string | null
    image_title: string | null
    image_alt: string | null
    image_patch: string | null
    image_type: string | null
  } | null
}
