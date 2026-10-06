import type { PreviewEntity, PreviewPayload } from './landing-preview.types'

// Responde una sola pregunta: "¿qué le muestro al usuario para que sepa qué está viendo?".
// Se arma a partir del último payload mandado (ya en el idioma público, ver
// landing-preview.types.ts) — no hace falta que cada uno de los 8 formularios mande un label
// aparte, ya alcanza con "adivinarlo" de los campos que ya vienen.
const ENTITY_LABELS: Record<PreviewEntity, string> = {
  navigation: 'Navegación',
  section: 'Sección',
  section_button: 'Botón',
  section_image: 'Imagen',
  section_item: 'Item',
  section_item_detail: 'Detalle',
  testimony: 'Testimonio',
  footer: 'Footer',
}

export function guessPreviewLabel(payload: PreviewPayload | null): string {
  if (!payload) return 'Vista previa'
  const entityLabel = ENTITY_LABELS[payload.entity]
  const fields = payload.fields
  const text = (fields.section_title ?? fields.navigation_name ?? fields.label ?? fields.title ?? fields.name) as
    | string
    | null
    | undefined
  return text ? `${entityLabel}: ${text}` : entityLabel
}
