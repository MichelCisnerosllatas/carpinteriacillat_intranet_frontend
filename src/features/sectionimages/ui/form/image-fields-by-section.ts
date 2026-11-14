/**
 * Cómo se ve el formulario de imagen de sección según el TIPO de la sección
 * (`type_section.typesection_key`).
 *
 * Por qué existe: cada sección de la web usa distintos textos de la foto. Ej. en «Historia»
 * la Etiqueta es el año del hito, y en el encabezado (page_hero) no se usa ningún texto.
 * Con este mapa el formulario muestra solo lo que la web usa, con nombres que el admin entiende.
 *
 * Reglas:
 *   - Tipo que NO está en el mapa → el formulario de siempre (sin cambios).
 *   - Ocultar un campo solo cambia lo que se ve: al guardar se envía igual que antes.
 *   - El hero de Servicios y el carrusel de categorías tienen su propio modo (ver `grouped/`):
 *     NO se agregan aquí.
 *
 * Cómo agregar un tipo nuevo: copia uno de abajo, cambia la clave por el `typesection_key`
 * y ajusta qué campos se ocultan (`hidden`) y qué etiquetas cambian (`fields`).
 */

/** Campos de texto de la foto. 'link' = Enlace + Texto del enlace (van juntos). */
export type ImageTextFieldName = 'title' | 'description' | 'label' | 'link' | 'variant'

/** Textos propios de un campo para un tipo de sección (lo que no se indique queda como siempre). */
export interface ImageTextFieldOverride {
  label?: string       // nombre del campo
  placeholder?: string // texto gris de ejemplo
  tip?: string         // ayuda del ícono (i) junto al nombre
}

export interface ImageFieldsConfig {
  /** Aviso que se muestra arriba del formulario. */
  notice?: string
  /** true = no se muestra la tarjeta «Textos» (la sección no usa ningún texto de la foto). */
  hideTexts?: boolean
  /** true = no se muestra «Item de la sección» (la sección no agrupa fotos por item). */
  hideItem?: boolean
  /** Campos de texto que no se muestran. */
  hidden?: ImageTextFieldName[]
  /** Etiquetas/ayudas distintas para algunos campos. */
  fields?: Partial<Record<ImageTextFieldName, ImageTextFieldOverride>>
}

export const IMAGE_FIELDS_BY_SECTION: Record<string, ImageFieldsConfig> = {
  // «Historia» de Nosotros: cada foto es un hito del carrusel.
  history_carousel: {
    hidden: ['variant'],
    fields: {
      title:       { label: 'Título del hito', placeholder: 'Ej: Abrimos nuestro primer taller', tip: 'Título grande que se muestra sobre el hito.' },
      description: { label: 'Texto del hito', placeholder: 'Cuente qué pasó en esta etapa', tip: 'Texto que acompaña al hito.' },
      label:       { label: 'Año o etapa', placeholder: 'Ej: 2010', tip: 'Si lo deja vacío, se muestra «Etapa 1, 2…».' },
    },
  },

  // «Nuestro equipo» de Nosotros: solo se usa la primera foto.
  team_grid: {
    notice: 'Esta sección usa solo la PRIMERA imagen (foto del equipo).',
    hidden: ['label', 'variant', 'link'],
  },

  // «Quiénes somos» de Nosotros: carrusel de fotos al lado del texto.
  text_media: {
    hidden: ['label', 'variant'],
    fields: {
      title:       { label: 'Título de la foto', tip: 'Se muestra en el pie de la foto, dentro del carrusel.' },
      description: { label: 'Descripción (pie de foto)', tip: 'Texto corto debajo del título de la foto.' },
    },
  },

  // Encabezado de página (ej. Nosotros): solo la imagen de fondo.
  page_hero: {
    // El texto alternativo es un dato de la imagen (al subirla se arma con el nombre del archivo).
    notice: 'Esta sección solo usa la imagen y su texto alternativo (viene de la imagen elegida: al subirla se toma del nombre del archivo).',
    hideTexts: true,
    hideItem: true,
  },
}

/** Configuración del formulario para el tipo de sección, o null si se usa el formulario de siempre. */
export function getImageFieldsConfig(typesectionKey: string | null | undefined): ImageFieldsConfig | null {
  if (!typesectionKey) return null
  return IMAGE_FIELDS_BY_SECTION[typesectionKey] ?? null
}
