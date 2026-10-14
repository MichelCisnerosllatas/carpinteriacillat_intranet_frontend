import { z } from 'zod'

export const furnitureStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type FurnitureStatus = z.infer<typeof furnitureStatusSchema>

export const galleryImageSchema = z.object({
  id: z.number(),
  imageId: z.number(),
  imageUrl: z.string().nullable(),
  imageName: z.string().nullable(),
  // Datos web de la foto: pie de foto y si es "antes"/"después" (null = foto normal).
  caption: z.string().nullable(),
  variant: z.string().nullable(),
})

export type GalleryImage = z.infer<typeof galleryImageSchema>

// Datos del mueble en la "Galería de trabajos" del sitio web (tabla furniture_web).
export const furnitureWebSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  style: z.string().nullable(),
  measures: z.string().nullable(),
  finish: z.string().nullable(),
  buildTime: z.string().nullable(),
  location: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  priceApprox: z.number().nullable(),
  order: z.number().nullable(),
  state: z.number(),
})

export type FurnitureWeb = z.infer<typeof furnitureWebSchema>

// Portada del mueble en la tarjeta de su categoría (carrusel «Muebles a medida» de Servicios).
export const furnitureCategoryCardSchema = z.object({
  showCover: z.boolean(),
  /** Sección del carrusel (para el enlace "Ver sección →"). */
  idSection: z.number().nullable(),
  categoryName: z.string().nullable(),
})

export type FurnitureCategoryCard = z.infer<typeof furnitureCategoryCardSchema>

// Tarjeta del mueble en «Restauración» (comparador antes/después de Servicios).
export const furnitureRestorationCardSchema = z.object({
  show: z.boolean(),
  /** Sección «Restauración» (para el enlace "Ver sección →"). */
  idSection: z.number().nullable(),
  /** true si tiene al menos una foto "Antes" y una "Después" visibles en su galería. */
  hasBeforeAfter: z.boolean(),
})

export type FurnitureRestorationCard = z.infer<typeof furnitureRestorationCardSchema>

export const furnitureSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  largo: z.number().nullable(),
  ancho: z.number().nullable(),
  idCategory: z.number(),
  categoryName: z.string(),
  idTypecolor: z.number(),
  typecolorName: z.string(),
  idTypewood: z.number(),
  typewoodName: z.string(),
  idImage: z.number().nullable(),
  imageName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  galleryImages: z.array(galleryImageSchema),
  web: furnitureWebSchema.nullable(),
  /** true si el mueble se ve en la galería web (web.state === 1). */
  isPublishedOnWeb: z.boolean(),
  /** null si el backend no mandó `category_card`. */
  categoryCard: furnitureCategoryCardSchema.nullable(),
  /** null si el backend no mandó `restoration_card`. */
  restorationCard: furnitureRestorationCardSchema.nullable(),
  status: furnitureStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Furniture = z.infer<typeof furnitureSchema>
