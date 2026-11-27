import { z } from 'zod'

export const schema = z.object({
  logo: z.string().nullable(),
  logo_height: z.number().min(16).max(400),
  logo_width: z.number().min(16).max(800).nullable(),
  logo_object_fit: z.union([z.literal('contain'), z.literal('cover')]),
  footer_state: z.boolean(),
  show_brand: z.boolean(),
  show_quick_links: z.boolean(),
  show_services: z.boolean(),
  show_access: z.boolean(),
})
