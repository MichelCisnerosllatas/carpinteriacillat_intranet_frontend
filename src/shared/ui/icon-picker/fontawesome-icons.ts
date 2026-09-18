// src/shared/ui/icon-picker/fontawesome-icons.ts
//
// Datos reales de Font Awesome Free (misma versión que usa el proyecto web público — ver
// scripts/generate-fontawesome-icons.mjs). El selector de iconos (`IconPicker`) solo puede
// ofrecer nombres que de verdad existen en ese paquete, para que lo que el usuario elige acá
// se pueda pintar tal cual en el sitio.
import rawIcons from '@/shared/config/data/fontawesome-free-icons.json'

export type FaStyle = 'solid' | 'regular' | 'brands'

export const FA_STYLE_LABELS: Record<FaStyle, string> = {
  solid: 'Solid',
  regular: 'Regular',
  brands: 'Brands',
}

export interface FaSvgData {
  width: number
  height: number
  path: string
}

export interface FaIconEntry {
  name: string
  label: string
  styles: FaStyle[]
  terms: string[]
  svgs: Partial<Record<FaStyle, FaSvgData>>
}

type RawIcon = { n: string; l: string; s: FaStyle[]; t: string[]; p: Partial<Record<FaStyle, [number, number, string]>> }

export const FA_ICONS: FaIconEntry[] = (rawIcons as RawIcon[]).map((r) => ({
  name: r.n,
  label: r.l,
  styles: r.s,
  terms: r.t,
  svgs: Object.fromEntries(
    Object.entries(r.p).map(([style, [width, height, path]]) => [style, { width, height, path }])
  ) as FaIconEntry['svgs'],
}))

const BY_NAME = new Map(FA_ICONS.map((icon) => [icon.name, icon]))

export function getFaIcon(name: string): FaIconEntry | undefined {
  return BY_NAME.get(name)
}

/** "fa-solid fa-phone" (o el viejo "fas fa-phone") → `{ style: 'solid', name: 'phone' }`. `null` si no matchea el formato o el icono/estilo no existe realmente en el paquete. */
export function parseFaIconValue(value: string | null | undefined): { style: FaStyle; name: string } | null {
  if (!value) return null
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length !== 2) return null

  const STYLE_ALIASES: Record<string, FaStyle> = {
    'fa-solid': 'solid', fas: 'solid',
    'fa-regular': 'regular', far: 'regular',
    'fa-brands': 'brands', fab: 'brands',
  }
  const [stylePart, namePart] = parts
  const style = STYLE_ALIASES[stylePart]
  if (!style || !namePart.startsWith('fa-')) return null

  const name = namePart.slice(3)
  const icon = BY_NAME.get(name)
  if (!icon || !icon.svgs[style]) return null

  return { style, name }
}

export function buildFaIconValue(style: FaStyle, name: string): string {
  return `fa-${style} fa-${name}`
}
