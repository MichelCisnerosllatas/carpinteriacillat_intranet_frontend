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
  /**
   * Entity "section", además de sus campos de siempre:
   *   - display_settings: objeto { "<clave>": valor } COMPLETO y resuelto (todas las claves del
   *     catálogo, lo arma la pestaña "Apariencia" con schema + valores del formulario). La web lo
   *     aplica a esa sección. Reemplaza al viejo `card_settings`.
   *   - section_title/subtitle/description: en null si `header.show_*` está apagado.
   * Si la página montada ya pertenece a la navegación de esa sección (ej. /gallery/<id> y la
   * sección es de /gallery), la web NO cambia de página al recibir el payload.
   */
  fields: Record<string, unknown>
}

/**
 * "Llevame a tal lugar" SIN ningún registro de por medio — para pantallas que no editan ni
 * muestran contenido del sitio (ej. Mensajes de Contacto, la lista de Navegaciones). Lo manda
 * el propio widget según la ruta del intranet (ver landing-preview.routes.ts), no cada página.
 * También lo usa la pestaña "Apariencia" para cambiar entre Listado y Detalle.
 *   - navigationUrl: página del sitio a montar (ausente = se queda en la que ya estaba). Puede
 *                    ser `/gallery/<id_web_work>` (detalle de un trabajo): si el id no existe en
 *                    `site.works` la web usa el primer trabajo; si no hay trabajos, la galería.
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
  /**
   * Resalta un elemento de la página montada: la web busca `[data-el="<element>"]` (si hay
   * varios, el primero visible), le hace scrollIntoView al centro y le pone un contorno de acento
   * ~1.6 s. `element: null` quita el resaltado. Si no lo encuentra (ej. oculto por un toggle
   * apagado), no hace nada. En el intranet va por un canal aparte (`postHighlight` en
   * preview-store.ts): NO pisa el último preview/focus guardado.
   * `sectionId`: la web busca primero dentro de `#section-<id>` (los `data-el` se repiten entre
   * secciones, ej. "header-subtitle"); si ahí no está (ej. detalle /gallery/<id>, que no tiene
   * contenedor de sección), busca en toda la página.
   */
  | { type: 'highlight'; element: string | null; sectionId?: number | null }

/** Los mensajes que se guardan como "último" en preview-store (`lastMessage`) — el highlight va aparte. */
export type PreviewStateMessage = Exclude<PreviewOutboundMessage, { type: 'highlight' }>

/** Lo que manda el sitio web de vuelta — copia de `PreviewOutboundMessage` en `preview.types.ts` del otro proyecto. */
export type PreviewInboundAck =
  | { source: 'cillat-web-preview'; type: 'ready' }
  | { source: 'cillat-web-preview'; type: 'active-url'; navigationUrl: string }
