import { z } from 'zod'

/** Una opción ya "traducida" desde la API (ver mapChatbotOptionFromApi). */
export const chatbotOptionSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  icon: z.string(),
  action: z.enum(['chat', 'whatsapp', 'url']),
  value: z.string().nullable(),
  order: z.number(),
  state: z.boolean(),
})

export type ChatbotOption = z.infer<typeof chatbotOptionSchema>

const VALID_URL = /^(\/|https?:\/\/)/
const VALID_PHONE = /^\+?[0-9\s-]{6,20}$/

/** Reglas del formulario. Nombres = los que espera la API (así los errores 422 caen en su campo). */
export const chatbotOptionFormSchema = z.object({
  option_key: z.string().trim()
    .min(1, 'Escriba una clave.')
    .max(50, 'Máximo 50 caracteres.')
    .regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, "-" y "_" (ej. cotizacion).'),
  title: z.string().trim().min(1, 'Escriba un título.').max(80, 'Máximo 80 caracteres.'),
  subtitle: z.string().max(150, 'Máximo 150 caracteres.'),
  icon: z.string().trim().min(1, 'Elija un ícono.'),
  action: z.enum(['chat', 'whatsapp', 'url']),
  value: z.string().max(255, 'Máximo 255 caracteres.'),
  state: z.boolean(),
}).superRefine((v, ctx) => {
  const value = v.value.trim()
  if (v.action === 'whatsapp' && !VALID_PHONE.test(value)) {
    ctx.addIssue({ code: 'custom', path: ['value'], message: 'Escriba el número con código de país (ej. 51987654321).' })
  }
  if (v.action === 'url' && !VALID_URL.test(value)) {
    ctx.addIssue({ code: 'custom', path: ['value'], message: 'Debe empezar con "/", "https://" o "http://".' })
  }
})

export type ChatbotOptionFormValues = z.infer<typeof chatbotOptionFormSchema>

export const CHATBOT_OPTION_FORM_DEFAULTS: ChatbotOptionFormValues = {
  option_key: '',
  title: '',
  subtitle: '',
  icon: 'fa-solid fa-comments',
  action: 'chat',
  value: '',
  state: true,
}
