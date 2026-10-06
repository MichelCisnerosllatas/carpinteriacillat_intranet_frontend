// src/widgets/landing-preview/landing-preview.routes.ts
import type { PreviewFocus } from './landing-preview.types'

// Este archivo responde una sola pregunta: "¿en esta ruta va el panel de vista previa?". Solo
// datos, sin React — así agregar/quitar un módulo del alcance es un solo renglón, sin tener
// que entender el resto del widget.
//
// Alcance actual: TODO el grupo "Sitio Web" del sidebar (ver src/shared/config/sidebar-data.ts)
// — listas, detalles, crear/editar, settings, reorder. No solo las páginas de edición: el
// widget también sirve para simplemente mirar el sitio real mientras se navega el intranet, y
// arranca colapsado (ver preview-store.ts) para no ser intrusivo donde todavía no hay nada que
// previsualizar en caliente (ej. una lista). Fuera de alcance: Muebles (ya no vive en este
// grupo, se movió a "Comercial").
export const LANDING_PREVIEW_ROUTE_PATTERNS: RegExp[] = [
  /^\/navigations(\/|$)/,
  /^\/footer(\/|$)/,
  /^\/contact-messages(\/|$)/,
  /^\/sections(\/|$)/,
  /^\/section-buttons(\/|$)/,
  /^\/section-images(\/|$)/,
  /^\/section-items(\/|$)/,
  /^\/section-item-details(\/|$)/,
  /^\/testimony(\/|$)/,
  /^\/typesections(\/|$)/,
]

export function isLandingPreviewRoute(pathname: string): boolean {
  return LANDING_PREVIEW_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
}

// Segunda pregunta: "en esta ruta, ¿a dónde va el preview por su cuenta?". SOLO para pantallas
// donde ninguna página manda un PreviewPayload (ni form ni detalle) — si se agregara una ruta
// que sí lo manda, el foco (que el widget postea DESPUÉS que la página, ver
// use-landing-preview-route-focus.ts) pisaría ese payload. Por eso /footer no está acá: su
// form ya lleva el preview al footer solo.
const LANDING_PREVIEW_ROUTE_FOCUS: { pattern: RegExp; focus: PreviewFocus }[] = [
  { pattern: /^\/navigations\/?$/, focus: { navigationUrl: '/', label: 'Navegaciones' } },
  { pattern: /^\/navigations\/reorder\/?$/, focus: { navigationUrl: '/', label: 'Navegaciones' } },
  { pattern: /^\/contact-messages(\/|$)/, focus: { navigationUrl: '/', anchorId: 'contacto', label: 'Contacto' } },
]

export function getLandingPreviewRouteFocus(pathname: string): PreviewFocus | null {
  return LANDING_PREVIEW_ROUTE_FOCUS.find(({ pattern }) => pattern.test(pathname))?.focus ?? null
}
