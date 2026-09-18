// src/shared/lib/images/buildImageUrl.ts

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

// Acepta "http://", "https://" y protocolo-relativo "//host/..." — cualquiera de los tres
// ya es una URL absoluta y no debe concatenarse con el storage local.
const ABSOLUTE_URL_RE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i

/**
 * Resuelve el `path` de una imagen a una URL que un <img> pueda cargar.
 *
 * El backend no es consistente: algunos registros guardan una ruta relativa al storage
 * propio ("images/muebles/silla.jpg") y otros ya traen una URL absoluta completa (imágenes
 * de muestra, assets de un CDN externo, etc. — ej. "https://demo.../fotocillat4.jpg" o
 * "https://placehold.co/1200x800?text=..."). Concatenar siempre con `IMAGE_BASE_URL` rompía
 * este segundo caso: "http://.../storage/https://otro-dominio/..." — una URL inválida.
 *
 * Por eso primero se detecta si `path` YA es absoluta (empieza con un esquema tipo
 * "http://", "https://" o protocolo-relativo "//") y, de ser así, se devuelve tal cual, sin
 * tocarla. Solo se antepone `IMAGE_BASE_URL` cuando de verdad es una ruta relativa.
 */
export const buildImageUrl = (path?: string | null): string | null => {
  if (!path) return null

  const trimmed = path.trim()
  if (!trimmed) return null

  if (ABSOLUTE_URL_RE.test(trimmed)) return trimmed

  return `${IMAGE_BASE_URL.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`
}