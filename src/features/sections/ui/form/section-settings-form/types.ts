import { z } from 'zod'
import { schema } from './constants'

export type FormValues = z.infer<typeof schema>
