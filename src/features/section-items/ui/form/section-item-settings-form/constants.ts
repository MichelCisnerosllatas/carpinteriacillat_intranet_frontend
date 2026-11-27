import { z } from 'zod'

export const schema = z.object({
  tab_info:        z.boolean(),
  tab_details:     z.boolean(),
  details_add:     z.boolean(),
  details_reorder: z.boolean(),
  details_delete:  z.boolean(),
})
