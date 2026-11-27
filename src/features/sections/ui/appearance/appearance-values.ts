// Funciones puras de la pestaña "Apariencia" (sin React): resolver valores con schema + guardado,
// armar el PATCH con solo lo que cambió, contadores y filtros. Las reglas de `resolveFieldValue`
// son las MISMAS que aplica el backend (SectionDisplaySettings::resolve) — así la vista previa
// muestra exactamente lo que se verá al guardar.

import type {
  SectionDisplayListItem,
  SectionDisplayPage,
  SectionDisplaySchemaField,
  SectionDisplaySchemaGroup,
  SectionDisplaySettingsSchema,
} from '../../model/sectionget.dto'

export type ListField = Extract<SectionDisplaySchemaField, { type: 'list' }>

/**
 * Borrador del editor: valor editado por clave, tal cual lo escribe el admin (ej. el texto a
 * medio tipear). `null` = "Restablecer" (volver al valor por defecto). Clave ausente = sin tocar.
 */
export type AppearanceDraft = Record<string, unknown>

/** Un grupo con los campos que se muestran (ya filtrados por página/búsqueda). */
export type AppearanceGroupView = { group: SectionDisplaySchemaGroup; fields: SectionDisplaySchemaField[] }

const isEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Página de la web donde se ve el grupo (null = listado). */
export const groupPage = (group: SectionDisplaySchemaGroup): SectionDisplayPage => group.page ?? 'listing'

export const hasDetailGroups = (schema: SectionDisplaySettingsSchema) =>
  schema.groups.some((g) => groupPage(g) === 'detail')

/** Default de una lista: el que mande el backend o, si no viene, sus items en orden y todos visibles. */
export function listDefault(field: ListField): SectionDisplayListItem[] {
  if (Array.isArray(field.default)) return field.default.map((i) => ({ ...i }))
  return field.items.map((i) => ({ key: i.key, label: i.label, visible: true }))
}

export function fieldDefault(field: SectionDisplaySchemaField): unknown {
  return field.type === 'list' ? listDefault(field) : field.default
}

/** Lista: items válidos en su orden (sin repetir, label vacío → por defecto) + los que falten al final. */
function resolveList(field: ListField, raw: unknown): SectionDisplayListItem[] {
  if (!Array.isArray(raw)) return listDefault(field)
  const defaults = new Map(field.items.map((i) => [i.key, i.label]))
  const seen = new Set<string>()
  const out: SectionDisplayListItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const { key, label, visible } = row as Partial<SectionDisplayListItem>
    if (typeof key !== 'string' || !defaults.has(key) || seen.has(key)) continue
    seen.add(key)
    let text = typeof label === 'string' && label.trim() !== '' ? label : defaults.get(key) ?? key
    if (field.label_max) text = text.slice(0, field.label_max)
    out.push({ key, label: text, visible: typeof visible === 'boolean' ? visible : true })
  }
  for (const item of field.items) {
    if (!seen.has(item.key)) out.push({ key: item.key, label: item.label, visible: true })
  }
  return out
}

/** Valor final de un campo a partir de lo que haya (guardado o borrador), con las reglas del backend. */
export function resolveFieldValue(field: SectionDisplaySchemaField, raw: unknown): unknown {
  switch (field.type) {
    case 'toggle':
      return typeof raw === 'boolean' ? raw : field.default
    case 'number': {
      const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN
      if (!Number.isFinite(n)) return field.default
      let value = Math.round(n)
      if (field.min !== undefined) value = Math.max(field.min, value)
      if (field.max !== undefined) value = Math.min(field.max, value)
      return value
    }
    case 'select':
      return field.options.some((o) => o.value === raw) ? raw : field.default
    case 'text':
    case 'textarea': {
      if (typeof raw !== 'string') return field.default
      const value = field.max ? raw.slice(0, field.max) : raw
      if (value.trim() === '' && !field.allow_empty) return field.default
      return value
    }
    case 'list':
      return resolveList(field, raw)
  }
}

/** Valor "crudo" que muestra el control (lo del borrador si se tocó; si no, lo guardado). */
export function rawFieldValue(field: SectionDisplaySchemaField, saved: Record<string, unknown>, draft: AppearanceDraft): unknown {
  if (field.key in draft) return draft[field.key] === null ? fieldDefault(field) : draft[field.key]
  return field.key in saved ? saved[field.key] : fieldDefault(field)
}

export function effectiveFieldValue(field: SectionDisplaySchemaField, saved: Record<string, unknown>, draft: AppearanceDraft): unknown {
  return resolveFieldValue(field, rawFieldValue(field, saved, draft))
}

/** { clave: valor } COMPLETO y resuelto — lo que va en `fields.display_settings` de la vista previa. */
export function resolveAll(schema: SectionDisplaySettingsSchema, saved: Record<string, unknown>, draft: AppearanceDraft): Record<string, unknown> {
  return Object.fromEntries(schema.fields.map((f) => [f.key, effectiveFieldValue(f, saved, draft)]))
}

/** ¿El valor actual es el de fábrica? (para mostrar o no el botón ↺). */
export const isDefaultValue = (field: SectionDisplaySchemaField, value: unknown) => isEqual(value, fieldDefault(field))

/**
 * Cuerpo de `display_settings` del PATCH: SOLO las claves que cambiaron respecto de lo cargado.
 * Si el nuevo valor es el de fábrica se manda `null` (el backend borra la clave y queda el default).
 */
export function buildPatch(schema: SectionDisplaySettingsSchema, saved: Record<string, unknown>, draft: AppearanceDraft): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  for (const field of schema.fields) {
    if (!(field.key in draft)) continue
    const before = resolveFieldValue(field, saved[field.key])
    const after = effectiveFieldValue(field, saved, draft)
    if (isEqual(before, after)) continue
    patch[field.key] = isDefaultValue(field, after) ? null : after
  }
  return patch
}

/** "N de M visibles" de un grupo: solo cuenta los interruptores. */
export function countVisible(fields: SectionDisplaySchemaField[], values: Record<string, unknown>) {
  const toggles = fields.filter((f) => f.type === 'toggle')
  return { on: toggles.filter((f) => values[f.key] === true).length, total: toggles.length }
}

const normalize = (text: string | null | undefined) =>
  (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Grupos y campos a mostrar. Sin búsqueda: los grupos de la página elegida (todos si la sección no
 * tiene página de detalle). Con búsqueda: busca en TODAS las páginas por nombre/ayuda del campo
 * (o nombre del grupo) — así el admin encuentra un elemento aunque no sepa en qué página está.
 */
export function filterGroups(
  schema: SectionDisplaySettingsSchema,
  { page, query }: { page: SectionDisplayPage; query: string },
): AppearanceGroupView[] {
  const q = normalize(query)
  const usePages = hasDetailGroups(schema)
  const views: AppearanceGroupView[] = []
  for (const group of schema.groups) {
    const all = schema.fields.filter((f) => f.group === group.key)
    if (!q) {
      if (usePages && groupPage(group) !== page) continue
      if (all.length) views.push({ group, fields: all })
      continue
    }
    const groupMatches = normalize(group.label).includes(q)
    const fields = groupMatches ? all : all.filter((f) => normalize(f.label).includes(q) || normalize(f.help).includes(q))
    if (fields.length) views.push({ group, fields })
  }
  return views
}
