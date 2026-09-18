import { buildImageUrl } from '@/shared/lib/images'

// Delega en `buildImageUrl` (única fuente de verdad): detecta si `patch` ya es una URL
// absoluta (algunos registros la traen así, ej. imágenes de muestra en un dominio externo)
// y solo antepone el storage local cuando de verdad es una ruta relativa.
export function getImageUrl(patch: string): string {
  return buildImageUrl(patch) ?? ''
}

export function getImageDisplayName(item: { image_name: string | null; image_patch: string }): string {
  if (item.image_name) return item.image_name
  return item.image_patch.split('/').pop() ?? item.image_patch
}

/**
 * Carpeta contenedora de una imagen a partir de su ruta de storage.
 * "images/muebles/2024/silla.jpg" → "muebles/2024" — quita el nombre de archivo
 * y el segmento raíz "images" (no es una carpeta elegible, es el punto de partida).
 * Devuelve '' cuando el archivo vive directo en la raíz.
 */
export function getImageFolder(patch: string): string {
  const segments = patch.split('/').filter(Boolean)
  segments.pop()
  if (segments[0] === 'images') segments.shift()
  return segments.join('/')
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
