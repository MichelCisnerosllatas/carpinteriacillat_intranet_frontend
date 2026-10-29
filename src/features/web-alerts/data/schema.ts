// Tipos de las alertas del sitio que usa la pantalla:
// 1) `WebAlert`: una alerta ya "traducida" desde la API (la usan la lista y el ordenar).
// 2) `webAlertFormSchema`: las reglas del formulario de crear/editar (con Zod).

import { z } from 'zod'

/** Una alerta lista para mostrar en la lista (ver mapWebAlertFromApi en useWebAlertListStore). */
export const webAlertSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  style: z.string(),
  align: z.string(),
  showIcon: z.boolean(),
  trailing: z.string(),
  trailingLabel: z.string().nullable(),
  linkUrl: z.string().nullable(),
  dismissible: z.boolean(),
  scrollBehavior: z.string(),
  /** `YYYY-MM-DD HH:mm:ss` o null */
  startsAt: z.string().nullable(),
  /** `YYYY-MM-DD HH:mm:ss` o null */
  endsAt: z.string().nullable(),
  order: z.number().nullable(),
  /** 1 = activada, 0 = desactivada */
  stateValue: z.number(),
  /** showing · scheduled · expired · off */
  visibilityStatus: z.string(),
})

export type WebAlert = z.infer<typeof webAlertSchema>

/** Un enlace válido empieza con "/", "http://", "https://", "mailto:" o "tel:". */
const VALID_LINK = /^(\/|https?:\/\/|mailto:|tel:)/

/**
 * Reglas del formulario. Los nombres de los campos son los mismos que espera la API,
 * así los errores que devuelve el backend se pintan solos en el campo correcto.
 */
export const webAlertFormSchema = z.object({
  // El título puede tener hasta 120 letras.
  webalert_title: z.string().max(120, 'Máximo 120 caracteres.'),
  // El subtítulo puede tener hasta 200 letras.
  webalert_subtitle: z.string().max(200, 'Máximo 200 caracteres.'),
  // Color de la barra: promo, info, warning o success (se elige con botones).
  webalert_style: z.string(),
  // Alineación: left, center o right (se elige con botones).
  webalert_align: z.string(),
  // ¿Se muestra el icono a la izquierda?
  webalert_show_icon: z.boolean(),
  // Solo para el formulario: 'none' = la alerta no hace nada al tocarla, 'link' = lleva a un enlace.
  link_mode: z.string(),
  // El enlace puede tener hasta 255 letras.
  webalert_link_url: z.string().max(255, 'Máximo 255 caracteres.'),
  // Lo que va al final: none, arrow o button.
  webalert_trailing: z.string(),
  // El texto del botón puede tener hasta 40 letras.
  webalert_trailing_label: z.string().max(40, 'Máximo 40 caracteres.'),
  // ¿El cliente la puede cerrar con la ✕?
  webalert_dismissible: z.boolean(),
  // Al bajar por la página: hide (se oculta) o sticky (se queda visible).
  webalert_scroll_behavior: z.string(),
  // "Mostrar desde": texto del input de fecha y hora. Vacío = sin límite.
  webalert_starts_at: z.string(),
  // "Mostrar hasta": texto del input de fecha y hora. Vacío = sin límite.
  webalert_ends_at: z.string(),
  // Interruptor "Activada": 1 = sí, 0 = no.
  webalert_state: z.number(),
}).superRefine((values, ctx) => {
  // Hay que escribir al menos un título o un subtítulo.
  if (values.webalert_title.trim() === '' && values.webalert_subtitle.trim() === '') {
    ctx.addIssue({ code: 'custom', path: ['webalert_title'], message: 'Escriba un título o un subtítulo.' })
  }

  // Si se eligió "Lleva a un enlace", el enlace es obligatorio...
  if (values.link_mode === 'link' && values.webalert_link_url.trim() === '') {
    ctx.addIssue({ code: 'custom', path: ['webalert_link_url'], message: 'Escriba el enlace.' })
  }
  // ...y tiene que empezar como un enlace válido.
  if (values.link_mode === 'link' && values.webalert_link_url.trim() !== '' && !VALID_LINK.test(values.webalert_link_url.trim())) {
    ctx.addIssue({ code: 'custom', path: ['webalert_link_url'], message: 'Debe empezar con "/", "https://", "http://", "mailto:" o "tel:".' })
  }

  // Si al final va un "Botón con texto", el texto del botón es obligatorio.
  if (values.webalert_trailing === 'button' && values.webalert_trailing_label.trim() === '') {
    ctx.addIssue({ code: 'custom', path: ['webalert_trailing_label'], message: 'Escriba el texto del botón.' })
  }

  // Si hay "desde" y "hasta", el "hasta" tiene que ser después del "desde".
  if (values.webalert_starts_at !== '' && values.webalert_ends_at !== '' && values.webalert_ends_at <= values.webalert_starts_at) {
    ctx.addIssue({ code: 'custom', path: ['webalert_ends_at'], message: '"Mostrar hasta" debe ser después de "Mostrar desde".' })
  }
})

export type WebAlertFormValues = z.infer<typeof webAlertFormSchema>

/** Valores con los que arranca el formulario al crear una alerta nueva. */
export const WEB_ALERT_FORM_DEFAULTS: WebAlertFormValues = {
  webalert_title: '',
  webalert_subtitle: '',
  webalert_style: 'info',
  webalert_align: 'center',
  webalert_show_icon: true,
  link_mode: 'none',
  webalert_link_url: '',
  webalert_trailing: 'none',
  webalert_trailing_label: '',
  webalert_dismissible: false,
  webalert_scroll_behavior: 'hide',
  webalert_starts_at: '',
  webalert_ends_at: '',
  webalert_state: 1,
}
