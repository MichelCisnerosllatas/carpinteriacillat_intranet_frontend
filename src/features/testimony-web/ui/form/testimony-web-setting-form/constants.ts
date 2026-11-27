import { z } from 'zod'

export const schema = z.object({
  testimony_limit: z.number().int().min(1).nullable(),
  show_photo:     z.boolean(),
  show_rating:    z.boolean(),
  show_city:      z.boolean(),
  show_email:     z.boolean(),
  show_delivered: z.boolean(),
  show_verified:  z.boolean(),
})
