/**
 * `sectionitem_type` es texto libre en el backend (no un enum estricto), pero en el form se
 * ofrece como <Select> con estas opciones sugeridas + posibilidad de dejarlo vacío.
 *
 * Son los valores REALES que usa `SectionItemSeeder.php` en el backend (verificados ahí, no
 * adivinados) — cada uno corresponde a cómo el sitio web filtra/interpreta los items de un
 * `typesection_key` específico. Ver también `SECTION_ITEM_TYPE_FIELDS` más abajo, que dice qué
 * campos del form tienen sentido para cada uno de estos valores.
 *
 *   stat          -> estadísticas del hero ("15 años de experiencia")
 *   feature       -> características/diferenciales (feature_grid)
 *   service       -> servicios (service_grid, service_carousel)
 *   category      -> categorías con sub-lista de detalles (category_grid, item.details)
 *   value         -> valores institucionales (value_grid)
 *   mission       -> misión institucional (value_grid — antes "statement" por error, el
 *                    frontend web solo busca item_type "mission" exacto)
 *   vision        -> visión institucional (value_grid — mismo caso que "mission")
 *   discipline    -> disciplinas del equipo (team_grid)
 *   milestone     -> hitos de la historia (history_carousel)
 *   statement     -> testimonios (testimonial_carousel)
 *   step          -> pasos del proceso (process)
 *   phone         -> teléfono de contacto (contact)
 *   whatsapp      -> botón flotante de WhatsApp de TODO el sitio (Footer.tsx del frontend
 *                    web) — no el CTA de la card de Contacto, ese es un section_button aparte
 *   email         -> correo de contacto (contact)
 *   branch        -> dirección + horario + coordenadas de un local (contact) — un solo item
 *                    reúne los tres datos, por eso lleva `latitude`/`longitude`
 *   showcase      -> servicio destacado del hero acordeón (service_showcase): título,
 *                    descripción, label = texto del botón y link = a dónde lleva el botón.
 *                    Sus fotos son section-images con `id_section_item` de este item.
 *   word          -> palabra de la cinta animada (marquee): solo usa el título
 */
export const SECTION_ITEM_TYPES: { value: string; label: string }[] = [
  { value: 'stat', label: 'Estadística' },
  { value: 'feature', label: 'Característica' },
  { value: 'service', label: 'Servicio' },
  { value: 'category', label: 'Categoría' },
  { value: 'value', label: 'Valor institucional' },
  { value: 'mission', label: 'Misión' },
  { value: 'vision', label: 'Visión' },
  { value: 'discipline', label: 'Disciplina' },
  { value: 'milestone', label: 'Hito / historia' },
  { value: 'statement', label: 'Testimonio' },
  { value: 'step', label: 'Paso de proceso' },
  { value: 'phone', label: 'Teléfono (contacto)' },
  { value: 'whatsapp', label: 'WhatsApp (contacto)' },
  { value: 'email', label: 'Correo (contacto)' },
  { value: 'branch', label: 'Local / sucursal (contacto)' },
  { value: 'showcase', label: 'Servicio destacado (hero)' },
  { value: 'word', label: 'Palabra de la cinta' },
]

/**
 * Tipos "de identidad" — el frontend web los ubica buscando `item_type` (y en el caso de
 * contacto, también `sectionitem_key`) EXACTO, uno por uno (ver `getContactItem.ts` y
 * `WeValuesSection.tsx`: `items.find(i => i.item_type === "mission")`, etc.). Si el admin
 * cambiara el "Tipo" o la "Clave interna" de uno de estos, el sitio dejaría de encontrarlo —
 * mismo tipo de bug que ya causó que Misión/Visión nunca se pintaran (ver seeder). Por eso,
 * al editar un item de uno de estos tipos, el form oculta esos dos campos en vez de solo
 * deshabilitarlos: no hay ninguna razón legítima para tocarlos desde acá.
 */
export const SECTION_ITEM_IDENTITY_TYPES = new Set(['phone', 'whatsapp', 'email', 'branch', 'mission', 'vision'])

/** Un campo del form de section-items, para el mapa de visibilidad de abajo. */
export type SectionItemField =
  | 'key' | 'title' | 'subtitle' | 'description' | 'label' | 'value' | 'suffix'
  | 'icon' | 'variant' | 'link' | 'rating' | 'location'

/**
 * Qué campos tienen sentido en el form según `sectionitem_type` — evita mostrar 12 campos
 * cuando un tipo solo usa 4 (ej. "phone" no necesita título/subtítulo/ubicación/valoración).
 * Construido a partir de lo que cada tipo REALMENTE llena en `SectionItemSeeder.php` y lee su
 * componente consumidor en `carpinteriacillat_frontend_web` (no es una suposición):
 *
 *   - `value`: `variant` sí aplica (accent color, ver WeValuesSection.tsx: resolveAccent(item.variant))
 *   - `whatsapp`: `variant` también aplica, pero NO es un estilo visual — es la posición del
 *     botón flotante de WhatsApp que se ve en todo el sitio (ver Footer.tsx / findFloatingWhatsapp.ts
 *     en el frontend web). Se reutilizó este item en vez de crear una tabla/columna nueva.
 *   - `statement` (testimonios): incluye `subtitle` porque SectionTestimonial.tsx lee el rol
 *     ahí (aunque el seeder hoy lo pone en `label` — desalineamiento existente, no corregido
 *     acá para no tocar más de lo pedido)
 *   - `branch`: `location` (latitud/longitud) es el único tipo que la usa
 *
 * Cuando el tipo es "Sin tipo" o uno no listado acá, se muestran TODOS los campos — es el
 * fallback seguro para no ocultar algo que sí se necesita en un caso no contemplado.
 */
// Revisado contra los componentes de la web (qué campo del item lee cada uno).
// Un campo oculto NO se borra: si el item ya tenía un valor, se sigue guardando igual.
export const SECTION_ITEM_TYPE_FIELDS: Record<string, SectionItemField[]> = {
  stat:       ['label', 'value', 'suffix'],                    // Section1.tsx: value + suffix + label
  feature:    ['title', 'description', 'icon'],                // Section4.tsx
  service:    ['title', 'label', 'description', 'icon'],       // Section2.tsx (label = etiqueta) / ServiceGrid.tsx
  category:   ['title', 'icon'],                               // ServiceCategoryGrid.tsx (+ sub-lista de detalles)
  value:      ['title', 'icon', 'variant'],                    // WeValuesSection.tsx
  mission:    ['title', 'description', 'icon', 'variant'],     // WeValuesSection.tsx (variant = color de acento)
  vision:     ['title', 'description', 'icon', 'variant'],     // WeValuesSection.tsx (variant = color de acento)
  discipline: ['title', 'icon'],                               // WeTeamSection.tsx
  milestone:  ['title', 'description'],                        // hoy la web arma la historia con las imágenes
  statement:  ['title', 'subtitle', 'label', 'description', 'rating'],
  step:       ['label', 'title', 'description', 'icon'],       // SectionProcess.tsx: label = número del paso
  phone:      ['value'],                                       // SectionContact.tsx: solo el número
  whatsapp:   ['value', 'variant'],                            // findFloatingWhatsapp.ts: número + posición
  email:      ['value'],                                       // SectionContact.tsx: solo el correo
  branch:     ['label', 'value', 'location'],                  // SectionContact.tsx: horario, dirección y mapa
  showcase:   ['title', 'description', 'label', 'link'],
  word:       ['title'],                                       // ServiceMarquee.tsx: solo el título
}

/** Color de acento de las tarjetas de Nosotros (valores, misión, visión). */
const ACCENT_OPTIONS = [
  { value: 'gold', label: 'Dorado (por defecto)' },
  { value: 'red', label: 'Rojo' },
]

/** Opciones fijas para `sectionitem_variant` cuando el tipo elegido le da un significado
 * puntual (en vez de texto libre) — ver notas de cada tipo arriba. Un tipo ausente de este
 * mapa sigue mostrando el campo como texto libre (ej. si algún día se necesita otro valor). */
export const SECTION_ITEM_VARIANT_OPTIONS: Partial<Record<string, { value: string; label: string }[]>> = {
  value: ACCENT_OPTIONS,
  // Misión y Visión también usan el color de acento (WeValuesSection.tsx: resolveAccent)
  mission: ACCENT_OPTIONS,
  vision: ACCENT_OPTIONS,
  whatsapp: [
    { value: 'bottom-right', label: 'Inferior derecha (por defecto)' },
    { value: 'bottom-left', label: 'Inferior izquierda' },
    { value: 'bottom-center', label: 'Inferior centro' },
    { value: 'top-right', label: 'Superior derecha' },
    { value: 'top-left', label: 'Superior izquierda' },
  ],
}

/** Etiqueta del campo "Variante" en el form, según lo que ese tipo realmente representa. */
export function sectionItemVariantLabel(type: string | undefined): string {
  if (type === 'whatsapp') return 'Posición del botón flotante'
  if (type === 'value' || type === 'mission' || type === 'vision') return 'Color de acento'
  return 'Variante'
}

/** Etiqueta del campo "Título" en el form, según lo que ese tipo realmente representa. */
export function sectionItemTitleLabel(type: string | undefined): string {
  if (type === 'word') return 'Palabra'
  return 'Título'
}

/** Etiqueta del campo "Label" en el form, según lo que ese tipo realmente representa. */
export function sectionItemLabelLabel(type: string | undefined): string {
  if (type === 'showcase') return 'Texto del botón'
  if (type === 'stat') return 'Texto (ej. Años de experiencia)'
  if (type === 'step') return 'Número del paso (ej. 01)'
  if (type === 'service') return 'Etiqueta'
  if (type === 'branch') return 'Horario de atención'
  return 'Label'
}

/** Etiqueta del campo "Valor" en el form, según lo que ese tipo realmente representa. */
export function sectionItemValueLabel(type: string | undefined): string {
  if (type === 'stat') return 'Número'
  if (type === 'phone') return 'Teléfono'
  if (type === 'whatsapp') return 'Número de WhatsApp'
  if (type === 'email') return 'Correo'
  if (type === 'branch') return 'Dirección'
  return 'Valor'
}

/** Etiqueta del campo "Enlace" en el form, según lo que ese tipo realmente representa. */
export function sectionItemLinkLabel(type: string | undefined): string {
  if (type === 'showcase') return 'Enlace del botón (ej. /gallery?cat=Restauración)'
  return 'Enlace'
}

/** Clases de posicionamiento absoluto para la vista previa del botón flotante — mismos 5
 * valores y mismo criterio que `WHATSAPP_POSITION_CLASS` en `Footer.tsx` del frontend web
 * (proyecto `carpinteriacillat_frontend_web`), solo que en miniatura dentro de un mockup. */
export const WHATSAPP_POSITION_PREVIEW_CLASS: Record<string, string> = {
  'bottom-right': 'bottom-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
  'top-right': 'top-2 right-2',
  'top-left': 'top-2 left-2',
}
