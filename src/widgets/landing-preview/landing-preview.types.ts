// src/widgets/landing-preview/landing-preview.types.ts
//
// Copia EXACTA (a mano, comentada) del contrato que espera el sitio público en
// shared/store/preview/preview.types.ts (proyecto carpinteriacillat_frontend_web) — son dos
// proyectos separados, no pueden importarse un type el uno al otro, así que este archivo es la
// única fuente de verdad de "qué le mando" del lado del intranet. Si el contrato cambia, se
// cambia en LOS DOS lados a la vez.
//
// REGLA DE ORO: "fields" va en el idioma del SITIO PÚBLICO (ej. "fix", "label", "title"), no en
// el idioma interno de este proyecto (ej. "sectionimage_fix", "sectionbutton_label"). Cada
// formulario (`ui/form/*.tsx`) traduce sus propios campos al armar el payload — ver
// section-form.tsx como referencia. "fields" es parcial: solo lo que ese formulario edita.

export type PreviewEntity =
  | 'navigation'
  | 'section'
  | 'section_button'
  | 'section_image'
  | 'section_item'
  | 'section_item_detail'
  | 'testimony'
  /** Singleton, como 'navigation' pero sin id — solo existe una fila de footer_settings. */
  | 'footer'

export type PreviewPayload = {
  entity: PreviewEntity
  /** Ausente/null = registro nuevo, todavía sin guardar (o 'footer', que no tiene id). */
  id: number | null
  /**
   * Cada formulario manda SOLO la clave que ya tiene a mano en su propio estado — el sitio
   * público resuelve solo, buscando en su árbol ya cargado, a qué navegación/sección pertenece:
   *   - entity "navigation"/"footer":                             ninguna
   *   - entity "section":                                        id_navigation
   *   - entity "section_button"/"section_image"/"section_item"/"testimony": id_section
   *   - entity "section_item_detail":                             id_section_item
   */
  id_navigation?: number
  id_section?: number
  id_section_item?: number
  fields: Record<string, unknown>
}

/**
 * "Llevame a tal lugar" SIN ningún registro de por medio — para pantallas que no editan ni
 * muestran contenido del sitio (ej. Mensajes de Contacto, la lista de Navegaciones). Lo manda
 * el propio widget según la ruta del intranet (ver landing-preview.routes.ts), no cada página.
 *   - navigationUrl: página del sitio a montar (ausente = se queda en la que ya estaba).
 *   - anchorId:      id del DOM al que hacer scroll (ausente = arriba de todo).
 *   - label:         solo para el header del panel — el sitio web lo ignora.
 */
export type PreviewFocus = {
  navigationUrl?: string
  anchorId?: string
  label: string
}

/** Lo que el intranet le manda al iframe — copia de `PreviewInboundMessage` en `preview.types.ts` del otro proyecto (sin "ping"). */
export type PreviewOutboundMessage =
  | { type: 'preview'; payload: PreviewPayload }
  | { type: 'focus'; focus: PreviewFocus }

/** Lo que manda el sitio web de vuelta — copia de `PreviewOutboundMessage` en `preview.types.ts` del otro proyecto. */
export type PreviewInboundAck =
  | { source: 'cillat-web-preview'; type: 'ready' }
  | { source: 'cillat-web-preview'; type: 'active-url'; navigationUrl: string }
