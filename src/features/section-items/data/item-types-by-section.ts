/**
 * Qué tipo(s) de item (`sectionitem_type`) puede tener cada tipo de sección
 * (`type_section.typesection_key`).
 *
 * Por qué existe: la web busca los items de cada sección por su tipo exacto
 * (ej. la cinta de palabras solo pinta items 'word'). Si el admin elige otro tipo,
 * el item no aparece en la web. Por eso el formulario de item:
 *   - 1 tipo permitido   → lo FIJA (no muestra el select).
 *   - varios permitidos  → el select solo ofrece esos.
 *   - sección no listada → select libre (como siempre).
 *
 * Cómo agregar una sección nueva:
 *   1. Busca en la web (carpinteriacillat_frontend_web, SectionRenderer.tsx) qué componente
 *      pinta ese `section_type` y qué `item_type` lee.
 *   2. Agrega una línea abajo: `typesection_key: ['tipo']` (o varios tipos).
 *   3. Si el tipo es nuevo, agrégalo también en SECTION_ITEM_TYPES y SECTION_ITEM_TYPE_FIELDS
 *      (data.ts) con los campos que ese componente usa.
 */

// Se importa directo del archivo de constantes (no del index de grouped) para no cargar componentes aquí.
import { CATEGORY_COVERFLOW_TYPE_KEY, SERVICE_SHOWCASE_TYPE_KEY } from '@/features/sectionimages/grouped/special-sections.constants'

export const ITEM_TYPES_BY_SECTION: Record<string, string[]> = {
  // Hero acordeón de Servicios. Ya lo resuelve el modo especial (ui/form/showcase);
  // está acá solo para documentar.
  [SERVICE_SHOWCASE_TYPE_KEY]: ['showcase'],

  // Carrusel «Muebles a medida» de Servicios: cada item es una categoría (tarjeta).
  // Ya lo resuelve el modo especial (ui/form/category); está acá para fijar el tipo.
  [CATEGORY_COVERFLOW_TYPE_KEY]: ['category'],

  // Cinta de palabras animada de Servicios: cada item es una palabra.
  marquee: ['word'],

  // Hero del Inicio: los números ("15+ años de experiencia").
  hero: ['stat'],

  // "¿Por qué elegirnos?" del Inicio: tarjetas con ícono, título y texto.
  feature_grid: ['feature'],

  // "Nuestro proceso" del Inicio: pasos numerados.
  process: ['step'],

  // Carrusel de servicios (Inicio y Servicios).
  service_carousel: ['service'],

  // "Nuestro equipo" de Nosotros: disciplinas (ícono + nombre).
  team_grid: ['discipline'],

  // Carrusel de historia de Nosotros: hitos.
  history_carousel: ['milestone'],

  // Secciones viejas (por si se vuelven a crear).
  service_grid: ['service'],
  category_grid: ['category'],

  // Misión, Visión y Valores de Nosotros (un mismo bloque, 3 tipos de item).
  value_grid: ['mission', 'vision', 'value'],

  // Contacto: teléfono, botón flotante de WhatsApp, correo y local (dirección + mapa).
  contact: ['phone', 'whatsapp', 'email', 'branch'],
}

/** Tipos de item permitidos para la sección, o null si la sección no está en el mapa (select libre). */
export function getAllowedItemTypes(typesectionKey: string | null | undefined): string[] | null {
  if (!typesectionKey) return null
  return ITEM_TYPES_BY_SECTION[typesectionKey] ?? null
}

/** Tipo de item fijo de la sección (si tiene exactamente 1 permitido), o null. */
export function getFixedItemType(typesectionKey: string | null | undefined): string | null {
  const allowed = getAllowedItemTypes(typesectionKey)
  return allowed && allowed.length === 1 ? allowed[0] : null
}
