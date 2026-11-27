import { z } from 'zod'
import { FLOATING_ANIMATION_VALUES } from '@/shared/config/floating-animations'

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Reglas del formulario de Configuración del chatbot. Nombres = columnas de `chatbot_setting`. */
export const chatbotSettingFormSchema = z.object({
  chatbot_state: z.boolean(),
  show_on_mobile: z.boolean(),
  position: z.union([z.literal('bottom-right'), z.literal('bottom-left')]),
  offset_x: z.number().int().min(0, 'Mínimo 0.').max(200, 'Máximo 200.'),
  offset_y: z.number().int().min(0, 'Mínimo 0.').max(200, 'Máximo 200.'),
  primary_color: z.string().regex(HEX_COLOR, 'Color inválido (ej. #2563eb).'),
  header_title: z.string().trim().min(1, 'Escriba un título.').max(80, 'Máximo 80 caracteres.'),
  header_subtitle: z.string().max(120, 'Máximo 120 caracteres.'),
  launcher_icon: z.string().trim().min(1, 'Escriba la clase del ícono.').max(60, 'Máximo 60 caracteres.'),
  launcher_animation: z.enum(FLOATING_ANIMATION_VALUES),
  welcome_message: z.string().trim().min(1, 'Escriba un mensaje de bienvenida.').max(500, 'Máximo 500 caracteres.'),
  input_placeholder: z.string().trim().min(1, 'Escriba un texto.').max(120, 'Máximo 120 caracteres.'),
  allow_voice: z.boolean(),
  auto_open_seconds: z.number().int().min(1, 'Mínimo 1 segundo.').max(600, 'Máximo 600 segundos.').nullable(),
  require_contact_data: z.boolean(),
})

export type ChatbotSettingFormValues = z.infer<typeof chatbotSettingFormSchema>

/** Mismos defaults que la migración del backend. */
export const CHATBOT_SETTING_FORM_DEFAULTS: ChatbotSettingFormValues = {
  chatbot_state: true,
  show_on_mobile: true,
  position: 'bottom-right',
  offset_x: 24,
  offset_y: 24,
  primary_color: '#2563eb',
  header_title: 'Asistente virtual',
  header_subtitle: 'Te respondemos al instante',
  launcher_icon: 'fa-solid fa-comments',
  launcher_animation: 'pulse',
  welcome_message: '¡Hola! 👋 ¿En qué podemos ayudarte hoy?',
  input_placeholder: 'Escribe tu mensaje...',
  allow_voice: true,
  auto_open_seconds: null,
  require_contact_data: false,
}
