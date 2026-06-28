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
    id_category: number; 
    category_name: string 
  }
  typecolor: { 
    id_typecolor: number; 
    typecolor_name: string 
  }
  typewood:  { 
    id_typewood: number; 
    typewood_name: string 
  }
  image: { 
    id_image: number; 
    image_name: string; 
    image_url: string 
  } | null
}
