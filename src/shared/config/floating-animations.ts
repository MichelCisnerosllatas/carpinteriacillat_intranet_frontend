/**
 * Animaciones de los botones flotantes del sitio web (chatbot y WhatsApp).
 *
 * Copia del catálogo de la web (`shared/lib/floatingAnimation.ts` + clases `.fab-anim-*` en
 * `app/globals.css` de carpinteriacillat_frontend_web) y del backend
 * (`ChatbotSetting::ANIMATIONS`). Si agregas una, agrégala en los TRES lados.
 *
 * Dónde se guarda cada una:
 *   - ChatBot  → `chatbot_setting.launcher_animation` (Configuración del ChatBot → Apariencia).
 *   - WhatsApp → `sectionitem_suffix` del item 'whatsapp' de Contacto (Items de Sección).
 */
export const FLOATING_ANIMATION_OPTIONS = [
  { value: 'none',   label: 'Sin animación' },
  { value: 'pulse',  label: 'Pulso (anillo que se expande)' },
  { value: 'bounce', label: 'Rebote suave' },
  { value: 'wiggle', label: 'Sacudida cada pocos segundos' },
  { value: 'float',  label: 'Flotar' },
] as const

export type FloatingAnimationValue = (typeof FLOATING_ANIMATION_OPTIONS)[number]['value']

export const FLOATING_ANIMATION_VALUES = FLOATING_ANIMATION_OPTIONS.map((o) => o.value) as [FloatingAnimationValue, ...FloatingAnimationValue[]]

export function isFloatingAnimation(value: unknown): value is FloatingAnimationValue {
  return typeof value === 'string' && (FLOATING_ANIMATION_VALUES as string[]).includes(value)
}
