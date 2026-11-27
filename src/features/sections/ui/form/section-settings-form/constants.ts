import { z } from 'zod'

export const schema = z.object({
  tab_info:        z.boolean(),
  tab_images:      z.boolean(),
  tab_buttons:     z.boolean(),
  tab_items:       z.boolean(),
  tab_works:       z.boolean(),
  images_add:      z.boolean(),
  images_reorder:  z.boolean(),
  images_delete:   z.boolean(),
  buttons_add:     z.boolean(),
  buttons_reorder: z.boolean(),
  buttons_delete:  z.boolean(),
  items_add:       z.boolean(),
  items_reorder:   z.boolean(),
  items_delete:    z.boolean(),
})
