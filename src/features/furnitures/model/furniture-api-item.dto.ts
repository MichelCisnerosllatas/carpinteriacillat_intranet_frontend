// src/features/furnitures/model/furniture-api-item.dto.ts
import type { FurnitureWebApiItem } from './furniture-web.dto'

export type FurnitureApiItem = {
  id_furniture: number
  furniture_name: string
  /** Título público opcional — si es null el sitio web usa furniture_name. */
  furniture_title: string | null
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
    /** Datos web de la foto (pie de foto y antes/después) — null si no tiene. */
    web: {
      furnitureimageweb_caption: string | null
      furnitureimageweb_variant: 'before' | 'after' | null
    } | null
  }>

  /** Datos de la "Galería de trabajos" del sitio web — null si nunca se publicó. */
  web: FurnitureWebApiItem | null

  /**
   * Atajo "Usar su portada en la tarjeta de su categoría" (carrusel «Muebles a medida» de Servicios).
   * Puede no venir (backend viejo).
   */
  category_card?: {
    /** true si la portada del mueble está como foto visible en la tarjeta de su categoría. */
    show_cover: boolean
    /** Sección del carrusel (para el enlace "Ver sección →"). */
    id_section: number | null
    category_name: string | null
  } | null

  /**
   * Atajo "Mostrar en «Restauración»" (comparador antes/después de Servicios).
   * Puede no venir (backend viejo).
   */
  restoration_card?: {
    /** true si el mueble tiene su tarjeta visible en «Restauración». */
    show: boolean
    /** Sección «Restauración» (para el enlace "Ver sección →"). */
    id_section: number | null
    /** true si tiene al menos una foto "Antes" y una "Después" visibles en su galería. */
    has_before_after: boolean
  } | null
}