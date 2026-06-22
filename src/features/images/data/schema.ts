import { z } from 'zod'

export const imageSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  title: z.string().nullable(),
  alt: z.string().nullable(),
  patch: z.string(),
  url: z.string(),
  type: z.string().nullable(),
  size: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export type ImageItem = z.infer<typeof imageSchema>

export const storageFileSchema = z.object({
  path: z.string(),
  url: z.string(),
  lastModified: z.number().nullable(),
})

export type StorageFile = z.infer<typeof storageFileSchema>
