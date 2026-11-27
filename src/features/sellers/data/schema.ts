import { z } from 'zod'

// Vendedor tal como lo usa la UI (filtros, selector del POS, metas por vendedor).
export const sellerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
})

export type Seller = z.infer<typeof sellerSchema>
